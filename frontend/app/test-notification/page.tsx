"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useFcmToken from "@/hooks/useFcmToken";
import { refreshToken } from "@/services/firebase";
import { useState } from "react";

export default function TestNotificationPage() {
  const { token, notificationPermissionStatus } = useFcmToken();
  const [formData, setFormData] = useState({
    title: "Test Background Notification",
    message: "This is a test notification sent from the test page",
    link: "/profile",
  });
  const [customToken, setCustomToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setResult(null);

    let tokenToUse = customToken.trim() || token;

    if (!tokenToUse) {
      setResult({
        success: false,
        message: "No FCM token available. Please enable notifications first.",
      });
      setLoading(false);
      return;
    }

    try {
      // First attempt with current token
      let response = await fetch("/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: tokenToUse,
          title: formData.title,
          message: formData.message,
          link: formData.link || "/",
        }),
      });

      let data = await response.json();

      // If token is invalid/expired, try to refresh and retry
      if (
        !response.ok &&
        data.error &&
        (data.error.includes("entity was not found") ||
          data.error.includes("invalid") ||
          data.error.includes("expired"))
      ) {
        console.log("🔄 FCM token appears invalid, attempting refresh...");
        setResult({ success: false, message: "Token expired, refreshing..." });

        // Try to get a fresh token
        const newToken = await refreshToken();

        if (newToken) {
          console.log("✅ Got new FCM token, retrying notification...");
          tokenToUse = newToken;

          // Retry with new token
          response = await fetch("/send-notification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: tokenToUse,
              title: formData.title,
              message: formData.message,
              link: formData.link || "/",
            }),
          });

          data = await response.json();
        } else {
          setResult({
            success: false,
            message:
              "Failed to refresh FCM token. Please reload the page and try again.",
          });
          setLoading(false);
          return;
        }
      }

      if (response.ok && data.success) {
        setResult({
          success: true,
          message:
            tokenToUse !== (customToken.trim() || token)
              ? "Notification sent successfully with refreshed token! Check your notifications."
              : "Notification sent successfully! Check your notifications.",
        });
      } else {
        // Handle different error formats
        let errorMessage = "Failed to send notification";
        if (data.error) {
          if (typeof data.error === "string") {
            errorMessage = data.error;
          } else if (data.error.message) {
            errorMessage = data.error.message;
          } else {
            errorMessage = JSON.stringify(data.error);
          }
        }
        setResult({
          success: false,
          message: errorMessage,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Test Push Notifications</h1>
        <p className="text-gray-600">
          Send test notifications to verify your push notification setup
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notification Status</CardTitle>
          <CardDescription>Current permission and token status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Permission Status:</Label>
            <span
              className={`px-2 py-1 rounded text-sm ${
                notificationPermissionStatus === "granted"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {notificationPermissionStatus || "Unknown"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <Label>FCM Token:</Label>
            <span
              className={`px-2 py-1 rounded text-sm ${
                token
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {token ? "✅ Available" : "❌ Not found"}
            </span>
          </div>

          {token && (
            <div className="mt-4">
              <Label>Current FCM Token:</Label>
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs break-all">
                {token}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard?.writeText(token)}
                >
                  Copy Token
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    setLoading(true);
                    const newToken = await refreshToken();
                    if (newToken) {
                      setResult({
                        success: true,
                        message: "Token refreshed successfully!",
                      });
                      // Force re-render by updating the hook (if possible)
                      window.location.reload(); // Simple approach
                    } else {
                      setResult({
                        success: false,
                        message: "Failed to refresh token",
                      });
                    }
                    setLoading(false);
                  }}
                  disabled={loading}
                >
                  Refresh Token
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {notificationPermissionStatus !== "granted" && (
        <Alert className="mb-6">
          <AlertDescription>
            You need to grant notification permission first. Please enable
            notifications in your browser settings or use the debug panel.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Send Test Notification</CardTitle>
          <CardDescription>
            Fill out the form below to send a test notification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter notification title"
            />
          </div>

          <div>
            <Label htmlFor="message">Notification Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange("message", e.target.value)
              }
              placeholder="Enter notification message"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="link">Click Action Link (optional)</Label>
            <Input
              id="link"
              value={formData.link}
              onChange={(e) => handleInputChange("link", e.target.value)}
              placeholder="/profile, /post/123, etc."
            />
          </div>

          <div>
            <Label htmlFor="customToken">Custom FCM Token (optional)</Label>
            <Textarea
              id="customToken"
              value={customToken}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCustomToken(e.target.value)
              }
              placeholder="Paste a different FCM token to test with..."
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to use your current token. Use this to test
              notifications to other devices.
            </p>
          </div>

          <Button
            onClick={handleTestNotification}
            disabled={loading || (!token && !customToken.trim())}
            className="w-full"
          >
            {loading ? "Sending..." : "Send Test Notification"}
          </Button>

          {result && (
            <Alert
              className={result.success ? "border-green-500" : "border-red-500"}
            >
              <AlertDescription
                className={result.success ? "text-green-700" : "text-red-700"}
              >
                {result.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              1. <strong>Fill out the form</strong> with your test notification
              details
            </p>
            <p>
              2. <strong>Click &quot;Send Test Notification&quot;</strong>
            </p>
            <p>
              3. <strong>Minimize your browser</strong> or switch to another tab
            </p>
            <p>
              4. <strong>Wait 5-10 seconds</strong> for the notification to
              appear
            </p>
            <p>
              5. <strong>Click the notification</strong> to test deep linking
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
