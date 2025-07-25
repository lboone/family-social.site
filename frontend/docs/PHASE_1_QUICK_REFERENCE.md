# 🚀 Phase 1 Testing Quick Start

## 🎯 What You're Testing

Complete Service Worker & Push Notification infrastructure for Phase 1.

## 📍 Where to Look

- **Debug Panel**: Top-right corner (all green checkmarks = good)
- **Testing Checklist**: Top-left corner (track your progress)
- **Browser DevTools**: F12 → Application → Service Workers
- **Console**: F12 → Console (look for Firebase logs)

## 🧪 Key Tests (in order)

### 1. Service Worker Registration ✅

```
✓ Debug panel shows green checkmarks
✓ DevTools shows SW as "activated and running"
✓ No console errors
```

### 2. Notification Permission ✅

```
✓ Click "Test Notification" in debug panel
✓ Permission popup appears
✓ Test notification shows up
```

### 3. FCM Token Generation ✅

```
✓ Check console for FCM token logs
✓ Check localStorage for stored token
```

### 4. Background Notifications ✅

```
✓ Send test from Firebase Console
✓ Try backend test route: POST /api/send-notification
✓ Minimize app, notifications still work
```

### 5. Click Behavior ✅

```
✓ Click notification → app opens to correct page
✓ Multiple clicks → focuses existing tab
```

## 🚨 Red Flags

- **No SW registration**: Check console for errors
- **No FCM token**: Firebase config issue
- **No notifications**: Permission or SW problem
- **Bad clicks**: URL/routing issue

## ✅ Success Criteria

- All tests pass in checklist
- No console errors
- Notifications work when app is minimized
- Clicking notifications navigates correctly

## 📝 Next Steps

Once all tests pass → Ready for **Phase 2: Notification Triggering Logic**

---

_Keep this tab open while testing! 📋_
