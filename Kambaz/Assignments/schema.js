import mongoose from "mongoose";
const assignmentSchema = new mongoose.Schema(
    {
        _id: String,
        title: { type: String, required: true },
        description: String,
        points: { type: Number, default: 100 },
        course: { type: String, ref: "CourseModel" },
        dueDate: Date,
        availableFrom: Date,
        availableUntil: Date,
        published: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: Date
    },
    { collection: "assignments" }
);
export default assignmentSchema;