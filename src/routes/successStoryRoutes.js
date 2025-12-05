import express from "express";
import SuccessStory from "../models/SuccessSotry.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Success Stories
 *   description: Managing success stories
 */

// GET All Stories (Sorted by date descending)

/**
 * @swagger
 * /success-stories:
 *   get:
 *     tags: [Success Stories]
 *     summary: Get all success stories
 *     description: Returns all success stories sorted by most recent marriage date.
 *     responses:
 *       200:
 *         description: List of success stories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/SuccessStory"
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const stories = await SuccessStory.find().sort({ marriageDate: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// POST Create Story

/**
 * @swagger
 * /success-stories:
 *   post:
 *     tags: [Success Stories]
 *     summary: Create a new success story
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/SuccessStoryInput"
 *     responses:
 *       200:
 *         description: Success story added
 *       500:
 *         description: Error adding story
 */

router.post("/", async (req, res) => {
  try {
    const newStory = new SuccessStory(req.body);
    await newStory.save();
    res.json({ message: "Success Story Added" });
  } catch (error) {
    res.status(500).json({ message: "Error adding story" });
  }
});

export default router;
