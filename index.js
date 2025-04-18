import express from 'express'
import session from "express-session";
import fileStore from "session-file-store";

// 创建FileStore实例
const FileStore = fileStore(session);
import UserRoutes from "./Kambaz/Users/routes.js";
import cors from "cors";
import "dotenv/config";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import QuizRoutes from "./Kambaz/Quizzes/routes.js";
import QuizAttemptRoutes from "./Kambaz/QuizAttempts/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";  // 确保导入
import PeopleRoutes from "./Kambaz/People/routes.js";  // 添加People路由
import setupEnrollmentRoutes from "./Kambaz/Enrollments/routes.js";  // 添加Enrollment路由
import Hello from "./Hello.js";

//ch6
import mongoose from "mongoose";
const CONNECTION_STRING = "mongodb://root:C743B433407BE68EE62C46EDE8FB5A0C@139.196.182.230:27017/kambaz?authSource=admin" || process.env.MONGO_CONNECTION_STRING
// const CONNECTION_STRING = "mongodb+srv://atlas-sample-dataset-load-67f0ef4868787c0738994432:mSbyOXpKdN1Zgjb3@cluster0.xejvupe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// mongodb+srv://atlas-sample-dataset-load-67f0ef4868787c0738994432:mSbyOXpKdN1Zgjb3@cluster0.xejvupe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
mongoose.connect(CONNECTION_STRING);

mongoose.connection.on('connected', () => {
  console.log('MongoDB连接成功');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB连接错误:', err);
});


const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false, // 强制保存未修改的会话
  saveUninitialized: false, // 保存未初始化的会话
//store: new FileStore(),
  cookie: {
    secure: false, // 开发环境
    httpOnly: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: process.env.NODE_ENV === 'development' ?
      'localhost' : process.env.NODE_SERVER_DOMAIN
  }// 开发环境设为false，生产环境应为true
};
if (process.env.NODE_ENV === "development") {
  // 开发环境使用自签名证书
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
if (process.env.NODE_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    domain: process.env.NODE_SERVER_DOMAIN,
  };
}

const app = express();

const allowedOrigins = [
  "https://wonderful-paprenjak-03e135.netlify.app",
  "https://eatwhite-a6.netlify.app",
  "http://localhost:5173",
  "http://localhost:4173",
  
];

app.use(session(sessionOptions));
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    exposedHeaders: ["set-cookie"], // 新增暴露set-cookie头
  })
);


app.use(express.json());

Hello(app);

UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);  // 确保这行代码存在
PeopleRoutes(app);            // 应用People路由
setupEnrollmentRoutes(app);   // 应用Enrollment路由
QuizRoutes(app);
QuizAttemptRoutes(app);
app.listen(process.env.PORT || 4000);
