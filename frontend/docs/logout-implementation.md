# Logout Implementation Guide

This guide shows how to implement logout functionality in your Family Social app using Redux, including clearing state and tokens from the browser.

## Overview

The logout implementation consists of:

1. **Redux Actions**: Clear user state from the Redux store
2. **API Call**: Call backend logout endpoint to clear server-side session/cookies
3. **Storage Cleanup**: Clear any additional localStorage/sessionStorage items
4. **Redirection**: Navigate user to login page
5. **Persistence**: redux-persist automatically handles clearing persisted data

## Files Created

### 1. Updated Auth Slice (`store/authSlice.ts`)

Added logout actions to clear Redux state:

```typescript
// New actions added:
- clearAuthUser: Clears only the user state
- logout: Resets entire auth state to initial state
```

### 2. Auth Utilities (`utils/auth.ts`)

Main logout functionality with the `logoutUser` function and `useLogout` hook.

### 3. Logout Button Component (`components/Auth/LogoutButton.tsx`)

Simple, reusable logout button for any part of your app.

### 4. User Menu Component (`components/Navigation/UserMenu.tsx`)

Complete user menu with profile info, settings, and logout with confirmation dialog.

## Usage Examples

### Basic Logout Button

```tsx
import LogoutButton from "@/components/Auth/LogoutButton";

function MyComponent() {
  return (
    <LogoutButton variant="destructive" showIcon={true} redirectTo="/login">
      Sign Out
    </LogoutButton>
  );
}
```

### User Menu in Navigation

```tsx
import UserMenu from "@/components/Navigation/UserMenu";

function AppHeader() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Family Social</h1>
      <UserMenu showConfirmDialog={true} />
    </header>
  );
}
```

### Custom Logout Implementation

```tsx
import { useLogout } from "@/utils/auth";
import { useRouter } from "next/navigation";

function CustomLogoutButton() {
  const logout = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    await logout({
      redirectTo: undefined, // Handle redirection manually
      showToast: true,
      onSuccess: () => {
        router.push("/goodbye");
      },
      onError: (error) => {
        console.error("Logout error:", error);
        router.push("/login"); // Redirect anyway
      },
    });
  };

  return <button onClick={handleLogout}>Custom Logout</button>;
}
```

### Programmatic Logout (Without Hook)

```tsx
import { logoutUser } from "@/utils/auth";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

function SomeComponent() {
  const dispatch = useDispatch<AppDispatch>();

  const handleSessionExpired = async () => {
    // Called when session expires or unauthorized error occurs
    await logoutUser(dispatch, {
      redirectTo: "/login",
      showToast: false, // Don't show toast for automatic logout
    });
  };

  // ... rest of component
}
```

## Integration Steps

### 1. Add to Your App Layout/Header

```tsx
// app/layout.tsx or components/Header.tsx
import UserMenu from "@/components/Navigation/UserMenu";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

function AppLayout({ children }) {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div>
      <header className="flex justify-between items-center p-4">
        <h1>Family Social</h1>
        {user ? (
          <UserMenu showConfirmDialog={true} />
        ) : (
          <a href="/login">Login</a>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}
```

### 2. Handle Automatic Logout on 401 Errors

```tsx
// utils/apiInterceptors.ts
import axios from "axios";
import { logoutUser } from "@/utils/auth";
import store from "@/store/store";

// Add axios interceptor for automatic logout on authentication errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // User is unauthorized, logout automatically
      await logoutUser(store.dispatch, {
        redirectTo: "/login",
        showToast: false,
      });
    }
    return Promise.reject(error);
  }
);
```

### 3. Protect Routes with Authentication Check

```tsx
// components/AuthGuard.tsx
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { isAuthenticated } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated(user)) {
      router.push("/login");
    }
  }, [user, router]);

  if (!isAuthenticated(user)) {
    return <div>Redirecting to login...</div>;
  }

  return <>{children}</>;
}

export default AuthGuard;
```

## What Happens During Logout

1. **API Call**: POST request to `/api/users/logout`

   - Backend clears the HTTP-only cookie containing the JWT
   - Sets cookie expiration to past date

2. **Redux State**:

   - `logout()` action resets auth state to initial state
   - redux-persist automatically removes persisted data from localStorage

3. **Additional Cleanup**:

   - Clears any additional localStorage items (tokens, preferences, etc.)
   - Clears sessionStorage if used

4. **Redirection**:

   - Uses Next.js router for smooth navigation
   - Defaults to `/login` page

5. **User Feedback**:
   - Shows success toast notification
   - Handles errors gracefully

## Security Considerations

### ✅ What's Covered

- **HTTP-Only Cookies**: JWT stored in HTTP-only cookie (can't be accessed by JavaScript)
- **Secure Logout**: Backend properly clears cookies with past expiration
- **State Clearing**: All client-side state is cleared on logout
- **Error Handling**: Logout continues even if API call fails
- **CSRF Protection**: Using `withCredentials: true` for cookie-based auth

### 🔒 Additional Recommendations

1. **Session Timeout**: Implement automatic logout after inactivity
2. **Token Refresh**: If using refresh tokens, clear them on logout
3. **Multi-tab Logout**: Consider using BroadcastChannel for cross-tab logout
4. **Audit Logging**: Log logout events on the backend

## Troubleshooting

### Common Issues

**Q: User state persists after logout**
A: Check that redux-persist is properly configured and the `logout` action is being dispatched.

**Q: Cookie not being cleared**
A: Ensure the backend logout endpoint is setting the cookie with a past expiration date and correct domain/path.

**Q: Logout not working in production**
A: Check that `secure: true` is set for cookies in production and you're using HTTPS.

**Q: User can still access protected routes after logout**
A: Implement route guards that check authentication status and redirect unauthenticated users.

### Testing Logout

```bash
# Test backend logout endpoint
curl -X POST http://localhost:3000/api/users/logout \\
  -H "Content-Type: application/json" \\
  -b "token=your-jwt-token"

# Check that cookie is cleared in response headers:
# Set-Cookie: token=loggedout; expires=Thu, 01 Jan 1970 00:00:00 GMT
```

## Migration from Manual Implementation

If you have existing logout logic, replace it with:

```tsx
// Before
const handleLogout = () => {
  localStorage.removeItem("token");
  dispatch(setUser(null));
  router.push("/login");
};

// After
const logout = useLogout();
const handleLogout = () => logout({ redirectTo: "/login" });
```

This implementation provides a robust, secure logout system that properly clears all user data and handles edge cases gracefully.
