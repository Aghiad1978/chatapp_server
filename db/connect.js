import mongoose from "mongoose";

export const connectToDB = async () => {
  return await mongoose.connect("mongodb://localhost:27017/chatapp1");
};
