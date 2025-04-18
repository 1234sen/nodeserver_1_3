import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export async function findQuizzesForCourse(courseId) {
    return model.find({ course: courseId });
}

export async function findQuizById(quizId) {
    return model.findOne({ _id: quizId });
}

export async function createQuiz(quiz) {
    const newQuiz = {
        _id: uuidv4(),
        ...quiz,
        createdAt: new Date().toISOString()
    };
    return model.create(newQuiz);
}

export async function updateQuiz(qid, quiz) {
    return model.updateOne(
        { _id: qid },
        {
            ...quiz,
            updatedAt: new Date().toISOString()
        }
    );
}

export async function deleteQuiz(qid) {
    return model.deleteOne({ _id: qid });
}

export async function addQuestionToQuiz(qid, question) {
    const newQuestion = {
        _id: uuidv4(),
        ...question
    };
    return model.updateOne(
        { _id: qid },
        { $push: { questions: newQuestion } }
    );
}

export async function updateQuizQuestion(qid, questionId, question) {
    return model.updateOne(
        { _id: qid, "questions._id": questionId },
        { $set: { "questions.$": { _id: questionId, ...question } } }
    );
}

export async function deleteQuizQuestion(qid, questionId) {
    return model.updateOne(
        { _id: qid },
        { $pull: { questions: { _id: questionId } } }
    );
}