import { Message } from "../models/message_model.js";

async function saveMessage(
  msgid,
  message,
  receiverUuid,
  senderUuid,
  senderName,
  senderMobile,
  createdAt,
  received,
  read,
  type
) {
  console.log(`MESSAGEID:${msgid}`);
  try {
    const messageSaved = new Message({
      msgid: msgid,
      message: message,
      receiverUuid: receiverUuid,
      senderUuid: senderUuid,
      senderName: senderName,
      senderMobile: senderMobile,
      createdAt: new Date(createdAt),
      received: received,
      read: read,
      type: type,
    });
    await messageSaved.save();
  } catch (error) {
    console.log(`ERROR:${error}`);
  }
}
async function getNewMessagesForUser(req, res) {
  try {
    const uuid = req.body.uuid;
    const unreadMessages = await Message.find({
      receiverUuid: uuid,
      received: 0,
    });
    if (!unreadMessages) {
      unreadMessages = [];
      return res.status(200).json(unreadMessages);
    }
    return res.status(200).json(unreadMessages);
  } catch (error) {
    print(error);
    res.status(404).json({ error: error });
  }
}
async function checkMessageStatus(msgID) {
  const msg = await Message.findOne({ msgid: msgID });
  if (msg == null) {
    return null;
  }
  if (msg["read"] === null || msg["received"] === null) {
    return null;
  }

  return msg["read"] * 2 + msg["received"];
}
async function updateMessageToReceived(msgID) {
  try {
    await Message.findOneAndUpdate({ msgid: msgID }, { $set: { received: 1 } });
  } catch (e) {
    console.log(`ERROR:When updated to received a messgae ${e}`);
  }
}
async function updateMessageToRead(msgID) {
  try {
    await Message.updateOne({ msgid: msgID }, { $set: { read: 1 } });
  } catch (e) {
    console.log(`ERROR:When updated to read a messgae ${e}`);
  }
}
export {
  saveMessage,
  getNewMessagesForUser,
  updateMessageToReceived,
  updateMessageToRead,
  checkMessageStatus,
};
