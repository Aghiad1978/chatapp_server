import mongoose from "mongoose";

const MessageSchema = mongoose.Schema({
  msgid: { type: String, required: true, unique: true },
  message: { type: String, required: true },
  senderUuid: { type: String, required: true },
  senderName: { type: String, required: true },
  senderMobile: { type: String, required: true },
  receiverUuid: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Number, default: 0 },
  received: { type: Number, default: 0 },
  type: { type: String, required: true },
});

const Message = mongoose.model("Message", MessageSchema);

export { Message };
