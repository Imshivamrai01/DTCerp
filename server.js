const express = require("express");
const next = require("next");
const connectDb = require("./db/connect");
require("dotenv").config({ path: ".env.local" }); // Use Next.js local env
require("colors");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const { errorHandler } = require("./middleware/errorMiddleware");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {
  const app = express();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  connectDb();

  app.use(cors({ origin: true, credentials: true }));
  const nextApiRoutes = ['/api/auth', '/api/academic-structure', '/api/test-db'];
  
  app.use((req, res, next) => {
    if (nextApiRoutes.some(route => req.path.startsWith(route))) {
      return next(); // Skip parsing, let Next.js handle it
    }
    next();
  });
  
  const parseJson = express.json();
  const parseUrl = express.urlencoded({ extended: false });
  const parseFile = fileUpload({ useTempFiles: true, tempFileDir: "./tmp/" });
  const parseCookie = cookieParser();

  app.use((req, res, next) => {
    if (nextApiRoutes.some(route => req.path.startsWith(route))) return next();
    parseJson(req, res, (err) => {
      if (err) return next(err);
      parseUrl(req, res, (err) => {
        if (err) return next(err);
        parseCookie(req, res, (err) => {
          if (err) return next(err);
          parseFile(req, res, next);
        });
      });
    });
  });

  // Mount original Express routes
  app.use("/api/firebase-auth", require("./routes/firebaseOtpRoutes"));
  app.use("/api/user", require("./routes/userRoutes"));
  app.use("/api/student", require("./routes/studentRoutes"));
  app.use("/api/copy-check", require("./routes/copyCheckRoutes"));
  app.use("/api/exam-record", require("./routes/examRecordRoutes"));
  app.use("/api/home", require("./routes/homepgeRoutes"));
  app.use("/api/fee", require("./routes/feeRoutes"));
  app.use("/api/fee-structure", require("./routes/feeStructureRoutes"));
  app.use("/api/remark", require("./routes/remarkRoutes"));
  app.use("/api/homework", require("./routes/homeworkRoutes"));
  app.use("/api/student-attendance", require("./routes/studentAttendenceRoutes"));
  app.use("/api/teacher-attendance", require("./routes/tacherAttendanceRoutes"));
  app.use("/api/coordinator-assignment", require("./routes/coordinatorAssignmentRoutes"));
  app.use("/api/lab", require("./routes/labRoutes"));
  app.use("/api/parent", require("./routes/parentRoutes"));

  app.use(errorHandler);

  // Fallback to Next.js router
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Full-Stack Next.js + Express App is running on http://localhost:${PORT}`.cyan.bold);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});
