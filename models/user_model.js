import mongoose from "mongoose";
import { friendSchema } from "./friend_schema.js";

const UserSchema = mongoose.Schema({
  userName: { type: String, required: true, trim: true },
  mobile: { type: String, unique: true, required: true, trim: true },
  uuid: { type: String, unique: true, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Invalid email Format",
    },
  },
  createdAt: { type: Date, default: Date.now },
  numberOfDevices: { type: Number, default: 1 },
  password: { type: String, default: "Not Available Yet" },
  friends: [friendSchema],
  blockedFriends: [friendSchema],
  photo: { type: String, default: "default" },
});

const User = mongoose.model("User", UserSchema);

export { User };
