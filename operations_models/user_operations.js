import { User } from "../models/user_model.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { verifyJWT } from "../utils/jwt_verfication_middleware.js";

async function saveUser(req, res) {
  const userName = req.body.userName;
  const email = req.body.email;
  const uuid = req.body.uuid;
  const mobile = req.body.mobile;

  const user = new User({
    userName,
    mobile,
    uuid,
    email,
  });

  try {
    await user.save();
    const accessJWT = jwt.sign({ uuid }, process.env.JWT_ACCESS, {
      expiresIn: "365d",
      algorithm: "HS384",
    });
    const refreshJWT = jwt.sign({ uuid }, process.env.JWT_REFRESH, {
      expiresIn: "365d",
      algorithm: "HS512",
    });

    return res.status(201).send({ jwta: accessJWT, jwtr: refreshJWT });
  } catch (error) {
    if (error.code === 11000) {
      console.log("1100 error useroperations/.js 35", error);
      const err = error.errmsg;
      return res.status(400).json({ error: `error in ${err}` });
    } else {
      return res.status(400).json({ error: "error while registration" });
    }
  }
}
async function addPhoto(uuid, imagePath) {
  try {
    const user = await User.findOneAndUpdate(
      { uuid: uuid },
      { photo: imagePath },
      { new: true }
    );
    if (!user) return;
    console.log("user updated");
  } catch (error) {
    console.log("Error on uploading", error);
  }
}
async function getUserFriends(userUuid) {
  try {
    const user = await User.findOne({ uuid: userUuid });
    if (!user) return [];

    // Return array of UUIDs of user's friends
    return user.friends.map((friend) => friend.uuid);
  } catch (err) {
    console.error("Error fetching friends:", err);
    return [];
  }
}
async function getFriends(req, res) {
  const userUuid = req.headers.uuid;

  try {
    const users = await User.find();
    let clientContacts = req.body;
    let foundFriends = [];
    for (let y = 0; y < users.length; y++) {
      for (let i = 0; i < clientContacts.length; i++) {
        let name = Object.values(clientContacts[i])[0];
        let mobile = Object.keys(clientContacts[i])[0];
        if (mobile === users[y].mobile) {
          let uuid = users[y].uuid;
          let email = users[y].email;
          let friendData = {
            userName: name,
            uuid: uuid,
            email: email,
            mobile: mobile,
          };
          foundFriends.push({ name, mobile, uuid, email });
          await addToFriendsList(userUuid, friendData);
        }
      }
    }

    res.status(200).json(foundFriends);
  } catch (error) {
    res.status(400).json(error);
  }
}

async function addToFriendsList(userUuid, friendData) {
  try {
    const updateUser = await User.findOneAndUpdate(
      { uuid: userUuid, "friends.mobile": { $ne: friendData.mobile } },
      { $addToSet: { friends: friendData } },
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.log(error);
  }
}

export { saveUser, getFriends, addToFriendsList, getUserFriends, addPhoto };
