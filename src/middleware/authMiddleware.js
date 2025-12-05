import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Extend Request interface to include user
// export interface AuthRequest extends ExpressRequest {
//   user?: any;
// }

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || "secret",
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden access" });
  }
};

export const verifyAdmin = async (req, res, next) => {
  const email = req.user?.email;
  const user = await User.findOne({ email });

  if (user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};
