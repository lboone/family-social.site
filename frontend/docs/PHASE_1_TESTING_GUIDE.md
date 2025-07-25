# Phase 1 Testing Guide: Service Worker & Background Notifications 🧪

## 🚀 Quick Start Testing

### **Step 1: Start Your Development Server**

```bash
cd frontend
npm run dev
# or
yarn dev
```

### **Step 2: Open Browser and Navigate to Your App**

- Open Chrome, Firefox, or Edge (modern browsers)
- Navigate to `http://localhost:3000` (or your dev server URL)
- **Important**: Use the actual domain, not just localhost for full testing

---

## 🔍 **Phase 1 Testing Checklist**

### **✅ 1. Service Worker Registration Testing**

#### **Visual Indicators:**

- [ ] **Debug Panel**: Look for debug panel in bottom-right corner (development only)
- [ ] **Status Indicators**: All should show green checkmarks:
  - Supported: ✅
  - Registered: ✅
  - Controlling: ✅

#### **Browser DevTools Testing:**

1. **Open DevTools** (F12 or Cmd+Option+I)
2. **Go to Application Tab** → Service Workers
3. **Verify Service Worker Status:**
   - [ ] SW file shows as "activated and running"
   - [ ] Source shows `/sw.js`
   - [ ] No errors in status

#### **Console Logs to Look For:**

```
✅ Service Worker registered successfully
🔔 Push notifications are now available
[Service Worker] Installing...
[Service Worker] Activating...
```

---

### **✅ 2. Notification Permission Testing**

#### **Test Notification Permission Request:**

1. **Click "Test Notification" button** in debug panel
2. **Browser should prompt** for notification permission
3. **Click "Allow"** when prompted
4. **Should see test notification** with:
   - Title: "Test Notification"
   - Body: "Service Worker is working!"
   - Icon: Your app icon

#### **Manual Permission Check:**

- **Chrome**: Click lock icon → Site Settings → Notifications should be "Allow"
- **Firefox**: Click shield icon → Permissions → Notifications should be "Allow"

---

### **✅ 3. FCM Token Generation Testing**

#### **Check FCM Token Status:**

1. **Open Profile → Edit Profile → Notification Settings**
2. **Enable "Push Notifications" toggle**
3. **Grant permission when prompted**
4. **Check browser console** for FCM token logs:
   ```
   Using stored FCM token
   Permission granted, fetching new FCM token
   FCM token: [long token string]
   ```

#### **Verify Token Storage:**

1. **DevTools → Application → Local Storage**
2. **Look for keys:**
   - `fcm_token`: Should contain token string
   - `fcm_token_timestamp`: Should contain recent timestamp

---

### **✅ 4. Background Notification Testing**

#### **Test with Firebase Console:**

**⚠️ Important:** Your dev server is running on `https://localhost:3001`, not `localhost:3000`

1. **Go to Firebase Console** → Project → Cloud Messaging
2. **Click "Send your first message"**
3. **Fill out form:**
   - Notification title: "Test Background"
   - Notification text: "Background notification test"
   - Target: Single device
   - FCM registration token: [paste your token from localStorage]
4. **Send notification**
5. **Switch to different tab or minimize browser**
6. **Should receive notification even when app is not active**

**🔍 If notifications aren't working, check these debugging steps:**

**Step 1: Verify FCM Token**

- Open DevTools → Console
- Look for: `FCM token generated successfully: [long token]`
- Copy the EXACT token (it should be ~150+ characters)
- Check localStorage: `fcm_token` should match console token

**Step 2: Check Service Worker Status**

- DevTools → Application → Service Workers
- Should show `/sw.js` as "activated and running"
- No errors should be present

**Step 3: Test Browser Permissions**

- Address bar → Click lock icon → Notifications should be "Allow"
- If blocked, click and change to "Allow", then reload page

**Step 4: Firebase Console Verification**

- Make sure you're in the correct Firebase project
- FCM token should be pasted WITHOUT any extra spaces/characters
- Try sending with just title and body (skip advanced options first)

#### **Test with Your Test Route:**

**⚠️ Important:** Use the correct URL: `https://localhost:3001/test-notification`

1. **Find your FCM token** (automatically populated or check localStorage/console)
2. **Open new browser tab**
3. **Go to:** `https://localhost:3001/test-notification`
4. **Fill out the test form:**
   - **Notification Title**: "Background Test" (or custom title)
   - **Notification Message**: "Testing background notifications" (or custom message)
   - **Click Action Link**: `/profile` (or any valid app route like `/`, `/post/123`)
   - **Custom FCM Token**: Leave empty to use your current token, or paste another token
5. **Click "Send Test Notification"**
6. **Minimize browser or switch tabs**
7. **Should see notification appear within 5-10 seconds**
8. **Click notification to test deep linking**

**✅ What you should see:**

- Form shows your current FCM token status
- Permission status shows as "granted"
- Success message after sending
- Notification appears when browser is minimized
- Clicking notification opens the app to the specified link

---

### **✅ 5. Notification Click Behavior Testing**

#### **Test Deep Linking:**

