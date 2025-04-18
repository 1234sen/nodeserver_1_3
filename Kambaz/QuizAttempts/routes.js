import * as dao from "./dao.js";

export default function QuizAttemptRoutes(app) {
    app.post("/api/quizzes/:qid/attempts", async (req, res) => {
        try {
            console.log("收到开始测验请求:", req.params.qid);
            console.log("当前用户:", req.session.currentUser);

            if (!req.session.currentUser) {
                return res.status(403).json({ message: "未登录用户不能开始测验" });
            }

            const attempt = await dao.createQuizAttempt(
                req.session.currentUser._id,
                req.params.qid
            );

            res.json(attempt);
        } catch (error) {
            console.error("创建测验尝试错误:", error);
            res.status(500).json({ message: error.message || "创建测验尝试失败" });
        }
    });

    app.get("/api/users/:uid/quizzes/:qid/attempts", async (req, res) => {
        const { uid, qid } = req.params;
        try {
            const currentUser = req.session.currentUser;
            if (!currentUser || (String(currentUser._id) !== String(uid) && currentUser.role !== "FACULTY")) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const attempts = await dao.findQuizAttemptsByUser(uid, qid);
            res.json(attempts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.get("/api/users/:uid/quizzes/:qid/latest-attempt", async (req, res) => {
        const { uid, qid } = req.params;
        try {
            const currentUser = req.session.currentUser;
            if (!currentUser || (String(currentUser._id) !== String(uid) && currentUser.role !== "FACULTY")) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const attempt = await dao.findLatestQuizAttempt(uid, qid);
            res.json(attempt);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.get("/api/quiz-attempts/:attemptId", async (req, res) => {
        const { attemptId } = req.params;
        try {
            const attempt = await dao.findQuizAttemptById(attemptId);
            if (!attempt) {
                return res.status(404).json({ message: "Quiz attempt not found" });
            }

            const currentUser = req.session.currentUser;
            if (!currentUser || (String(currentUser._id) !== String(attempt.user) && currentUser.role !== "FACULTY")) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            res.json(attempt);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.post("/api/quiz-attempts/:attemptId/questions/:questionId/answer", async (req, res) => {
        const { attemptId, questionId } = req.params;
        const { answer } = req.body;

        try {
            const attempt = await dao.findQuizAttemptById(attemptId);
            if (!attempt) {
                return res.status(404).json({ message: "Quiz attempt not found" });
            }

            const currentUser = req.session.currentUser;
            if (!currentUser || String(currentUser._id) !== String(attempt.user)) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            if (attempt.completed) {
                return res.status(400).json({ message: "Cannot modify a completed quiz attempt" });
            }

            const status = await dao.saveQuizAnswer(attemptId, questionId, answer);
            res.json(status);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.post("/api/quiz-attempts/:attemptId/submit", async (req, res) => {
        const { attemptId } = req.params;

        try {
            const attempt = await dao.findQuizAttemptById(attemptId);
            if (!attempt) {
                return res.status(404).json({ message: "Quiz attempt not found" });
            }

            const currentUser = req.session.currentUser;
            if (!currentUser || String(currentUser._id) !== String(attempt.user)) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            if (attempt.completed) {
                return res.status(400).json({ message: "Quiz attempt already submitted" });
            }

            const result = await dao.submitQuizAttempt(attemptId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
}