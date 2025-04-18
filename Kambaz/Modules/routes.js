import * as dao from "./dao.js";

export default function ModuleRoutes(app) {
    // Get module by ID
    app.get("/api/modules/:moduleId", (req, res) => {
        const { moduleId } = req.params;
        const module = dao.findModuleById(moduleId);
        if (module) {
            res.json(module);
        } else {
            res.status(404).json({ message: "Module not found" });
        }
    });

    // Update module
    app.put("/api/modules/:moduleId",async (req, res) => {
        const { moduleId } = req.params;
        const moduleUpdates = req.body;
        const status = await dao.updateModule(moduleId, moduleUpdates);
        res.json(status);
    });

    // Delete module
    app.delete("/api/modules/:moduleId",async (req, res) => {
        const { moduleId } = req.params;
        const status = await dao.deleteModule(moduleId);
        res.json(status);
    });

    app.post("/api/courses/:courseId/modules", async (req, res) => {
        const { courseId } = req.params;
        const module = {
          ...req.body,
          course: courseId,
        };
        const newModule = await modulesDao.createModule(module);
        res.send(newModule);
      });
     

} 