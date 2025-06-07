import {
  saveMessage,
  updateMessageToReceived,
  updateMessageToRead,
  checkMessageStatus,
} from "../operations_models/message_operations.js";
import { Message } from "../models/message_model.js";
import { getUserFriends } from "../operations_models/user_operations.js";
let onlineUsers = [];

async function changeStatusForFriends(socket, status) {
  const user = onlineUsers.filter((user) => user.socketID === socket.id)[0];
  const friendsUUID = await getUserFriends(user["uuid"]);
  for (let i = 0; i < friendsUUID.length; i++) {
    let friendSocket = getSocketIDFromUserUuid(friendsUUID[i]);
    if (friendSocket !== null) {
      socket.to(friendSocket).emit("status", {
        uuid: user["uuid"],
        status: status,
      });
    }
  }
}

function getSocketIDFromUserUuid(uuid) {
  for (let index = 0; index < onlineUsers.length; index++) {
    if (onlineUsers[index].uuid.trim() === uuid) {
      return onlineUsers[index].socketID;
    }
  }
  return null;
}

function getUserStatus(uuid) {
  for (let index = 0; index < onlineUsers.length; index++) {
    if (onlineUsers[index].uuid.trim() === uuid) {
      return "online";
    }
  }
  return "offline";
}

function chatLogic(io, socket) {
  if (!socket) {
    console.error("❌ ERROR: Socket is undefined.");
    return;
  }

  socket.on("register-user", async (uuid) => {
    onlineUsers.push({ socketID: socket.id, uuid: uuid });
    await changeStatusForFriends(socket, "online");
    console.log(onlineUsers);
  });

  socket.on("update-messages-status", async (data) => {
    const updatedMessages = await Message.find({
      senderUuid: data.uuid,
      $or: [{ received: 1 }, { read: 1 }], // Modify as needed
    });
    for (const message of updatedMessages) {
      io.to(socket.id).emit("message-updated", {
        msgid: message.msgid,
        read: message.read,
        received: message.received,
      });
    }
  });

  socket.on("datetime", (_) => {
    const currentDate = new Date().toISOString();
    console.log(currentDate);

    socket.emit("datetime", currentDate);
  });

  socket.on("status", async (userUuid) => {
    socket.emit("status", { uuid: userUuid, status: getUserStatus(userUuid) });
  });
  socket.on("checkMsgStatus", async (data) => {
    let result = await checkMessageStatus(data["msgid"]);
    const socketid = getSocketIDFromUserUuid(data["senderUuid"]);
    io.to(socketid).emit("checkMsgStatus", {
      result: result,
      msgid: data["msgid"],
    });
  });
  socket.on("message", (data) => {
    data = JSON.parse(data);
    let receiverUuid = data.receiverUuid;
    let receiverSocket = null;
    for (let index = 0; index < onlineUsers.length; index++) {
      if (onlineUsers[index].uuid.trim() === receiverUuid.trim()) {
        receiverSocket = onlineUsers[index].socketID;
      }
    }

    if (receiverSocket !== null) {
      socket.to(receiverSocket).emit("message", {
        msgid: data.msgid,
        message: data.message,
        senderUuid: data.senderUuid,
        senderName: data.senderName,
        senderMobile: data.senderMobile,
        receiverUuid: receiverUuid,
        createdAt: data.createdAt,
        type: data.type,
      });
      saveMessage(
        data.msgid,
        data.message,
        data.receiverUuid,
        data.senderUuid,
        data.senderName,
        data.senderMobile,
        data.createdAt,
        1,
        0,
        data.type
      );
    } else {
      saveMessage(
        data.msgid,
        data.message,
        data.receiverUuid,
        data.senderUuid,
        data.senderName,
        data.senderMobile,
        data.createdAt,
        0,
        0,
        data.type
      );
      socket.emit("received-server", data.msgid);
    }
  });

  socket.on("disconnect", async (reason) => {
    try {
      console.log(`⚠️ User disconnected: ${socket.id}, Reason: ${reason}`);
      await changeStatusForFriends(socket, "offline");
      onlineUsers = onlineUsers.filter((user) => user.socketID !== socket.id);
      console.log(onlineUsers);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("message-received", (data) => {
    try {
      updateMessageToReceived(data["msgid"]);
      const socketid = getSocketIDFromUserUuid(data["senderUuid"]);
      if (socketid !== null) {
        io.to(socketid).emit("received", data["msgid"]);
      }
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("message-read", async (data) => {
    try {
      await updateMessageToRead(data["msgid"]);
      const socketid = getSocketIDFromUserUuid(data["senderUuid"]);
      io.to(socketid).emit("read", data["msgid"]);
    } catch (error) {
      console.log(`ERROR in message-read ${error}`);
    }
  });
}
export { chatLogic };
