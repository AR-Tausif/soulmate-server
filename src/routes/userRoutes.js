import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User specific operations
 */

// GET User Role/Status

/**
 * @swagger
 * /users/{email}:
 *   get:
 *     tags: [Users]
 *     summary: Get user information by email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         example: user@example.com
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 */
router.get("/:email", verifyToken, async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  res.json(user);
});

// FAVOURITES

// GET Favourites

/**
 * @swagger
 * /users/favourites/{email}:
 *   get:
 *     tags: [Users]
 *     summary: Get user's favourite biodatas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of favourite biodatas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Favourite"
 */

router.get("/favourites/:email", verifyToken, async (req, res) => {
  const favs = await Favourite.find({ userEmail: req.params.email });
  res.json(favs);
});

// POST Add to Favourites

/**
 * @swagger
 * /users/favourites:
 *   post:
 *     tags: [Users]
 *     summary: Add a biodata to user's favourites
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/FavouriteInput"
 *     responses:
 *       200:
 *         description: Added to favourites
 *       400:
 *         description: Already exists in favourites
 */

router.post("/favourites", verifyToken, async (req, res) => {
  const { userEmail, biodataId, name, permanentAddress, occupation } = req.body;
  const exists = await Favourite.findOne({ userEmail, biodataId });
  if (exists) return res.status(400).json({ message: "Already in favourites" });

  await Favourite.create({
    userEmail,
    biodataId,
    name,
    permanentAddress,
    occupation,
  });
  res.json({ message: "Added to favourites" });
});

// DELETE Favourite

/**
 * @swagger
 * /users/favourites/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Remove a favourite biodata by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favourite removed
 */
router.delete("/favourites/:id", verifyToken, async (req, res) => {
  await Favourite.findByIdAndDelete(req.params.id);
  res.json({ message: "Removed from favourites" });
});

// CONTACT REQUESTS (User side)

// GET My Contact Requests

/**
 * @swagger
 * /users/contact-requests/{email}:
 *   get:
 *     tags: [Users]
 *     summary: Get all contact requests made by the user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of contact requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/ContactRequest"
 */
router.get("/contact-requests/:email", verifyToken, async (req, res) => {
  const requests = await ContactRequest.find({
    requesterEmail: req.params.email,
  });
  res.json(requests);
});

// DELETE Contact Request

/**
 * @swagger
 * /users/contact-requests/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a specific contact request by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact request deleted
 */
router.delete("/contact-requests/:id", verifyToken, async (req, res) => {
  await ContactRequest.findByIdAndDelete(req.params.id);
  res.json({ message: "Request deleted" });
});

export default router;
