import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    biodataId: { type: Number, required: true },

    // Snapshot for list view
    name: { type: String },
    permanentAddress: { type: String },
    occupation: { type: String },
  },
  { timestamps: true },
);

const Favourite = mongoose.model("Favourite", favouriteSchema);
export default Favourite;
