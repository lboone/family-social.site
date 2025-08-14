const admin = require("firebase-admin");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const AppError = require("../utils/appError");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

class NotificationService {
  constructor() {
    this.initialized = false;
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initializeFirebase() {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length === 0) {
        // Load service account from file if path is provided
        const fs = require("fs");
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              "Loading FIREBASE_SERVICE_ACCOUNT_KEY_PATH:",
              process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH
            );
          }
          const serviceAccount = JSON.parse(
            fs.readFileSync(
              process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
              "utf8"
            )
          );
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        } else {
          // Fallback: initialize with default credentials (if running on Google Cloud)
          admin.initializeApp();
        }
      }
      this.initialized = true;
      console.log("Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Firebase Admin SDK:", error);
      this.initialized = false;
    }
  }

  /**
   * Check if user has notifications enabled for a specific type
   * @param {Object} user - User document
   * @param {string} notificationType - Type of notification ('likes', 'comments', 'follow', 'unfollow', 'posts')
   * @returns {boolean}
   */
  isNotificationEnabled(user, notificationType) {
    if (!user.pushNotificationSettings?.pushEnabled) {
      return false;
    }

    // Special handling for post notifications
    if (notificationType === "posts") {
      return user.pushNotificationSettings.postType !== "none";
    }

    return user.pushNotificationSettings[notificationType] || false;
  }

  /**
   * Check if user should receive post notifications from a specific user
   * @param {Object} recipient - User who might receive notification
   * @param {Object} poster - User who created the post
   * @returns {boolean}
   */
  shouldReceivePostNotification(recipient, poster) {
    if (!this.isNotificationEnabled(recipient, "posts")) {
      return false;
    }

    const postType = recipient.pushNotificationSettings.postType;

    if (postType === "all") {
      return true;
    }

    if (postType === "following") {
      // Safety check: ensure following array exists
      if (!recipient.following || !Array.isArray(recipient.following)) {
        if (process.env.NODE_ENV === "development") {
          console.log(`⚠️ No following array for user ${recipient.username}`);
        }
        return false;
      }

      // Check if the poster is in the recipient's following list
      // Handle both populated objects and ObjectIds
      const isFollowing = recipient.following.some((followedUser) => {
        const followedId = followedUser._id || followedUser;
        return followedId.toString() === poster._id.toString();
      });

      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔍 ${recipient.username} following check for ${poster.username}: ${isFollowing}`
        );
        console.log(
          `🔍 Following list: ${recipient.following
            .map((f) => f.username || f)
            .join(", ")}`
        );
      }

      return isFollowing;
    }

    return false;
  }

  /**
   * Generate notification content based on type and data
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   * @returns {Object} - Notification content with title, body, and data
   */
  generateNotificationContent(type, data) {
    const { username, postCaption, action } = data;
    let title, body, clickAction;

    switch (type) {
      case "like":
        title = `${username} liked your post`;
        body = postCaption ? this.truncateText(postCaption, 100) : "No caption";
        clickAction = `/post/${data.postId}`;
        break;

      case "comment":
        title = "New Comment";
        body = `${username} commented on your post`;
        if (data.commentText) {
          body += `: "${this.truncateText(data.commentText, 50)}"`;
        }
        clickAction = `/post/${data.postId}#comment-${data.commentId}`;
        break;

      case "follow":
        title = "New Follower";
        body = `${username} started following you`;
        clickAction = `/profile/${username}`;
        break;

      case "unfollow":
        title = "Follower Update";
        body = `${username} stopped following you`;
        clickAction = `/profile/${username}`;
        break;

      case "save":
        title = "Post Saved";
        body = `${username} saved your post`;
        if (postCaption) {
          body += `: "${this.truncateText(postCaption, 50)}"`;
        }
        clickAction = `/post/${data.postId}`;
        break;

      case "new_post":
        title = "New Post";
        body = `${username} shared a new post`;
        if (postCaption) {
          body += `: "${this.truncateText(postCaption, 50)}"`;
        }
        clickAction = `/post/${data.postId}`;
        break;

      default:
        title = "Family Social";
        body = "You have a new notification";
        clickAction = "/";
    }

    const content = {
      title,
      body,
      data: {
        clickAction,
        type,
        timestamp: Date.now(),
        ...data,
      },
    };

    // Add debugging log to see what content is being generated
    if (process.env.NODE_ENV === "development") {
      console.log(`📝 Generated notification content for ${type}:`, {
        title: content.title,
        body: content.body,
        type: content.data.type,
        username: data.username,
      });
    }

    return content;
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string}
   */
  truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  }

  /**
   * Send notification to a single user
   * @param {string} fcmToken - FCM token of the recipient
   * @param {Object} notificationContent - Notification content
   * @returns {Promise<Object>}
   */
  async sendSingleNotification(fcmToken, notificationContent) {
    if (!this.initialized) {
      throw new AppError("Firebase Admin SDK not initialized", 500);
    }

    if (!fcmToken) {
      throw new AppError("FCM token is required", 400);
    }

    const message = {
      token: fcmToken,
      notification: {
        title: notificationContent.title,
        body: notificationContent.body,
      },
      data: {
        ...notificationContent.data,
        // Convert all data values to strings (FCM requirement)
        ...Object.keys(notificationContent.data).reduce((acc, key) => {
          acc[key] = String(notificationContent.data[key]);
          return acc;
        }, {}),
      },
      webpush: {
        headers: {
          TTL: "300", // Time to live in seconds
        },
        notification: {
          title: notificationContent.title,
          body: notificationContent.body,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          tag: notificationContent.data.type,
          requireInteraction: false,
          actions: [
            {
              action: "view",
              title: "View",
            },
          ],
        },
        fcm_options: {
          link: notificationContent.data.clickAction,
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      if (process.env.NODE_ENV === "development") {
        console.log("Notification sent successfully:", response);
      }
      return { success: true, messageId: response };
    } catch (error) {
      console.error("Error sending notification:", error);
      // Handle invalid FCM tokens
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        // Token is invalid, should be removed from user's record
        return { success: false, invalidToken: true, error: error.message };
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Send notifications to multiple users (batch)
   * @param {Array} tokens - Array of FCM tokens
   * @param {Object} notificationContent - Notification content
   * @returns {Promise<Object>}
   */
  async sendBatchNotifications(tokens, notificationContent) {
    if (!this.initialized) {
      throw new AppError("Firebase Admin SDK not initialized", 500);
    }

    if (!tokens || tokens.length === 0) {
      return { success: true, results: [] };
    }

    // Filter out null/undefined tokens
    const validTokens = tokens.filter((token) => token && token.trim() !== "");

    if (validTokens.length === 0) {
      return { success: true, results: [] };
    }

    const message = {
      notification: {
        title: notificationContent.title,
        body: notificationContent.body,
      },
      data: {
        ...notificationContent.data,
        // Convert all data values to strings
        ...Object.keys(notificationContent.data).reduce((acc, key) => {
          acc[key] = String(notificationContent.data[key]);
          return acc;
        }, {}),
      },
      webpush: {
        headers: {
          TTL: "300",
        },
        notification: {
          title: notificationContent.title,
          body: notificationContent.body,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          tag: notificationContent.data.type,
          requireInteraction: false,
        },
        fcm_options: {
          link: notificationContent.data.clickAction,
        },
      },
      tokens: validTokens,
    };

    try {
      // Use individual send calls instead of sendMulticast for compatibility
      const promises = validTokens.map(async (token) => {
        try {
          const singleMessage = {
            token: token,
            notification: message.notification,
            data: message.data,
            webpush: message.webpush,
          };
          const response = await admin.messaging().send(singleMessage);
          return { success: true, messageId: response, token };
        } catch (error) {
          return { success: false, error: error.message, token };
        }
      });

      const results = await Promise.all(promises);

      let successCount = 0;
      let failureCount = 0;
      const invalidTokens = [];

      results.forEach((result) => {
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          // Check if it's an invalid token error
          if (
            result.error.includes("invalid-registration-token") ||
            result.error.includes("registration-token-not-registered")
          ) {
            invalidTokens.push(result.token);
          }
          if (process.env.NODE_ENV === "development") {
            console.error(`Failed to send to token:`, result.error);
          }
        }
      });

      if (process.env.NODE_ENV === "development") {
        console.log(
          `Batch notification sent. Success: ${successCount}, Failure: ${failureCount}`
        );
      }

      return {
        success: true,
        successCount,
        failureCount,
        invalidTokens,
        results,
      };
    } catch (error) {
      console.error("Error sending batch notifications:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send unified notification (FCM + Web Push)
   * Attempts FCM first, falls back to Web Push if needed
   * @param {Object} user - User object with notification settings
   * @param {Object} notificationContent - Notification content
   * @param {string} notificationType - Type of notification
   * @returns {Promise<Object>} - Result of notification sending
   */
  async sendUnifiedNotification(user, notificationContent, notificationType) {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔄 Sending unified notification of type: ${notificationType} to user: ${user.username}`
        );
      }

      let result = { success: false };

      // Try FCM first if token is available
      if (user.pushNotificationSettings?.fcmToken) {
        if (process.env.NODE_ENV === "development") {
          console.log(`📱 Attempting FCM notification for ${user.username}`);
        }

        result = await this.sendSingleNotification(
          user.pushNotificationSettings.fcmToken,
          notificationContent
        );

        // If FCM failed due to invalid token, clean it up
        if (!result.success && result.invalidToken) {
          await User.findByIdAndUpdate(user._id, {
            $unset: { "pushNotificationSettings.fcmToken": 1 },
          });
          if (process.env.NODE_ENV === "development") {
            console.log(`🧹 Cleaned up invalid FCM token for ${user.username}`);
          }
        }
      }

      // Try Web Push if FCM failed or unavailable
      if (
        !result.success &&
        user.pushNotificationSettings?.webPushSubscription?.endpoint
      ) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `🌐 Attempting Web Push notification for ${user.username}`
          );
        }

        // TODO: Implement Web Push sending
        // For now, we'll just log that we would send via Web Push
        console.log(`📧 Would send Web Push notification to ${user.username}`);
        result = {
          success: true,
          method: "webpush",
          message: "Web Push notification would be sent (not implemented yet)",
        };
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          `📊 Unified notification result for ${user.username}:`,
          result
        );
      }

      return result;
    } catch (error) {
      console.error(
        `❌ Error in sendUnifiedNotification for ${user.username}:`,
        error
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Send like notification
   * @param {string} postId - ID of the liked post
   * @param {string} likerId - ID of the user who liked
   * @param {string} likerUsername - Username of the user who liked
   * @returns {Promise<Object>} - Result of notification sending
   */
  async sendLikeNotification(postId, likerId, likerUsername) {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `📍 Starting sendLikeNotification for post ${postId} by ${likerUsername}`
        );
      }

      // Get the post and populate owner
      const post = await Post.findById(postId).populate("user");

      if (!post) {
        if (process.env.NODE_ENV === "development") {
          console.log(`❌ Post ${postId} not found`);
        }
        return { success: false, error: "Post not found" };
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`📍 User : ${post.user}`);
      }
      const postOwner = post.user;
      if (process.env.NODE_ENV === "development") {
        console.log(
          `📍 Post owner Token: ${postOwner.pushNotificationSettings?.fcmToken}`
        );
        console.log(`📍 Post owner: ${postOwner.username}`);
      }

      // Don't send notification if user liked their own post
      if (postOwner._id.toString() === likerId.toString()) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `⏭️ Skipping self-notification for ${postOwner.username}`
          );
        }
        return { success: false, error: "Self-notification skipped" };
      }

      // Check if post owner has like notifications enabled
      if (!this.isNotificationEnabled(postOwner, "likes")) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `⏭️ Like notifications disabled for ${postOwner.username}`
          );
          console.log(`User settings:`, {
            pushEnabled: postOwner.pushNotificationSettings?.pushEnabled,
            likes: postOwner.pushNotificationSettings?.likes,
          });
        }
        return { success: false, error: "Notifications disabled" };
      }

      // Check if post owner has a valid FCM token
      if (!postOwner.pushNotificationSettings?.fcmToken) {
        if (process.env.NODE_ENV === "development") {
          console.log(`⏭️ No FCM token for ${postOwner.username}`);
        }
        return { success: false, error: "No FCM token" };
      }
      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔔 Sending notification to ${postOwner.username} with token: ${postOwner.pushNotificationSettings.fcmToken}`
        );
      }

      const notificationContent = this.generateNotificationContent("like", {
        username: likerUsername,
        postCaption: post.caption,
        postId: postId,
        likerId: likerId,
      });

      const result = await this.sendSingleNotification(
        postOwner.pushNotificationSettings.fcmToken,
        notificationContent
      );

      // If token is invalid, clean it up
      if (result.invalidToken) {
        if (process.env.NODE_ENV === "development") {
          console.log(`🧹 Cleaning up invalid token for ${postOwner.username}`);
        }
        await User.findByIdAndUpdate(postOwner._id, {
          $unset: { "pushNotificationSettings.fcmToken": 1 },
        });
      }

      return result;
    } catch (error) {
      console.error("❌ Error in sendLikeNotification:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send comment notification
   * @param {string} postId - ID of the commented post
   * @param {string} commentId - ID of the comment
   * @param {string} commenterId - ID of the user who commented
   * @param {string} commenterUsername - Username of the user who commented
   * @param {string} commentText - Text of the comment
   */
  async sendCommentNotification(
    postId,
    commentId,
    commenterId,
    commenterUsername,
    commentText
  ) {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `📍 Starting sendCommentNotification for post ${postId} by ${commenterUsername}`
        );
      }

      const post = await Post.findById(postId).populate("user");
      if (!post) {
        if (process.env.NODE_ENV === "development") {
          console.log(`❌ Post ${postId} not found`);
        }
        return { success: false, error: "Post not found" };
      }

      const postOwner = post.user;

      // Don't send notification if user commented on their own post
      if (postOwner._id.toString() === commenterId.toString()) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `⏭️ Skipping self-notification for ${postOwner.username}`
          );
        }
        return { success: false, error: "Self-notification skipped" };
      }

      // Check if post owner has comment notifications enabled
      if (!this.isNotificationEnabled(postOwner, "comments")) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `⏭️ Comment notifications disabled for ${postOwner.username}`
          );
        }
        return { success: false, error: "Notifications disabled" };
      }

      // Check if post owner has push notifications enabled
      if (
        !postOwner.pushNotificationSettings?.fcmToken &&
        !postOwner.pushNotificationSettings?.webPushSubscription?.endpoint
      ) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `⏭️ No notification methods available for ${postOwner.username}`
          );
        }
        return { success: false, error: "No notification methods available" };
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`🔔 Sending comment notification to ${postOwner.username}`);
      }

      const notificationContent = this.generateNotificationContent("comment", {
        username: commenterUsername,
        postCaption: post.caption,
        commentText: commentText,
        postId: postId,
        commentId: commentId,
        commenterId: commenterId,
      });

      const result = await this.sendUnifiedNotification(
        postOwner,
        notificationContent,
        "comment"
      );

      return result;
    } catch (error) {
      console.error("❌ Error in sendCommentNotification:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send follow notification
   * @param {string} followedUserId - ID of the user being followed
   * @param {string} followerId - ID of the user who followed
   * @param {string} followerUsername - Username of the user who followed
   */
  async sendFollowNotification(followedUserId, followerId, followerUsername) {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `📍 Starting sendFollowNotification from ${followerUsername} to ${followedUserId}`
        );
      }

      const followedUser = await User.findById(followedUserId);
      if (!followedUser) {
        if (process.env.NODE_ENV === "development") {
          console.log(`❌ User ${followedUserId} not found`);
        }
        return { success: false, error: "User not found" };
      }

      // Check if user has follow notifications enabled
      if (!this.isNotificationEnabled(followedUser, "follow")) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `⏭️ Follow notifications disabled for ${followedUser.username}`
          );
        }
        return { success: false, error: "Notifications disabled" };
      }

      // Check if user has push notifications enabled
      if (
        !followedUser.pushNotificationSettings?.fcmToken &&
        !followedUser.pushNotificationSettings?.webPushSubscription?.endpoint
      ) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `⏭️ No notification methods available for ${followedUser.username}`
          );
        }
        return { success: false, error: "No notification methods available" };
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔔 Sending follow notification to ${followedUser.username}`
        );
      }

      const notificationContent = this.generateNotificationContent("follow", {
        username: followerUsername,
        followerId: followerId,
        followedUserId: followedUserId,
      });

      const result = await this.sendUnifiedNotification(
        followedUser,
        notificationContent,
        "follow"
      );

      return result;
    } catch (error) {
      console.error("❌ Error in sendFollowNotification:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send unfollow notification
   * @param {string} unfollowedUserId - ID of the user being unfollowed
   * @param {string} unfollowerId - ID of the user who unfollowed
   * @param {string} unfollowerUsername - Username of the user who unfollowed
   */
  async sendUnfollowNotification(
    unfollowedUserId,
    unfollowerId,
    unfollowerUsername
  ) {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `📍 Starting sendUnfollowNotification from ${unfollowerUsername} to ${unfollowedUserId}`
        );
      }

      const unfollowedUser = await User.findById(unfollowedUserId);
      if (!unfollowedUser) {
        if (process.env.NODE_ENV === "development") {
          console.log(`❌ User ${unfollowedUserId} not found`);
        }
        return { success: false, error: "User not found" };
      }

      // Check if user has unfollow notifications enabled
      if (!this.isNotificationEnabled(unfollowedUser, "unfollow")) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `⏭️ Unfollow notifications disabled for ${unfollowedUser.username}`
          );
        }
        return { success: false, error: "Notifications disabled" };
      }

      // Check if user has push notifications enabled
      if (
        !unfollowedUser.pushNotificationSettings?.fcmToken &&
        !unfollowedUser.pushNotificationSettings?.webPushSubscription?.endpoint
      ) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `⏭️ No notification methods available for ${unfollowedUser.username}`
          );
        }
        return { success: false, error: "No notification methods available" };
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔔 Sending unfollow notification to ${unfollowedUser.username}`
        );
      }

      const notificationContent = this.generateNotificationContent("unfollow", {
        username: unfollowerUsername,
        unfollowerId: unfollowerId,
        unfollowedUserId: unfollowedUserId,
      });

      const result = await this.sendUnifiedNotification(
        unfollowedUser,
        notificationContent,
        "unfollow"
      );

      return result;
    } catch (error) {
      console.error("❌ Error in sendUnfollowNotification:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send save notification
   * @param {string} postId - ID of the saved post
   * @param {string} saverId - ID of the user who saved
   * @param {string} saverUsername - Username of the user who saved
   */
  async sendSaveNotification(postId, saverId, saverUsername) {
    try {
      const post = await Post.findById(postId).populate(
        "user",
        "pushNotificationSettings username"
      );
      if (!post) return;

      const postOwner = post.user;

      // Don't send notification if user saved their own post
      if (postOwner._id.toString() === saverId.toString()) return;

      // Note: 'save' notifications might not have a preference setting in your current model
      // You might want to add this or use a general preference
      if (!postOwner.pushNotificationSettings?.pushEnabled) return;
      if (!postOwner.pushNotificationSettings?.fcmToken) return;

      const notificationContent = this.generateNotificationContent("save", {
        username: saverUsername,
        postCaption: post.caption,
        postId: postId,
        saverId: saverId,
      });

      await this.sendSingleNotification(
        postOwner.pushNotificationSettings.fcmToken,
        notificationContent
      );
    } catch (error) {
      console.error("Error sending save notification:", error);
    }
  }

  /**
   * Send new post notifications to followers
   * @param {string} postId - ID of the new post
   * @param {string} posterId - ID of the user who posted
   * @param {string} posterUsername - Username of the user who posted
   * @param {string} postCaption - Caption of the new post
   */
  async sendNewPostNotifications(
    postId,
    posterId,
    posterUsername,
    postCaption
  ) {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `📍 Starting sendNewPostNotifications for post ${postId} by ${posterUsername}`
        );
      }

      // Find all users who might want to receive post notifications
      // We need to check users who either:
      // 1. Have "all" posts setting enabled, OR
      // 2. Have "following" posts setting and follow this poster
      const potentialRecipients = await User.find({
        "pushNotificationSettings.pushEnabled": true,
        "pushNotificationSettings.postType": { $in: ["all", "following"] },
        $or: [
          { "pushNotificationSettings.fcmToken": { $exists: true } },
          {
            "pushNotificationSettings.webPushSubscription.endpoint": {
              $exists: true,
            },
          },
        ],
      }).populate("following");

      if (!potentialRecipients || potentialRecipients.length === 0) {
        if (process.env.NODE_ENV === "development") {
          console.log(`⏭️ No users with post notifications enabled`);
        }
        return {
          success: true,
          message: "No users with post notifications enabled",
        };
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔍 Found ${potentialRecipients.length} potential recipients`
        );
      }

      // Get the poster for filtering
      const poster = await User.findById(posterId);
      if (!poster) {
        if (process.env.NODE_ENV === "development") {
          console.log(`❌ Poster ${posterId} not found`);
        }
        return { success: false, error: "Poster not found" };
      }

      // Filter recipients who should actually receive this notification
      const eligibleRecipients = potentialRecipients.filter((recipient) => {
        // Don't send to the poster themselves
        if (recipient._id.toString() === posterId.toString()) {
          return false;
        }

        return this.shouldReceivePostNotification(recipient, poster);
      });

      if (eligibleRecipients.length === 0) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `⏭️ No eligible recipients for post notifications from ${posterUsername}`
          );
        }
        return { success: true, message: "No eligible recipients" };
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔔 Sending new post notifications to ${eligibleRecipients.length} recipients`
        );
        console.log(
          `📋 Recipients: ${eligibleRecipients
            .map((r) => r.username)
            .join(", ")}`
        );
      }

      // Get FCM tokens from eligible recipients
      const fcmTokens = eligibleRecipients
        .map((recipient) => recipient.pushNotificationSettings?.fcmToken)
        .filter((token) => token);

      const notificationContent = this.generateNotificationContent("new_post", {
        username: posterUsername,
        postCaption: postCaption,
        postId: postId,
        posterId: posterId,
      });

      let result = { success: false, successCount: 0, failureCount: 0 };

      // Send FCM notifications in batch if we have tokens
      if (fcmTokens.length > 0) {
        result = await this.sendBatchNotifications(
          fcmTokens,
          notificationContent
        );

        // Handle invalid tokens by cleaning them up
        if (result.invalidTokens && result.invalidTokens.length > 0) {
          await this.cleanupInvalidTokens(result.invalidTokens);
        }
      }

      // TODO: In the future, we could also send individual Web Push notifications here
      // for recipients who only have Web Push subscriptions

      if (process.env.NODE_ENV === "development") {
        console.log(
          `📧 New post notifications sent: ${result.successCount} success, ${result.failureCount} failed`
        );
      }

      return {
        success: true,
        successCount: result.successCount || 0,
        failureCount: result.failureCount || 0,
        totalEligible: eligibleRecipients.length,
      };
    } catch (error) {
      console.error("❌ Error in sendNewPostNotifications:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up invalid FCM tokens from user records
   * @param {Array} invalidTokens - Array of invalid FCM tokens
   */
  async cleanupInvalidTokens(invalidTokens) {
    try {
      await User.updateMany(
        { "pushNotificationSettings.fcmToken": { $in: invalidTokens } },
        { $unset: { "pushNotificationSettings.fcmToken": 1 } }
      );
      if (process.env.NODE_ENV === "development") {
        console.log(`🧹 Cleaned up ${invalidTokens.length} invalid FCM tokens`);
      }
    } catch (error) {
      console.error("Error cleaning up invalid tokens:", error);
    }
  }
}

// Export singleton instance
module.exports = new NotificationService();
