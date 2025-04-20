import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    isOAuthUser: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      minlength: 6,
      required: function() {
        return !this.isOAuthUser;
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profile: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      avatar: {
        public_id: { type: String }, // Cloudinary public ID
        url: { type: String }, // Cloudinary URL
        secure_url: { type: String }, // Cloudinary secure URL (HTTPS)
      },
      bio: { type: String },
    },
    // For OAuth integrations if needed
    googleId: String,
    githubId: String,
    storageUsed: {
      type: Number,
      default: 0 // in bytes
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model('User', UserSchema)

export default userModel;