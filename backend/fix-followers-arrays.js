const mongoose = require("mongoose");
const User = require("./models/userModel");
require("dotenv").config({ path: "./config.env" });

const fixFollowersFollowingArrays = async () => {
  try {
    await mongoose.connect(process.env.DB);
    console.log("Connected to Database");

    // Find all users with nested array structure in followers or following
    const users = await User.find({
      $or: [
        { "followers.0": { $type: "array" } },
        { "following.0": { $type: "array" } },
      ],
    });

    console.log(`Found ${users.length} users with nested array structure`);

    for (const user of users) {
      let needsUpdate = false;
      const updateData = {};

      // Fix followers if it has nested arrays
      if (
        user.followers &&
        user.followers.length > 0 &&
        Array.isArray(user.followers[0])
      ) {
        updateData.followers = user.followers.flat();
        needsUpdate = true;
        console.log(
          `Fixing followers for user ${user.username}: ${user.followers} -> ${updateData.followers}`
        );
      }

      // Fix following if it has nested arrays
      if (
        user.following &&
        user.following.length > 0 &&
        Array.isArray(user.following[0])
      ) {
        updateData.following = user.following.flat();
        needsUpdate = true;
        console.log(
          `Fixing following for user ${user.username}: ${user.following} -> ${updateData.following}`
        );
      }

      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, updateData);
        console.log(`Updated user ${user.username}`);
      }
    }

    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

fixFollowersFollowingArrays();
