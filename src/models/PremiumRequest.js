import mongoose from "mongoose";

const premiumRequestSchema = new mongoose.Schema(
  {
    biodataId: { type: Number, required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
  },
  { timestamps: true },
);

const PremiumRequest = mongoose.model("PremiumRequest", premiumRequestSchema);
export default PremiumRequest;
