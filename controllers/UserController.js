import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/UserModel.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import Question from "../models/QuestionModel.js";

const router = express.Router();
dotenv.config();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Register new user
router.post("/", async (req, res) => {
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  try {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
    });

    const result = await newUser.save();
    console.log(res);
    res
      .status(201)
      .send({ message: "User created successfully!", userId: result.id }); // Send success message
  } catch (err) {
    if (err.code === 11000 && err.errmsg.includes("email")) {
      res.status(400).send({ message: "Email address already in use!" });
    } else {
      console.error(err);
      res
        .status(500)
        .send({ message: "There was a problem registering the user." });
    }
  }
});

// handle login
router.post("/auth/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user);
    const refreshTokenData = { id: user._id };
    const refreshToken = jwt.sign(
      refreshTokenData,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" } // Example: Expires in 7 days
    );

    // Store the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error" });
  }
});

router.post("/auth/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Invalidate the refresh token
    user.refreshToken = null;
    await user.save();

    res.status(200).send({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).send({ message: "Invalid token" });
    }
    res.status(500).send({ message: "Server error" });
  }
});

router.post("/auth/refresh", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    // Verify and decode the refresh token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Find user by ID from the decoded token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the provided token matches the stored refresh token
    if (user.refreshToken === token) {
      const accessToken = generateAccessToken(user);
      res.json({ accessToken });
    } else {
      return res.status(401).send({ message: "Invalid refresh token" });
    }
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).send({ message: "Invalid refresh token" });
    }
    res.status(500).send({ message: "Server error" });
  }
});

function generateAccessToken(user) {
  const accessToken = jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  return accessToken;
}

router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:userId/questions", authenticateToken, async (req, res) => {
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

// // RETURNS ALL THE USERS IN THE DATABASE
// router.get('/', function (req, res) {
//     User.find({}, function (err, users) {
//         if (err) return res.status(500).send("There was a problem finding the users.");
//         res.status(200).send(users);
//     });
// });

// // GETS A SINGLE USER FROM THE DATABASE
// router.get('/:id', function (req, res) {
//     User.findById(req.params.id, function (err, user) {
//         if (err) return res.status(500).send("There was a problem finding the user.");
//         if (!user) return res.status(404).send("No user found.");
//         res.status(200).send(user);
//     });
// });

// // DELETES A USER FROM THE DATABASE
// router.delete('/:id', function (req, res) {
//     User.findByIdAndRemove(req.params.id, function (err, user) {
//         if (err) return res.status(500).send("There was a problem deleting the user.");
//         res.status(200).send("User: "+ user.name +" was deleted.");
//     });
// });

// // UPDATES A SINGLE USER IN THE DATABASE
// router.put('/:id', function (req, res) {
//     User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, user) {
//         if (err) return res.status(500).send("There was a problem updating the user.");
//         res.status(200).send(user);
//     });
// });

export default router;
