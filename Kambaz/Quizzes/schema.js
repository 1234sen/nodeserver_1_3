import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    text: String,
    isCorrect: Boolean
});

const questionSchema = new mongoose.Schema({
    _id: String,
    title: String,
    questionType: {
        type: String,
        enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_IN_BLANK"],
        default: "MULTIPLE_CHOICE"
    },
    points: { type: Number, default: 1 },
    question: String,
    answers: [answerSchema]
});

const quizSchema = new mongoose.Schema(
    {
        _id: String,
        title: { type: String, required: true },
        description: String,
        course: { type: String, ref: "CourseModel" },
        published: { type: Boolean, default: false },
        quizType: {
            type: String,
            enum: ["GRADED_QUIZ", "PRACTICE_QUIZ", "GRADED_SURVEY", "UNGRADED_SURVEY"],
            default: "GRADED_QUIZ"
        },
        assignmentGroup: {
            type: String,
            enum: ["QUIZZES", "EXAMS", "ASSIGNMENTS", "PROJECT"],
            default: "QUIZZES"
        },
        shuffleAnswers: { type: Boolean, default: true },
        timeLimit: { type: Number, default: 20 }, // in minutes
        multipleAttempts: { type: Boolean, default: false },
        attemptsAllowed: { type: Number, default: 1 },
        showCorrectAnswers: { type: Boolean, default: true },
        accessCode: String,
        oneQuestionAtATime: { type: Boolean, default: true },
        webcamRequired: { type: Boolean, default: false },
        lockQuestionsAfterAnswering: { type: Boolean, default: false },
        dueDate: Date,
        availableFrom: Date,
        availableUntil: Date,
        questions: [questionSchema],
        createdBy: { type: String, ref: "UserModel" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: Date
    },
    { collection: "quizzes" }
);

export default quizSchema;