1. **Send test notification** with different link values:
   - `/` (home page)
   - `/profile/[username]` (profile page)
   - `/post/[postId]` (post page)
2. **Click on notification**
3. **Should open/focus app** and navigate to correct page

#### **Test Window Management:**

1. **With app already open:** Click notification → should focus existing tab
2. **With app closed:** Click notification → should open new tab
3. **Multiple tabs open:** Should focus the app tab

---

### **✅ 6. PWA Installation Testing**

#### **Desktop Testing:**

1. **Chrome:** Look for install icon in address bar
2. **Click install prompt** when it appears
3. **Should install as desktop app**
4. **Launch from desktop/start menu**
5. **Test notifications in PWA mode**

#### **Mobile Testing (if testing on mobile):**

1. **Chrome/Safari:** Should show "Add to Home Screen" prompt
2. **Install app to home screen**
3. **Launch from home screen**
4. **Test notifications in standalone mode**

---

## 🚨 **Common Issues & Troubleshooting**

### **Firebase Console Notifications Not Working:**

**Most Common Cause: FCM Token Issues**

1. **Check Token Generation:**

   ```bash
   # Open DevTools Console and look for these logs:
   ✅ Service Worker registered successfully
   🔔 Push notifications are now available
   FCM token generated successfully: [long token string]
   ```

2. **Verify Token in localStorage:**

   - DevTools → Application → Local Storage → `https://localhost:3001`
   - Look for key: `fcm_token`
   - Value should be 150+ character string starting with letters/numbers

3. **Test Token Copy/Paste:**

   - Copy token from console log (not localStorage if possible)
   - Paste in Firebase Console with NO extra spaces
   - Token should look like: `fGxY8ZQqR7S:APA91bF...` (much longer)

4. **Check Firebase Project:**

   - Make sure you're in the correct Firebase project
   - Project ID should match your config: `family-social-site-48412`

5. **Handle Token Expiration:**

   - **FCM tokens can expire within hours** (not days!)
   - **If you get "entity not found" error**: Token is likely expired
   - **Use "Refresh Token" button** in test form to get fresh token
   - **App automatically refreshes** expired tokens when detected

6. **Try Different Notification Settings:**
   - Start with ONLY Title and Body
   - Don't add images, sounds, or advanced options initially
   - Target: "Single device" with your FCM token

**Service Worker Registration Issues:**

- **Check console for errors**
- **Verify `/sw.js` file exists in public folder**
- **Try hard refresh** (Ctrl+Shift+R / Cmd+Shift+R)
- **Clear browser cache** and reload

**Browser Permission Issues:**

- **Check notification permission** (should be "granted")
- **Verify FCM token exists** in localStorage
- **Check Firebase project configuration**
- **Test in private/incognito mode** to rule out cache issues

### **Service Worker Update Issues:**

- **Click "Update Now"** in debug panel if update is available
- **Or reload page** multiple times
- **Check "Application → Storage"** and clear service worker

### **HTTPS Requirements:**

- **Service Workers require HTTPS** in production
- **localhost is exempt** for development
- **Use ngrok or similar** for external testing

---

## 🎯 **Success Indicators**

### **All Green Lights:**

- [ ] Debug panel shows all green checkmarks
- [ ] No console errors related to service worker
- [ ] Test notification button works
- [ ] Background notifications received when app is closed
- [ ] Notification clicks navigate correctly
- [ ] PWA install prompt appears (optional)

### **Ready for Phase 2 When:**

- [ ] Service worker is stable and error-free
- [ ] Notifications work reliably in background
- [ ] Click behavior is consistent
- [ ] FCM tokens are generated and stored properly

---

## 📱 **Cross-Browser Testing**

### **Test in Multiple Browsers:**

- [ ] **Chrome** (primary target)
- [ ] **Firefox** (good PWA support)
- [ ] **Edge** (Chromium-based)
- [ ] **Safari** (limited but still test)

### **Test on Multiple Devices:**

- [ ] **Desktop** (Windows/Mac/Linux)
- [ ] **Mobile** (iOS Safari, Android Chrome)
- [ ] **Tablet** (if applicable)

---

## 🔧 **Developer Tools & Debugging**

### **Useful Browser DevTools Panels:**

1. **Console**: For logs and errors
2. **Application → Service Workers**: Registration status
3. **Application → Storage → Local Storage**: Token storage
4. **Network**: Service worker requests
5. **Security**: HTTPS requirements

### **Firebase Console Tools:**

1. **Cloud Messaging**: Send test notifications
2. **Project Settings**: Verify configuration
3. **Analytics**: Track notification delivery (if enabled)

---

## ✅ **Phase 1 Testing Complete!**

Once all tests pass, you're ready for **Phase 2: Notification Triggering Logic** where we'll add automatic notifications to your app's user actions (likes, comments, follows, etc.).

**Questions to ask yourself:**

- Can I reliably receive notifications when the app is closed?
- Do notification clicks open the right pages?
- Are there any console errors?
- Does the service worker register properly on page load?

If you answered "yes" to all of these, **Phase 1 is successfully complete!** 🎉
