import express from "express";
import "dotenv/config";
import fs from "fs";
import path from "path";
const routerSite = express.Router();

routerSite.get("/", (re, res) => {
  res.sendFile(
    "/Users/aghiadalzein/chatapp_proj/chatapp1_server/static/pages/index.html"
  );
});
routerSite.get(`/download`, (req, res) => {
  try {
    const appname = "app-release.apk";
    const appPath = path.join(process.env.APP_PATH, appname);
    if (fs.existsSync(appPath)) {
      res.download(appPath);
    } else {
      throw error;
    }
  } catch (error) {
    res.status(404).send("sorry ,app under construction right now 😢");
  }
});

export { routerSite };
