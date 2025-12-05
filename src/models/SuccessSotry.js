import mongoose from "mongoose";

const successStorySchema = new mongoose.Schema(
  {
    selfBiodataId: { type: Number, required: true },
    partnerBiodataId: { type: Number, required: true },
    coupleImage: { type: String, required: true },
    successStoryText: { type: String, required: true },
    marriageDate: { type: Date, default: Date.now },
    reviewStar: { type: Number, default: 5 }, // Optional default
  },
  { timestamps: true },
);

const SuccessStory = mongoose.model("SuccessStory", successStorySchema);
export default SuccessStory;
