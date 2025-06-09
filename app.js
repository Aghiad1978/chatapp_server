import express from "express";
import { createServer } from "https";
import { routerApi } from "./routes/api_router.js";
import { routerSite } from "./routes/site_router.js";
import { connectToDB } from "./db/connect.js";
import { chatLogic } from "./sockets-logic/socket-chat-logic.js";
import { verifyJWT } from "./utils/jwt_verfication_middleware.js";
import { fileURLToPath } from "url";
import path from "path";
import { Server } from "socket.io";
import multer from "multer";
import fs from "fs";
import { addPhoto } from "./operations_models/user_operations.js";
import "dotenv/config";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

const serverPort = process.env.SERVER_PORT;
console.log(serverPort);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = "other";
    if (file.fieldname === "image") {
      subfolder = "images";
    } else if (file.fieldname === "sound") {
      subfolder = "sounds";
    } else if (file.fieldname === "userImage") {
      subfolder = "users_image";
    }
    const uploadPath = path.join(__dirname, "uploads", subfolder);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
const app = express();
const options = {
  key: fs.readFileSync(
    "/etc/letsencrypt/live/crypto-chat.ddns.net/privkey.pem"
  ), // Private key
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/crypto-chat.ddns.net/fullchain.pem"
  ), // Certificate
};

app.use(express.static("./static/public"));
app.use(
  "/uploads/image",
  express.static(path.join(__dirname, "uploads", "images"))
);
app.use(
  "/uploads/sound",
  express.static(path.join(__dirname, "uploads", "sounds"))
);
app.use(
  "/uploads/userImage",
  express.static(path.join(__dirname, "uploads", "users_image"))
);
app.use(express.json());
app.use("/api/v1/", routerApi);
app.use("/", routerSite);

app.post("/uploads", verifyJWT, upload.any(), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const filename = req.files[0];
  if (req.headers["type"] == "userImage") {
    const uuid = req.headers["uuid"];
    addPhoto(uuid, filename.filename);
  }

  console.log(filename);

  res.json({ success: true, filename: filename.path });
});
const server = createServer(options, app);
const io = new Server(server);
io.on("connection", (socket) => {
  transports: ["websocket"], chatLogic(io, socket);
});
try {
  await connectToDB();
  console.log("Done connecting to DB");
  server.listen(serverPort, process.env.IP, () =>
    console.log(`Up and running on port ${serverPort}`)
  );
} catch (error) {
  console.log(error);
}
// testing syncing