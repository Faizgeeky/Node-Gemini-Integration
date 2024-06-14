import express from "express";
const router = express.Router();
import User from "../models/UserModel.js"; // Assuming UserModel.js is your model file
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/authMiddleware.js";
import Question from "../models/QuestionModel.js";

router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:userId/questions", async (req, res) => {
  try {
    // Extract the user ID from the request parameters
    const userId = req.params.userId;

    // Find all questions asked by the user with the provided ID
    const questions = await Question.find({ user_id: userId });

    // If questions are found, send them in the response
    if (questions.length > 0) {
      res.json(questions);
    } else {
      // If no questions are found, send a 404 Not Found response
      res.status(404).json({ message: "No questions found for this user" });
    }
  } catch (error) {
    // Handle internal server errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
export default router;
