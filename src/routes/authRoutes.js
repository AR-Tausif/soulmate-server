import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

// create jwt for auth
/**
 * @swagger
 * /auth/jwt:
 *   post:
 *     summary: Generate JWT token and create/update user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               photoURL:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT generated
 */
router.post("/jwt", async (req, res) => {
  const { email, name, photoURL } = req.body;

  // Check if user exists, if not create
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    await User.create({ email, name, photoURL });
  }

  const token = jwt.sign(
    { email },
    process.env.ACCESS_TOKEN_SECRET || "secret",
    {
      expiresIn: "1h",
    },
  );

  res.send({ token });
});

export default router;
