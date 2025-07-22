import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

// Initialize Firebase Admin SDK if not already done
if (!admin.apps.length) {
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
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        {
          valid: false,
          error: "No token provided",
        },
        { status: 400 }
      );
    }

    // Test the token by sending a dry run message
    const testMessage = {
      token,
      notification: {
        title: "Token Validation",
        body: "This is a test message",
      },
      dryRun: true, // This won't actually send the notification
    };

    await admin.messaging().send(testMessage);

    // If we get here, token is valid
    return NextResponse.json({
      valid: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Token validation error:", error);

    // Check for specific Firebase errors that indicate invalid token
    if (error instanceof Error) {
      if (
        error.message.includes("Requested entity was not found") ||
        error.message.includes("registration-token-not-registered") ||
        error.message.includes("invalid-registration-token")
      ) {
        return NextResponse.json(
          {
            valid: false,
            error: "Token is invalid or expired",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        valid: false,
        error: "Token validation failed",
      },
      { status: 500 }
    );
  }
}
