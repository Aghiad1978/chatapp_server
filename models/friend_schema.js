import mongoose from "mongoose";

const friendSchema = mongoose.Schema({
  uuid: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
});

export { friendSchema };
