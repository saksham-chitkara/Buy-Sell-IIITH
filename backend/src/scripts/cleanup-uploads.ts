import fs from "fs";
import path from "path";
import { promisify } from "util";

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

const uploadsPath = path.join(__dirname, "..", "..", "uploads");

async function cleanupUploads() {
  try {
    // Clean up user avatars
    const usersPath = path.join(uploadsPath, "users");
    const avatars = await readdir(usersPath);
    for (const avatar of avatars) {
      if (avatar !== "default-avatar.png") {
        await unlink(path.join(usersPath, avatar));
      }
    }

    // Clean up item images
    const itemsPath = path.join(uploadsPath, "items");
    const items = await readdir(itemsPath);
    for (const item of items) {
      await unlink(path.join(itemsPath, item));
    }

    console.log("Successfully cleaned up old uploaded files");
  } catch (error) {
    console.error("Error cleaning up uploads:", error);
  }
}

cleanupUploads();
