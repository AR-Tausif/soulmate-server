import mongoose from "mongoose";

const contactRequestSchema = new mongoose.Schema(
  {
    biodataId: { type: Number, required: true },
    requesterEmail: { type: String, required: true }, // Who is asking
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    transactionId: { type: String },
    amount: { type: Number, default: 5 }, // 5 USD

    // Snapshot data for easier display
    biodataName: { type: String },
    biodataEmail: { type: String },
    biodataPhone: { type: String },
  },
  { timestamps: true },
);

const ContactRequest = mongoose.model("ContactRequest", contactRequestSchema);
export default ContactRequest;
