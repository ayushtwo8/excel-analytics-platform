import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";
import multer from "multer";
import userModel from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";
import admin from "../config/firebase.js";

// File path configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../tmp");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter,
}).single("avatar");

// Helper functions
const ensureTmpDirectory = async () => {
  const uploadPath = path.join(__dirname, "../tmp");
  try {
    await fs.access(uploadPath);
  } catch {
    await fs.mkdir(uploadPath, { recursive: true });
  }
};

// getting the profile
export const getProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const user = await userModel.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// for checking if the user exists
export const checkUser = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "No ID token provided",
      });
    }

    try {
      // Verify token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Find user in database
      const user = await userModel.findOne({ uid });

      return res.status(200).json({
        success: true,
        exists: !!user,
      });
    } catch (tokenError) {
      console.error("Token verification error:", tokenError);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    console.error("Check user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error when checking user",
    });
  }
};

// for creating new profiles
export const createProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { displayName, email, photoURL, bio } = req.body;

    const existingUser = await userModel.findOne({ uid });
    if (existingUser) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const newUser = userModel.create({
      uid,
      name: displayName || email.split("@")[0],
      email,
      avatar: photoURL || "",
      bio: bio || "",
    });

    return res.status(201).json({
      message: "Profile created successfully",
      user: newUser,
    });
  } catch (error) {
    console.log("Error creating profile:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// for updating the profile
export const updateProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { name, avatar, bio } = req.body;

    const updatedUser = await userModel.findOneAndUpdate(
      { uid },
      { ...(name && { name }), ...(avatar && { avatar }), ...(bio && { bio }) },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// for updating the avatar
export const updateAvatar = async (req, res) => {
  try {
    await ensureTmpDirectory();

    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ success: false, message: `Upload error: ${err.message}` });
      } else if (err) {
        return res
          .status(500)
          .json({ success: false, message: `Error: ${err.message}` });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Please upload an image file" });
      }

      try {
        const uid = req.user.uid;
        const user = await userModel.findOne({ uid });

        if (!user) {
          await fs.unlink(req.file.path);
          return res
            .status(404)
            .json({ success: false, message: "Profile not found" });
        }

        let public_id = null;
        if (user.avatar?.includes("cloudinary.com")) {
          try {
            const fileName = user.avatar.split("/").pop().split(".")[0];
            public_id = `avatars/${fileName}`;
          } catch (error) {
            console.error("Failed to parse old avatar URL:", error);
          }
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "avatars",
          width: 500,
          height: 500,
          crop: "fill",
          gravity: "face",
        });

        await fs.unlink(req.file.path);

        const updatedUser = await userModel.findOneAndUpdate(
          { uid },
          {
            avatar: result.secure_url,
            cloudinary_id: result.public_id,
          },
          { new: true, runValidators: true }
        );

        if (public_id) {
          try {
            await cloudinary.uploader.destroy(public_id);
            console.log("Old avatar deleted from Cloudinary:", public_id);
          } catch (error) {
            console.error(
              "Failed to delete old avatar from Cloudinary:",
              error
            );
          }
        }

        res.status(200).json({
          success: true,
          message: "Avatar uploaded successfully",
          imageUrl: result.secure_url,
          user: updatedUser,
        });
      } catch (error) {
        if (req.file) {
          try {
            await fs.unlink(req.file.path);
          } catch (unlinkErr) {
            console.error("Failed to delete temp file:", unlinkErr);
          }
        }

        res
          .status(500)
          .json({ success: false, message: `Upload error: ${error.message}` });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
