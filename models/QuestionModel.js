import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    answer: { type: String }
});

const Question = mongoose.model('Question', QuestionSchema);

export default Question;
