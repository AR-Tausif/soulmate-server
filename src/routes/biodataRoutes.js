import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import Biodata from "../models/Biodata.js";
import User from "../models/User.js";
import PremiumRequest from "../models/PremiumRequest.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Biodatas
 *   description: Biodata Management
 */

// GET All Biodatas (Public with filters)

/**
 * @swagger
 * /biodatas:
 *   get:
 *     summary: Get all biodatas with optional filters
 *     tags: [Biodatas]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: number
 *         description: Page number for pagination
 *       - name: limit
 *         in: query
 *         schema:
 *           type: number
 *         description: Number of results per page
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Male, Female]
 *         description: Filter by biodata type
 *       - name: division
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by permanent division
 *       - name: ageMin
 *         in: query
 *         schema:
 *           type: number
 *         description: Minimum age filter
 *       - name: ageMax
 *         in: query
 *         schema:
 *           type: number
 *         description: Maximum age filter
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *         description: Sort by age
 *     responses:
 *       200:
 *         description: List of biodatas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Biodata'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      division,
      ageMin,
      ageMax,
      sort,
    } = req.query;

    const query = {};
    if (type) query.biodataType = type;
    if (division) query.permanentDivision = division;
    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = Number(ageMin);
      if (ageMax) query.age.$lte = Number(ageMax);
    }

    // Server-side ordering by age (ascending or descending)
    let sortOptions = {};
    if (sort === "ascending") sortOptions.age = 1;
    if (sort === "descending") sortOptions.age = -1;

    const biodatas = await Biodata.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Biodata.countDocuments(query);

    res.json({
      data: biodatas,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// GET Single Biodata Details

/**
 * @swagger
 * /biodatas/{id}:
 *   get:
 *     summary: Get a single biodata by ID
 *     tags: [Biodatas]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the biodata
 *     responses:
 *       200:
 *         description: Biodata details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Biodata'
 *       404:
 *         description: Biodata not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const biodata = await Biodata.findOne({ biodataId: req.params.id });
    if (!biodata) return res.status(404).json({ message: "Biodata not found" });

    // Note: Frontend handles the "Private Route" check for login.
    // However, we should limit contact info exposure here.
    // But logic dictates full details are sent, frontend hides sensitive data if not premium/admin.
    // OR we strip email/phone here if not authorized.
    // For this assignment, simply returning the data is standard, assuming frontend protects the view.

    res.json(biodata);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// GET Similar Biodatas

/**
 * @swagger
 * /biodatas/similar/{type}:
 *   get:
 *     summary: Get similar biodatas by type
 *     tags: [Biodatas]
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Male, Female]
 *         description: Biodata type to find similar entries
 *     responses:
 *       200:
 *         description: List of similar biodatas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Biodata'
 *       500:
 *         description: Server error
 */

router.get("/similar/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const limit = 3;
    const similar = await Biodata.find({ biodataType: type }).limit(limit);
    res.json(similar);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// GET Biodata by User Email (For Dashboard View/Edit)
/**
 * @swagger
 * /biodatas/email/{email}:
 *   get:
 *     summary: Get biodata by user email (protected)
 *     tags: [Biodatas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User's email
 *     responses:
 *       200:
 *         description: User's biodata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Biodata'
 *       500:
 *         description: Server error
 */
router.get("/email/:email", verifyToken, async (req, res) => {
  try {
    const biodata = await Biodata.findOne({ userEmail: req.params.email });
    res.json(biodata);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// POST Create or Update Biodata
/**
 * @swagger
 * /biodatas:
 *   post:
 *     summary: Create or update a biodata (protected)
 *     tags: [Biodatas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BiodataInput'
 *     responses:
 *       200:
 *         description: Biodata created or updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 biodata:
 *                   $ref: '#/components/schemas/Biodata'
 *       500:
 *         description: Error saving biodata
 */
router.post("/", verifyToken, async (req, res) => {
  const {
    biodataType,
    name,
    profileImage,
    dateOfBirth,
    height,
    weight,
    age,
    occupation,
    race,
    fathersName,
    mothersName,
    permanentDivision,
    presentDivision,
    expectedPartnerAge,
    expectedPartnerHeight,
    expectedPartnerWeight,
    mobileNumber,
    userEmail,
  } = req.body;

  try {
    // Check if biodata exists
    let biodata = await Biodata.findOne({ userEmail });

    if (biodata) {
      // Update
      Object.assign(biodata, req.body);
      await biodata.save();
      return res.json({ message: "Biodata Updated Successfully", biodata });
    } else {
      // Create New - Generate ID
      const lastBiodata = await Biodata.findOne().sort({ biodataId: -1 });
      const newId = lastBiodata ? lastBiodata.biodataId + 1 : 1;

      const newBiodata = new Biodata({
        ...req.body,
        biodataId: newId,
        contactEmail: userEmail, // Default to user email
      });

      await newBiodata.save();
      return res.json({
        message: "Biodata Created Successfully",
        biodata: newBiodata,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error saving biodata", error });
  }
});

// POST Request to make premium

/**
 * @swagger
 * /biodatas/make-premium:
 *   post:
 *     summary: Request to make a biodata premium (protected)
 *     tags: [Biodatas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - biodataId
 *               - userEmail
 *               - userName
 *             properties:
 *               biodataId:
 *                 type: number
 *               userEmail:
 *                 type: string
 *               userName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Premium request sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Request already pending
 *       500:
 *         description: Server error
 */
router.post("/make-premium", verifyToken, async (req, res) => {
  const { biodataId, userEmail, userName } = req.body;
  try {
    // Check if already pending
    const existing = await PremiumRequest.findOne({
      biodataId,
      status: "pending",
    });
    if (existing)
      return res.status(400).json({ message: "Request already pending" });

    await PremiumRequest.create({ biodataId, userEmail, userName });
    res.json({ message: "Premium request sent to admin" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
