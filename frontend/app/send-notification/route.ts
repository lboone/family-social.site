import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { NextRequest, NextResponse } from "next/server";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Use environment variables for Firebase service account
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: "googleapis.com",
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export async function POST(request: NextRequest) {
  const { token, title, message, link } = await request.json();
  if (process.env.NODE_ENV === "development") {
    console.log("📧 Notification Request:", {
      tokenLength: token?.length,
      tokenStart: token?.substring(0, 20) + "...",
      title,
      message,
      link,
    });
  }

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "No FCM token provided",
      },
      { status: 400 }
    );
  }

  const payload: Message = {
    token,
    notification: {
      title: title,
      body: message,
    },
    webpush: link && {
      fcmOptions: {
        link,
      },
    },
  };
  if (process.env.NODE_ENV === "development") {
    console.log("🚀 Sending payload:", JSON.stringify(payload, null, 2));
  }

  try {
    await admin.messaging().send(payload);

    return NextResponse.json({ success: true, message: "Notification sent!" });
  } catch (error) {
    console.error("Firebase messaging error:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown",
      code: (error as Record<string, unknown>)?.code,
      errorInfo: (error as Record<string, unknown>)?.errorInfo,
    });

    // Convert error to string for safe JSON serialization
    let errorMessage = "Unknown error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific Firebase errors
      if (error.message.includes("Requested entity was not found")) {
        errorMessage =
          "FCM token is invalid or expired. Please refresh the page and try again.";
      } else if (error.message.includes("registration-token-not-registered")) {
        errorMessage =
          "FCM token is not registered. Please refresh the page and generate a new token.";
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
