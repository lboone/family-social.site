# Push Notifications Testing Guide 🧪

## 🎯 **Testing Overview**

This guide will help you systematically test all notification types across different platforms and scenarios.

---

## 📱 **Platform Testing Matrix**

| Platform           | FCM Support | Web Push Support | Test Status      |
| ------------------ | ----------- | ---------------- | ---------------- |
| Chrome Desktop     | ✅ Primary  | ✅ Fallback      | ⏳ Pending       |
| Firefox Desktop    | ✅ Primary  | ✅ Fallback      | ⏳ Pending       |
| Safari Desktop     | ❌ No       | ✅ Primary       | ⏳ Pending       |
| Chrome Android     | ✅ Primary  | ✅ Fallback      | ⏳ Pending       |
| Firefox Android    | ✅ Primary  | ✅ Fallback      | ⏳ Pending       |
| iOS Safari PWA     | ❌ No       | ✅ Primary       | ⏳ Pending       |
| iOS Safari Browser | ❌ No       | ❌ No            | ⚠️ Not Supported |

---

## 🔔 **Notification Type Testing**

### **1. Like Notifications**

**Test Scenario:** User A likes User B's post

**Steps:**

1. User A logs in and enables notifications
2. User B creates a post
3. User A likes User B's post
4. User B should receive notification

**Expected Result:**

- **Title:** "UserA liked your post"
- **Body:** "{first 100 chars of post caption}" or "No caption"
- **Click Action:** Opens `/post/{postId}`

**Test Cases:**

- [ ] User A likes User B's post (should notify User B)
- [ ] User A likes their own post (should NOT notify User A)
- [ ] User B has like notifications disabled (should NOT notify)
- [ ] User B has no FCM token or Web Push subscription (should fail gracefully)

---

### **2. Comment Notifications**

**Test Scenario:** User A comments on User B's post

**Steps:**

1. User A logs in and enables notifications
2. User B creates a post
3. User A comments on User B's post
4. User B should receive notification

**Expected Result:**

- **Title:** "New Comment"
- **Body:** "UserA commented on your post: '{first 50 chars of comment}'"
- **Click Action:** Opens `/post/{postId}#comment-{commentId}`

**Test Cases:**

- [ ] User A comments on User B's post (should notify User B)
- [ ] User A comments on their own post (should NOT notify User A)
- [ ] User B has comment notifications disabled (should NOT notify)
- [ ] Empty or whitespace-only comment (should fail gracefully)

---

### **3. Follow Notifications**

**Test Scenario:** User A follows User B

**Steps:**

1. User A and User B log in
2. User B enables follow notifications
3. User A follows User B
4. User B should receive notification

**Expected Result:**

- **Title:** "New Follower"
- **Body:** "UserA started following you"
- **Click Action:** Opens `/profile/UserA`

**Test Cases:**

- [ ] User A follows User B (should notify User B)
- [ ] User A tries to follow themselves (should fail with error)
- [ ] User B has follow notifications disabled (should NOT notify)
- [ ] User A is already following User B (should handle gracefully)

---

### **4. Unfollow Notifications**

**Test Scenario:** User A unfollows User B

**Steps:**

1. User A is already following User B
2. User B enables unfollow notifications
3. User A unfollows User B
4. User B should receive notification

**Expected Result:**

- **Title:** "Follower Update"
- **Body:** "UserA unfollowed you"
- **Click Action:** Opens `/profile/UserA`

**Test Cases:**

- [ ] User A unfollows User B (should notify User B)
- [ ] User B has unfollow notifications disabled (should NOT notify)
- [ ] User A wasn't following User B (should handle gracefully)

---

### **5. New Post Notifications**

**Test Scenario:** User A creates a post, followers get notified

**Steps:**

1. User B follows User A
2. User B enables "following" or "all" post notifications
3. User A creates a new post
4. User B should receive notification

**Expected Result:**

- **Title:** "New Post"
- **Body:** "UserA shared a new post: '{first 50 chars of caption}'"
- **Click Action:** Opens `/post/{postId}`

**Test Cases:**

- [ ] User A creates post, followers with "all" notifications get notified
- [ ] User A creates post, followers with "following" notifications get notified
- [ ] User A creates post, followers with "none" notifications do NOT get notified
- [ ] User A creates post with no followers (should handle gracefully)
- [ ] User A creates post with no caption (should handle gracefully)

---

## ⚙️ **Settings Testing**

