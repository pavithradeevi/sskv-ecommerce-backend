import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
});

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;
