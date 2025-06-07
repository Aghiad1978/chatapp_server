import jwt from "jsonwebtoken";
import "dotenv/config";
export function verifyJWT(req, res, next) {
  let token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS);
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
}