### **Notification Preferences**

**Test each setting:**

- [ ] Push Notifications Enabled/Disabled toggle
- [ ] Likes notifications toggle
- [ ] Comments notifications toggle
- [ ] Follow notifications toggle
- [ ] Unfollow notifications toggle
- [ ] Post notifications: All/Following/None

**Test Scenarios:**

1. **Global Disable:** Turn off "Push Notifications Enabled" → No notifications should be sent
2. **Selective Disable:** Turn off specific notification types → Only those types should be disabled
3. **Post Type Settings:** Test "All", "Following", and "None" settings for new posts

---

## 🌐 **Platform-Specific Testing**

### **FCM Testing (Chrome/Firefox/Android)**

**Setup:**

1. Open Chrome/Firefox
2. Enable notifications in browser settings
3. Register for notifications in your app
4. Verify FCM token is saved in user profile

**Tests:**

- [ ] Foreground notifications (app open)
- [ ] Background notifications (app minimized)
- [ ] Notification clicks open correct pages
- [ ] Invalid token cleanup works

### **Web Push Testing (iOS Safari PWA)**

**Setup:**

1. Open iOS Safari
2. Add your app to home screen (PWA mode)
3. Enable notifications
4. Verify Web Push subscription is saved

**Tests:**

- [ ] PWA notifications work
- [ ] Notification clicks open app correctly
- [ ] Invalid subscription cleanup works

---

## 🐛 **Error Handling Testing**

### **Database Tests**

- [ ] Deleted post notifications (should handle gracefully)
- [ ] Deleted user notifications (should handle gracefully)
- [ ] Invalid user IDs (should handle gracefully)

### **Network Tests**

- [ ] FCM service downtime (should fail gracefully)
- [ ] Web Push service downtime (should fail gracefully)
- [ ] Database connection issues (should handle gracefully)

### **Token Management Tests**

- [ ] Expired FCM tokens (should cleanup automatically)
- [ ] Invalid Web Push subscriptions (should cleanup automatically)
- [ ] No notification methods available (should fail gracefully with message)

---

## 📊 **Performance Testing**

### **Batch Operations**

- [ ] New post with 100+ followers (should handle efficiently)
- [ ] Multiple notifications in quick succession
- [ ] Token cleanup for invalid tokens

### **Load Testing**

- [ ] High volume of notifications
- [ ] Database query performance for followers

---

## ✅ **Testing Checklist Template**

Copy this checklist for each platform you test:

### **Platform: ******\_\_\_********

**Setup:**

- [ ] Browser/device configured
- [ ] Notifications enabled
- [ ] User logged in
- [ ] Notification preferences set

**Basic Tests:**

- [ ] Like notification works
- [ ] Comment notification works
- [ ] Follow notification works
- [ ] Unfollow notification works
- [ ] New post notification works

**Settings Tests:**

- [ ] Global disable works
- [ ] Individual toggles work
- [ ] Post type settings work

**Edge Cases:**

- [ ] Self-actions don't notify
- [ ] Disabled preferences respected
- [ ] Invalid data handled gracefully

**Notes:**

```
Date: ___________
Issues found: ________________
Performance: ________________
```

---

## 🚀 **Quick Test Script**

Here's a quick test sequence to run through all notification types:

1. **Setup Two Test Users:**

   - UserA: The action performer
   - UserB: The notification receiver

2. **Enable All Notifications for UserB**

3. **Run Actions as UserA:**

   - Like UserB's post
   - Comment on UserB's post
   - Follow UserB
   - Unfollow UserB
   - Create a new post (if UserB follows UserA)

4. **Verify UserB Receives 4-5 Notifications**

5. **Test Settings:**
   - Disable likes notifications for UserB
   - UserA likes UserB's post again
   - UserB should NOT receive notification

---

## 📝 **Bug Report Template**

When you find issues, use this template:

```
**Bug Title:** Notification not received for [action]

**Platform:** [Chrome/Firefox/Safari/iOS Safari PWA/etc.]

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**
Notification should be received with [expected content]

**Actual Result:**
[What actually happened]

**User Settings:**
- Push Notifications Enabled: [Yes/No]
- [Specific notification type] Enabled: [Yes/No]
- Notification Method: [FCM/Web Push]

**Console Logs:**
[Any relevant logs from browser console or server logs]

**Additional Notes:**
[Any other relevant information]
```

---

Ready to start testing! Which platform would you like to test first?
