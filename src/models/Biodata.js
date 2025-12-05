import mongoose from "mongoose";

const biodataSchema = new mongoose.Schema(
  {
    biodataId: { type: Number, unique: true, required: true },
    biodataType: { type: String, enum: ["Male", "Female"], required: true },
    name: { type: String, required: true },
    profileImage: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    height: { type: String, required: true },
    weight: { type: String, required: true },
    age: { type: Number, required: true },
    occupation: { type: String, required: true },
    race: { type: String, required: true },
    fathersName: { type: String, required: true },
    mothersName: { type: String, required: true },
    permanentDivision: { type: String, required: true },
    presentDivision: { type: String, required: true },
    expectedPartnerAge: { type: Number },
    expectedPartnerHeight: { type: String },
    expectedPartnerWeight: { type: String },
    contactEmail: { type: String, required: true }, // User's email
    mobileNumber: { type: String, required: true },

    // Relations
    userEmail: { type: String, required: true, unique: true }, // One biodata per user

    // Status
    isPremium: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

const Biodata = mongoose.model("Biodata", biodataSchema);
export default Biodata;
