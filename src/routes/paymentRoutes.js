import express from "express";
import Stripe from "stripe";
import { verifyToken } from "../middleware/authMiddleware.js";
import ContactRequest from "../models/ContactRequest.js";
import Biodata from "../models/Biodata.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Stripe Payment Processing
 */

// Create Payment Intent

/**
 * @swagger
 * /payment/create-payment-intent:
 *   post:
 *     tags: [Payment]
 *     summary: Create a Stripe payment intent
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/PaymentIntentInput"
 *     responses:
 *       200:
 *         description: Payment intent created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentIntentOutput"
 *       500:
 *         description: Server error
 */

router.post("/create-payment-intent", verifyToken, async (req, res) => {
  const { price } = req.body;
  const amount = price * 100; // Stripe works in cents

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    payment_method_types: ["card"],
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

// Save Payment Info (Create Contact Request)

/**
 * @swagger
 * /payment/save-info:
 *   post:
 *     tags: [Payment]
 *     summary: Save payment info and create a contact request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/SavePaymentInput"
 *     responses:
 *       200:
 *         description: Payment info saved and request pending approval
 *       404:
 *         description: Biodata not found
 *       500:
 *         description: Server error
 */
router.post("/save-info", verifyToken, async (req, res) => {
  const { biodataId, userEmail, transactionId } = req.body;

  try {
    // Fetch biodata details for snapshot
    const biodata = await Biodata.findOne({ biodataId });
    if (!biodata) return res.status(404).json({ message: "Biodata not found" });

    const newRequest = new ContactRequest({
      biodataId,
      requesterEmail: userEmail,
      transactionId,
      biodataName: biodata.name,
      biodataEmail: biodata.contactEmail,
      biodataPhone: biodata.mobileNumber,
      status: "pending", // Admin must approve
    });

    await newRequest.save();
    res.json({ message: "Payment successful, request pending approval" });
  } catch (error) {
    res.status(500).json({ message: "Error saving payment info" });
  }
});

export default router;
