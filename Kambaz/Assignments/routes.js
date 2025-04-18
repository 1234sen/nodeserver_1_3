import * as dao from "./dao.js";

export default function AssignmentRoutes(app) {
    // 获取课程的所有作业
    app.get("/api/courses/:cid/assignments", async (req, res) => {
        const { cid } = req.params;
        try {
            const assignments = await dao.findAssignmentsForCourse(cid);
            res.json(assignments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // 获取特定作业
    app.get("/api/assignments/:aid", async (req, res) => {
        const { aid } = req.params;
        try {
            const assignment = await dao.findAssignmentById(aid);
            if (assignment) {
                res.json(assignment);
            } else {
                res.status(404).send("Assignment not found");
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // 创建新作业
    app.post("/api/courses/:cid/assignments", async (req, res) => {
        const { cid } = req.params;
        try {
            const newAssignment = {
                ...req.body,
                course: cid
            };
            const assignment = await dao.createAssignment(newAssignment);
            res.json(assignment);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // 更新作业
    app.put("/api/assignments/:aid", async (req, res) => {
        const { aid } = req.params;
        try {
            const status = await dao.updateAssignment(aid, req.body);
            res.json(status);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // 删除作业
    app.delete("/api/assignments/:aid", async (req, res) => {
        const { aid } = req.params;
        try {
            const status = await dao.deleteAssignment(aid);
            res.json(status);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
} 