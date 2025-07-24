const admin = require("firebase-admin");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const AppError = require("../utils/appError");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

class NotificationService {
  constructor() {
    console.log("NotificationService constructor called");
    this.initialized = false;
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initializeFirebase() {
    console.log("Initialize Firebase Admin SDK");
    try {
      // Check if Firebase is already initialized
      console.log("Admin Apps Length:", admin.apps.length);
      if (admin.apps.length === 0) {
        // Load service account from file if path is provided
        const fs = require("fs");
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
          console.log(
            "Loading FIREBASE_SERVICE_ACCOUNT_KEY_PATH:",
            process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH
          );
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
      return recipient.following.includes(poster._id);
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
        body = `${username} unfollowed you`;
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

    return {
      title,
      body,
      data: {
        clickAction,
        type,
        ...data,
      },
    };
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
      console.log({
        Admin: admin,
        Messaging: admin.messaging(),
        Message: message,
      });
      const response = await admin.messaging().send(message);
      console.log("Notification sent successfully:", response);
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
      const response = await admin.messaging().sendMulticast(message);
      console.log(
        `Batch notification sent. Success: ${response.successCount}, Failure: ${response.failureCount}`
      );

      // Handle failed tokens
      const invalidTokens = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error;
            if (
              error.code === "messaging/invalid-registration-token" ||
              error.code === "messaging/registration-token-not-registered"
            ) {
              invalidTokens.push(validTokens[idx]);
            }
            console.error(`Failed to send to token ${idx}:`, error);
          }
        });
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
        results: response.responses,
      };
    } catch (error) {
      console.error("Error sending batch notifications:", error);
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
      console.log(
        `📍 Starting sendLikeNotification for post ${postId} by ${likerUsername}`
      );

      // Get the post and populate owner
      const post = await Post.findById(postId).populate("user");

      if (!post) {
        console.log(`❌ Post ${postId} not found`);
        return { success: false, error: "Post not found" };
      }

      console.log(`📍 User : ${post.user}`);
      const postOwner = post.user;
      console.log(
        `📍 Post owner Token: ${postOwner.pushNotificationSettings?.fcmToken}`
      );
      console.log(`📍 Post owner: ${postOwner.username}`);

      // Don't send notification if user liked their own post
      if (postOwner._id.toString() === likerId.toString()) {
        console.log(`⏭️ Skipping self-notification for ${postOwner.username}`);
        return { success: false, error: "Self-notification skipped" };
      }

      // Check if post owner has like notifications enabled
      if (!this.isNotificationEnabled(postOwner, "likes")) {
        console.log(`⏭️ Like notifications disabled for ${postOwner.username}`);
        console.log(`User settings:`, {
          pushEnabled: postOwner.pushNotificationSettings?.pushEnabled,
          likes: postOwner.pushNotificationSettings?.likes,
        });
        return { success: false, error: "Notifications disabled" };
      }

      // Check if post owner has a valid FCM token
      if (!postOwner.pushNotificationSettings?.fcmToken) {
        console.log(`⏭️ No FCM token for ${postOwner.username}`);
        return { success: false, error: "No FCM token" };
      }

      console.log(
        `🔔 Sending notification to ${postOwner.username} with token: ${postOwner.pushNotificationSettings.fcmToken}`
      );

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
        console.log(`🧹 Cleaning up invalid token for ${postOwner.username}`);
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
      const post = await Post.findById(postId).populate(
        "user",
        "pushNotificationSettings username"
      );
      if (!post) return;

      const postOwner = post.user;

      // Don't send notification if user commented on their own post
      if (postOwner._id.toString() === commenterId.toString()) return;

      if (!this.isNotificationEnabled(postOwner, "comments")) return;
      if (!postOwner.pushNotificationSettings?.fcmToken) return;

      const notificationContent = this.generateNotificationContent("comment", {
        username: commenterUsername,
        postCaption: post.caption,
        commentText: commentText,
        postId: postId,
        commentId: commentId,
        commenterId: commenterId,
      });

      await this.sendSingleNotification(
        postOwner.pushNotificationSettings.fcmToken,
        notificationContent
      );
    } catch (error) {
      console.error("Error sending comment notification:", error);
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
      const followedUser = await User.findById(followedUserId);
      if (!followedUser) return;

      if (!this.isNotificationEnabled(followedUser, "follow")) return;
      if (!followedUser.pushNotificationSettings?.fcmToken) return;

      const notificationContent = this.generateNotificationContent("follow", {
        username: followerUsername,
        followerId: followerId,
        followedUserId: followedUserId,
      });

      await this.sendSingleNotification(
        followedUser.pushNotificationSettings.fcmToken,
        notificationContent
      );
    } catch (error) {
      console.error("Error sending follow notification:", error);
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
      const unfollowedUser = await User.findById(unfollowedUserId);
      if (!unfollowedUser) return;

      if (!this.isNotificationEnabled(unfollowedUser, "unfollow")) return;
      if (!unfollowedUser.pushNotificationSettings?.fcmToken) return;

      const notificationContent = this.generateNotificationContent("unfollow", {
        username: unfollowerUsername,
        unfollowerId: unfollowerId,
        unfollowedUserId: unfollowedUserId,
      });

      await this.sendSingleNotification(
        unfollowedUser.pushNotificationSettings.fcmToken,
        notificationContent
      );
    } catch (error) {
      console.error("Error sending unfollow notification:", error);
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
      // Get the poster with their followers
      const poster = await User.findById(posterId).populate(
        "followers",
        "pushNotificationSettings username"
      );
      if (!poster || !poster.followers.length) return;

      // Filter followers who should receive notifications
      const eligibleFollowers = poster.followers.filter((follower) =>
        this.shouldReceivePostNotification(follower, poster)
      );

      if (eligibleFollowers.length === 0) return;

      // Get FCM tokens
      const fcmTokens = eligibleFollowers
        .map((follower) => follower.pushNotificationSettings?.fcmToken)
        .filter((token) => token);

      if (fcmTokens.length === 0) return;

      const notificationContent = this.generateNotificationContent("new_post", {
        username: posterUsername,
        postCaption: postCaption,
        postId: postId,
        posterId: posterId,
      });

      const result = await this.sendBatchNotifications(
        fcmTokens,
        notificationContent
      );

      // Handle invalid tokens by cleaning them up
      if (result.invalidTokens && result.invalidTokens.length > 0) {
        await this.cleanupInvalidTokens(result.invalidTokens);
      }

      console.log(
        `New post notifications sent: ${result.successCount} success, ${result.failureCount} failed`
      );
    } catch (error) {
      console.error("Error sending new post notifications:", error);
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
      console.log(`Cleaned up ${invalidTokens.length} invalid FCM tokens`);
    } catch (error) {
      console.error("Error cleaning up invalid tokens:", error);
    }
  }
}

// Export singleton instance
module.exports = new NotificationService();
