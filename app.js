import express from "express";
import mongoose from "mongoose";
import { authenticateToken } from "./middleware/authMiddleware.js";
import UserController from "./controllers/UserController.js";
import QuestionController from "./controllers/QuestionController.js";
import { AiChatSession } from "./utils/aiModel.js";

//https://js.langchain.com/v0.1/docs/get_started/quickstart/

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.post("/answer-question", async (req, res, next) => {
  const result = await AiChatSession.sendMessage(
    "Answer the following question:" + req.body.question
  );
  const jsonResponse = await result.response.text();
  console.log(jsonResponse);

  res.status(200).send({
    answer: jsonResponse,
  });
});

app.use("/api/users", UserController);
app.use("/api/questions", authenticateToken, QuestionController);

export default app;
