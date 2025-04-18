import * as dao from "./dao.js";

export default function QuizRoutes(app) {
    app.get("/api/courses/:cid/quizzes", async (req, res) => {
        const { cid } = req.params;
        try {
            const quizzes = await dao.findQuizzesForCourse(cid);
            res.json(quizzes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.get("/api/quizzes/:qid", async (req, res) => {
        const { qid } = req.params;
        try {
            const quiz = await dao.findQuizById(qid);
            if (quiz) {
                res.json(quiz);
            } else {
                res.status(404).send("Quiz not found");
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.post("/api/courses/:cid/quizzes", async (req, res) => {
        const { cid } = req.params;
        try {
            console.log("Session data:", req.session);
            console.log("Current user:", req.session.currentUser);
            const currentUser = req.session.currentUser;
            if (!currentUser || currentUser.role !== "FACULTY") {
                return res.status(403).json({
                    message: "Only faculty can create quizzes",
                    sessionExists: !!req.session,
                    userExists: !!currentUser,
                    userRole: currentUser?.role
                });
            }

            const newQuiz = {
                ...req.body,
                course: cid,
                createdBy: currentUser._id
            };
            const quiz = await dao.createQuiz(newQuiz);
            res.json(quiz);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.put("/api/quizzes/:qid", async (req, res) => {
        const { qid } = req.params;
        try {
            console.log("收到PUT请求到/api/quizzes:", qid);
            console.log("Session:", req.session);
            console.log("Headers:", req.headers);

            const currentUser = req.session.currentUser;
            if (!currentUser) {
                return res.status(403).json({ message: "无法找到用户信息" });
            }

            if (currentUser.role !== "FACULTY") {
                return res.status(403).json({
                    message: "只有教师可以更新测验",
                    userRole: currentUser.role
                });
            }

            const status = await dao.updateQuiz(qid, req.body);
            res.json(status);
        } catch (error) {
            console.error("更新测验错误:", error);
            res.status(500).json({ message: error.message });
        }
    });

    app.delete("/api/quizzes/:qid", async (req, res) => {
        const { qid } = req.params;
        try {
            const currentUser = req.session.currentUser;
            if (!currentUser || currentUser.role !== "FACULTY") {
                return res.status(403).json({ message: "Only faculty can delete quizzes" });
            }

            const status = await dao.deleteQuiz(qid);
            res.json(status);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.post("/api/quizzes/:qid/questions", async (req, res) => {
        const { qid } = req.params;
        try {
            const currentUser = req.session.currentUser;
            if (!currentUser || currentUser.role !== "FACULTY") {
                return res.status(403).json({ message: "Only faculty can add questions" });
            }

            const status = await dao.addQuestionToQuiz(qid, req.body);
            res.json(status);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.put("/api/quizzes/:qid/questions/:questionId", async (req, res) => {
        const { qid, questionId } = req.params;
        try {
            const currentUser = req.session.currentUser;
            if (!currentUser || currentUser.role !== "FACULTY") {
                return res.status(403).json({ message: "Only faculty can update questions" });
            }

            const status = await dao.updateQuizQuestion(qid, questionId, req.body);
            res.json(status);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.delete("/api/quizzes/:qid/questions/:questionId", async (req, res) => {
        const { qid, questionId } = req.params;
        try {
            const currentUser = req.session.currentUser;
            if (!currentUser || currentUser.role !== "FACULTY") {
                return res.status(403).json({ message: "Only faculty can delete questions" });
            }

            const status = await dao.deleteQuizQuestion(qid, questionId);
            res.json(status);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
}