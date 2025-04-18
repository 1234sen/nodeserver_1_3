import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";
import model from "./model.js";


export function findModulesForCourse(courseId) {
    return model.find({ course: courseId });
    // const { modules } = Database;
    // return modules.filter((module) => module.course === courseId);
   }
   

   export function createModule(module) {
    const newModule = { ...module, _id: uuidv4() };
    return model.create(newModule);
    // Database.modules = [...Database.modules, newModule];
    // return newModule;
   }
   

export function deleteModule(moduleId) {
    // const { modules } = Database;
    // Database.modules = modules.filter((module) => module._id !== moduleId);
    // return { status: "OK" };
    return model.deleteOne({ _id: moduleId });
}

export function updateModule(moduleId, moduleUpdates) {
    // const { modules } = Database;
    // const module = modules.find((module) => module._id === moduleId);
    // if (module) {
    //     Object.assign(module, moduleUpdates);
    //     return module;
    // }
    // return null;
    return model.updateOne({ _id: moduleId }, moduleUpdates);

}

export function findModuleById(moduleId) {
    const { modules } = Database;
    return modules.find((module) => module._id === moduleId);
} 