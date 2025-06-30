import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import mysqldump from "mysqldump";
import puppeteer from "puppeteer";
import mysql from 'mysql';
import mysqlNew from 'mysql2/promise';

export const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ap_db',
});

export const dbNew = await mysqlNew.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ap_db',
});

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.options('*', cors())
app.use(express.static('public'))
app.use(express.json({ limit: '5mb' }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
})

const upload = multer({
  storage: storage
})

app.get("/", (req, res) => {
  return res.json("BACKEND");
});

//Display All Employees
app.get("/emp", (req, res) => {
  const sql = "SELECT * FROM emp_info WHERE is_archive = 0";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ Message: "Database Error" });
    }
    return res.json(result);
  });
});

//Display Employee by ID when click View Button
app.get("/emp/:id", (req, res) => {
  const emp_id = req.params.id;
  const sql = "SELECT * FROM emp_info WHERE emp_id = ?";
  db.query(sql, [emp_id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Upload Employees Profile Picture
app.post('/upload/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.json({ Message: "No file uploaded" });
  }

  const image = req.file.filename;
  console.log("Uploaded file:", req.file);

  const sql = "UPDATE emp_info SET image = ? WHERE emp_id = ?";
  db.query(sql, [image, id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ Message: "Database Error" });
    }
    return res.json({ Status: "Success" });
  });
});

// To Login Users
app.post("/login", (req, res) => {
  const sql = "SELECT emp_id, role FROM users WHERE username = ? AND password = ?";
  db.query(sql, [req.body.user, req.body.password], (err, data) => {
    if (err) {
      return res.json("Error");
    }
    if (data.length > 0) {
      const userRole = data[0].role;
      const userId = data[0].emp_id;
      return res.json({
        message: "Log in Successfully",
        role: userRole,
        emp_id: userId
      });
    } else {
      return res.json("No Record Found");
    }
  });
});

//Login History
app.post('/login-history', (req, res) => {
  const loginEvent = req.body;
  const query = `INSERT INTO audit_trail (emp_id, date, role, action) VALUES (?, ?, ?, ?)`;
  db.query(query, [loginEvent.emp_id, loginEvent.date, loginEvent.role, loginEvent.action], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error storing login history' });
    } else {
      res.send({ message: 'Login history stored successfully' });
    }
  });
});

app.listen(8800, () => {
    console.log("Connected in Backend!");
});