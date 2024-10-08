import express from "express";
import mysql from "mysql";
import cors from "cors";


const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "apbs_db",
});

app.get("/", (req, res) => {
  return res.json("BACKEND");
});

// LOG IN

app.post("/login", (req, res) => {
  const sql = "SELECT role FROM users WHERE username = ? AND password = ?";
  db.query(sql, [req.body.username, req.body.password], (err, data) => {
    if (err) {
      return res.json("Error");
    }
    if (data.length > 0) {
      const userRole = data[0].role;
      return res.json({
        message: "Log in Successfully",
        role: userRole,
      });
    } else {
      return res.json("No Record Found");
    }
  });
});


// FETCH DATA LOG IN

app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// FETCH USERNAME
app.get("/username", (req, res) => {
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
app.get("/emp/:id", (req, res) => {
  const emp_id = req.params.id;
  const sql = "SELECT * FROM emp_info WHERE emp_id = ?";
  db.query(sql, [emp_id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// FETCH ALL DATA
app.get("/emp", (req, res) => {
  const sql = "SELECT * FROM emp_info WHERE is_archive = 0";
  db.query(sql, (err, results) => {
    if (err) return res.json(err);
    return res.json(results);
  });
});

app.put("/emp/:id", (req, res) => {
  const emp_id = req.params.id;
  const is_archive = req.body.is_archive;
  const sql = "UPDATE emp_info SET is_archive = ? WHERE emp_id = ?";
  db.query(sql, [is_archive, emp_id], (err, data) => {
    if (err) return res.json(err);
    return res.json({ status: 1, message: "Employee unarchived successfully" });
  });
});

// COUNT ALL EMPLOYEE
app.get("/count_emp", (req, res) => {
  const sql = "SELECT COUNT(*) AS count FROM emp_info WHERE is_archive = 0";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});


app.get("/archived", (req, res) => {
  const sql = "SELECT * FROM emp_info WHERE is_archive = 1";
  db.query(sql, (err, results) => {
    if (err) return res.json(err);
    return res.json(results); // Check if results itself is the array
  });
});



//FETCH CIVIL STATUS
app.get("/cs", (req, res) => {
  const sql = "SELECT * FROM civil_status";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
//FETCH SEX
app.get("/sex", (req, res) => {
  const sql = "SELECT * FROM sex";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH RATE TYPE
app.get("/ratetype", (req, res) => {
  const sql = "SELECT * FROM rate_type";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//LOGIN HISTORY
app.post('/login-history', (req, res) => {
  const loginEvent = req.body;
  const query = `INSERT INTO login_history (username, date, role) VALUES (?, ?, ?)`;
  db.query(query, [loginEvent.username, loginEvent.date, loginEvent.role], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error storing login history' });
    } else {
      res.send({ message: 'Login history stored successfully' });
    }
  });
});

app.get('/login-history-fetch', (req, res) => {
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

app.listen(8800, () => {
  console.log("Connected in Backend!");
});
