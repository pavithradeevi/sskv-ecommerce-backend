import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import reviewModel from "../models/reviewModal.js";

// Function to add product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, bestseller, highlights, rating } = req.body;

    // Validate rating (ensure it's between 1 and 5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

    // Upload images to Cloudinary
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      highlights: highlights ? highlights.split(",") : [], // Convert comma-separated highlights into an array
      image: imagesUrl,
      rating: Number(rating),  // Store the rating value
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Function for listing products
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Function to remove product
const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId);
        res.json({ success: true, product });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const addReview = async (req, res) => {
  try {
    const { productId, userId, rating, reviewText } = req.body;

    // Ensure rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    // Create the review
    const review = new reviewModel({
      productId,
      userId,
      rating,
      reviewText,
    });

    await review.save();

    // Get all approved reviews for the product
    const reviews = await reviewModel.find({ productId, status: 'approved' });
    if (reviews.length > 0) {
      // Calculate the average rating
      const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Update the product's average rating
      await productModel.findByIdAndUpdate(productId, { averageRating });
    } else {
      // No approved reviews, set average rating to 0
      await productModel.findByIdAndUpdate(productId, { averageRating: 0 });
    }

    res.json({ success: true, message: "Review added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function to get reviews for a specific product
const getReviews = async (req, res) => {
  try {
    const { productId } = req.body;
    const reviews = await reviewModel.find({ productId, status: 'approved' }).populate('userId', 'name email');
    res.json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Function to moderate (approve/reject) a review
const moderateReview = async (req, res) => {
  try {
    const { reviewId, action } = req.body; // action: 'approve' or 'reject'

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.status = action;
    await review.save();

    // Recalculate the average rating for the product
    const reviews = await reviewModel.find({ productId: review.productId, status: 'approved' });
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await productModel.findByIdAndUpdate(review.productId, { averageRating });

    res.json({ success: true, message: `Review ${action}d successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export { 
  listProducts, 
  addProduct, 
  removeProduct, 
  singleProduct, 
  addReview, 
  getReviews, 
  moderateReview 
};

