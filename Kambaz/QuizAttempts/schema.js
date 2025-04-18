import mongoose from "mongoose";

const quizAnswerSchema = new mongoose.Schema({
    questionId: String,
    answer: mongoose.Schema.Types.Mixed // 可以存储任何类型的答案
});

const quizAttemptSchema = new mongoose.Schema(
    {
        _id: String,
        quiz: { type: String, ref: "QuizModel" },
        user: { type: String, ref: "UserModel" },
        answers: [quizAnswerSchema],
        score: Number,
        maxScore: Number,
        completed: { type: Boolean, default: false },
        startedAt: { type: Date, default: Date.now },
        completedAt: Date
    },
    { collection: "quiz_attempts" }
);

export default quizAttemptSchema;