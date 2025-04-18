import { v4 as uuidv4 } from "uuid";
import model from "./model.js";
import quizModel from "../Quizzes/model.js";

export async function createQuizAttempt(userId, quizId) {
    const quiz = await quizModel.findOne({ _id: quizId });
    if (!quiz) {
        throw new Error("Quiz not found");
    }

    const attemptsCount = await model.countDocuments({ user: userId, quiz: quizId });

    if (quiz.multipleAttempts === false && attemptsCount > 0) {
        throw new Error("Multiple attempts not allowed for this quiz");
    }

    if (attemptsCount >= quiz.attemptsAllowed) {
        throw new Error(`Maximum ${quiz.attemptsAllowed} attempts allowed for this quiz`);
    }

    const newAttempt = {
        _id: uuidv4(),
        quiz: quizId,
        user: userId,
        answers: [],
        startedAt: new Date().toISOString()
    };

    return model.create(newAttempt);
}

export async function findQuizAttemptsByUser(userId, quizId) {
    return model.find({ user: userId, quiz: quizId }).sort({ startedAt: -1 });
}

export async function findLatestQuizAttempt(userId, quizId) {
    return model.findOne({ user: userId, quiz: quizId }).sort({ startedAt: -1 });
}

// 获取测验尝试
export async function findQuizAttemptById(attemptId) {
    return model.findOne({ _id: attemptId });
}

// 保存答案
export async function saveQuizAnswer(attemptId, questionId, answer) {
    // 检查是否已存在这个问题的答案
    const attempt = await model.findOne({ _id: attemptId });
    if (!attempt) {
        throw new Error("Quiz attempt not found");
    }

    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionId === questionId);

    if (existingAnswerIndex >= 0) {
        // 更新现有答案
        return model.updateOne(
            { _id: attemptId, "answers.questionId": questionId },
            { $set: { "answers.$.answer": answer } }
        );
    } else {
        // 添加新答案
        return model.updateOne(
            { _id: attemptId },
            { $push: { answers: { questionId, answer } } }
        );
    }
}

// 提交测验并计算成绩
export async function submitQuizAttempt(attemptId) {
    const attempt = await model.findOne({ _id: attemptId });
    if (!attempt) {
        throw new Error("Quiz attempt not found");
    }

    const quiz = await quizModel.findOne({ _id: attempt.quiz });
    if (!quiz) {
        throw new Error("Quiz not found");
    }

    let score = 0;
    const maxScore = quiz.questions.reduce((total, q) => total + q.points, 0);

    // 检查每个答案是否正确
    for (const userAnswer of attempt.answers) {
        const question = quiz.questions.find(q => q._id === userAnswer.questionId);
        if (!question) continue;

        let isCorrect = false;

        switch (question.questionType) {
            case "MULTIPLE_CHOICE":
            case "TRUE_FALSE":
                // 对于单选题和是非题，检查是否选择了正确的答案
                const correctAnswer = question.answers.find(a => a.isCorrect);
                if (correctAnswer && userAnswer.answer === correctAnswer.text) {
                    isCorrect = true;
                }
                break;

            case "FILL_IN_BLANK":
                // 对于填空题，检查答案是否匹配任何可能的正确答案
                const correctAnswers = question.answers.filter(a => a.isCorrect).map(a => a.text.toLowerCase());
                if (correctAnswers.includes(userAnswer.answer.toLowerCase())) {
                    isCorrect = true;
                }
                break;
        }

        if (isCorrect) {
            score += question.points;
        }
    }

    // 更新尝试的分数和完成状态
    return model.updateOne(
        { _id: attemptId },
        {
            $set: {
                score,
                maxScore,
                completed: true,
                completedAt: new Date().toISOString()
            }
        }
    );
}