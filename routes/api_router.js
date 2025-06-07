import express from "express";
import {
  addToFriendsList,
  getFriends,
  saveUser,
} from "../operations_models/user_operations.js";
import { verifyJWT } from "../utils/jwt_verfication_middleware.js";
import { getNewMessagesForUser } from "../operations_models/message_operations.js";
const routerApi = express.Router();

routerApi.post("/getFriends", verifyJWT, async (req, res) => {
  return await getFriends(req, res);
});
routerApi.get("/ping", verifyJWT, (req, res) => {
  res.sendStatus(200);
});
routerApi.post("/register", async (req, res) => {
  return await saveUser(req, res);
});
routerApi.post("/newMessages", verifyJWT, async (req, res) => {
  return await getNewMessagesForUser(req, res);
});

export { routerApi };
