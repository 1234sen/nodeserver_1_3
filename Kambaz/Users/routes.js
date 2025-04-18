import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
  const createUser = async (req, res) => {
    const user = await dao.createUser(req.body);
    res.json(user);
  };

  const deleteUser = async (req, res) => {
    const status = await dao.deleteUser(req.params.userId);
    res.json(status);
};

  const findAllUsers = async (req, res) => {
    const { role,name } = req.query;
    if (role) {
      const users = await dao.findUsersByRole(role);
      res.json(users);
      return;
    }
    if (name) {
      const users = await dao.findUsersByPartialName(name);
      res.json(users);
      return;
    }


    const users = await dao.findAllUsers();
    res.json(users);
  };

  const findUserById = async (req, res) => {
    const user = await dao.findUserById(req.params.userId);
    res.json(user);
  };

  const updateUser = async (req, res) => {
    const { userId } = req.params;
    const userUpdates = req.body;
    await dao.updateUser(userId, userUpdates);
    const currentUser = req.session["currentUser"];
   if (currentUser && currentUser._id === userId) {
     req.session["currentUser"] = { ...currentUser, ...userUpdates };
   }
    res.json(currentUser);
  };


  const signup = async (req, res) => {
    const user = await dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json(
        { message: "Username already in use" });
      return;
    }
    const currentUser = await dao.createUser(req.body);
    req.session["currentUser"] = currentUser;
    res.json(currentUser);
  };

  const signin =async (req, res) => {
    const { username, password } = req.body;
    const currentUser = await dao.findUserByCredentials(username, password);
    if (currentUser) {
      req.session.currentUser = currentUser;

      req.session.cookie.secure = false; // 开发环境使用http
      req.session.cookie.sameSite = "lax";
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30天

      req.session.save(err => {
        if (err) {
          console.error('保存会话错误:', err);
          return res.status(500).json({ message: "会话保存失败" });
        }
        res.json(currentUser);
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  };
  const signout = (req, res) => {
    req.session.destroy();

    res.sendStatus(200);
  };

  const profile = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }

    res.json(currentUser);
  };
  const findCoursesForEnrolledUser = (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    const courses = courseDao.findCoursesForEnrolledUser(userId);
    res.json(courses);
  };
  const createCourse = (req, res) => {
    const currentUser = req.session["currentUser"];
    const newCourse = courseDao.createCourse(req.body);
    enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };

  const getCourses = (req, res) => {
    const currentUser = req.session["currentUser"];
    const courses = courseDao.findCoursesForEnrolledUser(currentUser._id);
    res.json(courses);
  }
  const findCoursesForUser = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    if (currentUser.role === "ADMIN") {
      const courses = await courseDao.findAllCourses();
      res.json(courses);
      return;
    }
    let { uid } = req.params;
    if (uid === "current") {
      uid = currentUser._id;
    }
    const courses = await enrollmentsDao.findCoursesForUser(uid);
    res.json(courses);
  };

  const enrollUserInCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
    res.send(status);
  };
  const unenrollUserFromCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
    res.send(status);
  };
  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);

  app.get("/api/users/:uid/courses", findCoursesForUser);
  // const getCourses = (req, res) => {
  //   console.log('Session ID:', req.sessionID); // 调试日志
  //   console.log('Session data:', req.session); // 调试日志

  //   const currentUser = req.session["currentUser"];
  //   if (!currentUser) {
  //     console.log('No current user in session'); // 调试日志
  //     return res.status(401).json({ message: "未登录或会话已过期" });
  //   }

  //   try {
  //     const courses = courseDao.findCoursesForEnrolledUser(currentUser._id);
  //     res.json(courses);
  //   } catch (error) {
  //     console.error('获取课程错误:', error);
  //     res.status(500).json({ message: "服务器错误" });
  //   }
  // }

  // app.use((req, res, next) => {
  //   // console.log("Session ID:", req.sessionID);
  //   // console.log("Session Data:", req.session);
  //   next();
  // });
  app.post("/api/users/current/courses", createCourse);
  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);

  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);
  app.get("/api/users/current/courses", courseDao.findAllCourses);


  app.get('/check-session', (req, res) => {
    console.log('Current session:', req.session); // 打印当前 session
    if (req.session.currentUser) {
      res.json({ message: "User is logged in", user: req.session.currentUser });
    } else {
      res.status(401).json({ message: "No user is logged in" });
    }
  });
}

