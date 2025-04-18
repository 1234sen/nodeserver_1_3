import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

// Get all assignments for a course
export async function findAssignmentsForCourse(courseId) {
    return model.find({ course: courseId });
}

// Create new assignment
export async function createAssignment(assignment) {
    const newAssignment = {
        _id: uuidv4(),
        ...assignment,
        createdAt: new Date().toISOString()
    };
    return model.create(newAssignment);
}

// Update assignment
export async function updateAssignment(aid, assignment) {
    return model.updateOne(
        { _id: aid },
        {
            ...assignment,
            updatedAt: new Date().toISOString()
        }
    );
}

// Delete assignment
export async function deleteAssignment(aid) {
    return model.deleteOne({ _id: aid });
}

// Get assignment by ID
export async function findAssignmentById(assignmentId) {
    return model.findOne({ _id: assignmentId });
} 