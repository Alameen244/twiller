import { adminAuth } from "../config/firebaseAdmin.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    req.firebaseUser = await adminAuth.verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Attaches req.firebaseUser when a valid token is sent; otherwise continues as anonymous.
export const optionalFirebaseToken = async (req, _res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (token) req.firebaseUser = await adminAuth.verifyIdToken(token);
  } catch {
    /* invalid token -> treat as anonymous */
  }
  next();
};
