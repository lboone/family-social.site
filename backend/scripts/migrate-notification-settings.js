/**
 * Migration script to update notification settings enum values
 * Run this once to update existing users from old enum values to new ones
 *
 * Old values: "allposts", "follwersposts"
 * New values: "all", "following"
 */

const mongoose = require("mongoose");
const User = require("../models/userModel");

const migrateNotificationSettings = async () => {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("Starting notification settings migration...");
    }
    // Update all users with old enum values
    const updateOperations = [
      // Update "allposts" to "all"
      {
        updateMany: {
          filter: { "pushNotificationSettings.postType": "allposts" },
          update: { $set: { "pushNotificationSettings.postType": "all" } },
        },
      },
      // Update "follwersposts" to "following"
      {
        updateMany: {
          filter: { "pushNotificationSettings.postType": "follwersposts" },
          update: {
            $set: { "pushNotificationSettings.postType": "following" },
          },
        },
      },
      // Update "followersposts" to "following" (in case any exist)
      {
        updateMany: {
          filter: { "pushNotificationSettings.postType": "followersposts" },
          update: {
            $set: { "pushNotificationSettings.postType": "following" },
          },
        },
      },
    ];

    // Execute the bulk operations
    const results = await User.bulkWrite(updateOperations);

    if (process.env.NODE_ENV === "development") {
      console.log("Migration completed successfully!");
      console.log("Results:", results);
    }

    // Verify the migration
    const remainingOldValues = await User.countDocuments({
      "pushNotificationSettings.postType": {
        $in: ["allposts", "follwersposts", "followersposts"],
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`Remaining documents with old values: ${remainingOldValues}`);
    }

    if (remainingOldValues === 0) {
      console.log("✅ Migration successful - all old values updated!");
    } else {
      console.log(
        "⚠️  Some documents still have old values, please check manually"
      );
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

// Only run if called directly (not when imported)
if (require.main === module) {
  // Connect to MongoDB
  const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.DATABASE_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error("Database connection failed:", error);
      process.exit(1);
    }
  };

  // Run migration
  const runMigration = async () => {
    await connectDB();
    await migrateNotificationSettings();
    await mongoose.connection.close();
    console.log("Database connection closed.");
  };

  runMigration();
}

module.exports = { migrateNotificationSettings };
