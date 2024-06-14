import express from "express";
const router = express.Router();
import Question from "../models/QuestionModel.js";
import { AiChatSession } from "../utils/aiModel.js";

router.post("/", async (req, res) => {
  try {
    const content = req.body.question;
    const result = await AiChatSession.sendMessage(
      "Answer the following question:" + req.body.question
    );
    const answer = await result.response.text();
    const question = new Question({
      user_id: req.userId,
      content,
      answer,
    });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const question = await Question.find();
    if (!question)
      return res.status(404).json({ error: "Questions not found" });
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:questionId", async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
