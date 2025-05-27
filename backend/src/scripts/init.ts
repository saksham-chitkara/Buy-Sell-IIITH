import fs from "fs";
import path from "path";

const createUploadDirs = () => {
  const dirs = ["uploads/users", "uploads/items"];

  dirs.forEach((dir) => {
    const fullPath = path.join(__dirname, "..", "..", dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  });
};

createUploadDirs();
