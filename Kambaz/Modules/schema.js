import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    _id: String,
    name: String,
    description: String,
    course: { type: String, ref: "CourseModel" },
    lessons: { 
        type: [{
          _id: String,
          name: String,
          description: String
        }],
        default: []  // 默认值为空数组
      }
  },
  { collection: "modules" }
);
export default schema;

