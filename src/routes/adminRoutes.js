import express from "express";
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";
import Biodata from "../models/Biodata.js";
import ContactRequest from "../models/ContactRequest.js";
import User from "../models/User.js";
import PremiumRequest from "../models/PremiumRequest.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin Dashboard Operations
 */

// GET Stats

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get overall admin dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics fetched successfully
 */
router.get("/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalBiodata = await Biodata.countDocuments();
    const maleBiodata = await Biodata.countDocuments({ biodataType: "Male" });
    const femaleBiodata = await Biodata.countDocuments({
      biodataType: "Female",
    });
    const premiumBiodata = await Biodata.countDocuments({ isPremium: true });

    // Calculate Revenue (Total approved contact requests * 5)
    // Assuming revenue comes from contact requests only as per assignment flow
    const approvedContacts = await ContactRequest.countDocuments({
      status: "approved",
    });
    const revenue = approvedContacts * 5;

    res.json({
      totalBiodata,
      maleBiodata,
      femaleBiodata,
      premiumBiodata,
      revenue,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

// GET All Users (Manage Users)

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users with optional search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  const { search } = req.query;
  const query = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  const users = await User.find(query);
  res.json(users);
});

// PATCH Make Admin

/**
 * @swagger
 * /admin/users/admin/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Make a user an admin
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
 *         description: User promoted to admin
 */
router.patch("/users/admin/:id", verifyToken, verifyAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { role: "admin" });
  res.json({ message: "User made admin" });
});

// PATCH Make Premium (Directly from Manage Users)

/**
 * @swagger
 * /admin/users/premium/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Make a user premium
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
 *         description: User marked as premium
 */
router.patch(
  "/users/premium/:id",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isPremium: true });
    // Also update biodata if exists
    const user = await User.findById(req.params.id);
    if (user) {
      await Biodata.findOneAndUpdate(
        { userEmail: user.email },
        { isPremium: true },
      );
    }
    res.json({ message: "User made premium" });
  },
);

// GET Premium Requests

/**
 * @swagger
 * /admin/premium-requests:
 *   get:
 *     tags: [Admin]
 *     summary: Get all pending premium requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of premium requests
 */
router.get("/premium-requests", verifyToken, verifyAdmin, async (req, res) => {
  const requests = await PremiumRequest.find({ status: "pending" });
  res.json(requests);
});

// PATCH Approve Premium Request

/**
 * @swagger
 * /admin/premium-request/approve/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Approve a premium request
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
 *         description: Premium request approved
 */
router.patch(
  "/premium-request/approve/:id",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    const request = await PremiumRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "approved";
    await request.save();

    // Make user premium
    await User.findOneAndUpdate(
      { email: request.userEmail },
      { isPremium: true },
    );
    // Make biodata premium
    await Biodata.findOneAndUpdate(
      { biodataId: request.biodataId },
      { isPremium: true },
    );

    res.json({ message: "Premium Approved" });
  },
);

// GET Contact Requests

/**
 * @swagger
 * /admin/contact-requests:
 *   get:
 *     tags: [Admin]
 *     summary: Get all contact requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contact requests
 */
router.get("/contact-requests", verifyToken, verifyAdmin, async (req, res) => {
  // Return all or just pending? Assignment says "Approved Contact Request" page.
  // Assuming this endpoint serves the list to approve
  const requests = await ContactRequest.find(); // Can filter by status if needed
  res.json(requests);
});

// PATCH Approve Contact Request

/**
 * @swagger
 * /admin/contact-request/approve/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Approve a contact request
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
 *         description: Contact request approved
 */
router.patch(
  "/contact-request/approve/:id",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    await ContactRequest.findByIdAndUpdate(req.params.id, {
      status: "approved",
    });
    res.json({ message: "Contact Request Approved" });
  },
);

export default router;
