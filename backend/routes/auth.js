import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.post("/login", (req, res) => {
  const sql = "SELECT emp_id, role FROM users WHERE username = ? AND password = ?";
  db.query(sql, [req.body.user ?? req.body.username, req.body.password], (err, data) => {
    if (err) {
      return res.json("Error");
    }
    if (data.length > 0) {
      return res.json({
        message: "Log in Successfully",
        role: data[0].role,
        emp_id: data[0].emp_id,
      });
    } else {
      return res.json("No Record Found");
    }
  });
});


// FETCH DATA LOG IN


router.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// FETCH USERNAME

router.get("/username", (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, username, (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0) {
      return res.json({ usernameExists: false });
    } else {
      return res.json({ usernameExists: true });
    }
  });
});
//

// FETCH SINGLE USER DATA

router.post('/login-history', (req, res) => {
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


router.post('/audit', (req, res) => {
  const { username, date, role, action } = req.body;
  const query = `INSERT INTO login_history (username, date, role, action) VALUES (?, ?, ?, ?)`;
  db.query(query, [username, date, role, action], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error storing login history' });
    } else {
      res.send({ message: 'Login history stored successfully' });
    }
  });
});



router.get('/fetch-audit', (req, res) => {
  const query = `SELECT * FROM login_history`;
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error fetching login history' });
    } else {
      res.send(result);
    }
  });
});

//EDUC BG

router.get("/manage-users", (req, res) => {
  const sql = "SELECT * FROM users"; // Adjust the query as necessary
  db.query(sql, (err, results) => {
    if (err) return res.json(err);
    return res.json(results);
  });
});

// Fetch data when RFID is scanned

export default router;
