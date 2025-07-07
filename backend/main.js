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

  const sql = "UPDATE emp_info SET image = ? WHERE emp_id = ?";
  db.query(sql, [image, id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ Message: "Database Error" });
    }
    return res.json({ Status: "Success" });
  });
});

// INSERT EMPLOYEE INFO
app.post('/AddEmp', (req, res) => {
  const { surname, firstname, middlename, suffix, civilStatusId, sexId, citizenshipId, religionId, dateOfBirth, provinceOfBirth, municipalityOfBirth,
    email, number, region, province, municipality, barangay, streetadd,
    status, employmentType, position, ratetype, rateValue, department, datestart, dateend, sss, philHealth, hdmf, tin } = req.body;

  const query = 'INSERT INTO emp_info (l_name, f_name, m_name, suffix, civil_status, sex, citizenship, religion, birthday, province_of_birth, city_of_birth, email, mobile_num, region, province, city, barangay, street, emp_status, emp_type, position,  rate_type, salary_rate, department, date_hired, date_end, tin_num, sss_num, philhealth_num, hdmf_num) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)';
  db.query(query, [surname, firstname, middlename, suffix, civilStatusId, sexId, citizenshipId, religionId, dateOfBirth, provinceOfBirth, municipalityOfBirth,
    email, number, region.region_name, province, municipality, barangay, streetadd,
    status, employmentType, position, ratetype, rateValue, department, datestart, dateend, sss, philHealth, hdmf, tin], (error, results) => {
      if (error) {
        console.error('Error inserting employee into database:', error); // Log error details
        return res.status(500).json({ error: 'Failed to insert employee' });
      }

      res.status(200).json({ insertId: results.insertId });
    });
});

// Add educational background
app.post('/AddEducbg', (req, res) => {
  const eduBgData = req.body; // Get the incoming data
  console.log('Received educational background data:', eduBgData); // Log the incoming data

  // Check if eduBgData is an array
  if (!Array.isArray(eduBgData)) {
    console.error('Expected eduBgData to be an array, but got:', typeof eduBgData);
    return res.status(400).json({ error: 'Invalid data format for educational background' });
  }

  // Proceed with inserting data into the database
  const queries = eduBgData.map(item => {
    const query = 'INSERT INTO education_background (emp_id, school_uni_id, school_university, category, year) VALUES (?, ?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
      db.query(query, [item.emp_id, item.school_uni_id, item.school_university, item.category, item.year], (error, results) => {
        if (error) {
          console.error('Error inserting educational background:', error);
          return reject(error);
        }
        resolve(results);
      });
    });
  });

  Promise.all(queries)
    .then(() => res.status(200).json({ message: 'Educational background added successfully!' }))
    .catch(error => {
      console.error('Error in processing educational background:', error);
      res.status(500).json({ error: 'Failed to add educational background' });
    });
});

// INSERT EMPLOYEE EARNINGS ADDITIONAL BENIFITS
app.post('/AddEmpBenefits', (req, res) => {
  const benefitsData = req.body;

  // Check if benefitsData is an array; if not, respond with an error
  if (!Array.isArray(benefitsData)) {
    console.error('Expected benefitsData to be an array, but got:', typeof benefitsData);
    return res.status(400).json({ error: 'Invalid data format for benefits data' });
  }
  const queries = benefitsData.map(item => {
    const query = 'INSERT INTO allowance_benefits (emp_id, allowance_name, allowance_value, allowance_type) VALUES (?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
      db.query(query, [item.emp_id, item.name, item.value, item.allowanceType], (error, results) => {
        if (error) {
          console.error('Error inserting benefits data:', error);
          return reject(error);
        }
        resolve(results);
      });
    });
  });

  Promise.all(queries)
    .then(() => res.status(200).json({ message: 'Benefits added successfully!' }))
    .catch(error => {
      console.error('Error in processing benefits data:', error);
      res.status(500).json({ error: 'Failed to add benefits' });
    });
});

//Fetch Civil Status
app.get("/cs", (req, res) => {
  const sql = "SELECT * FROM civil_status";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH Sex thje Sex
app.get("/sex", (req, res) => {
  const sql = "SELECT * FROM sex";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Archive Employee
app.get("/archived", (req, res) => {
  const sql = "SELECT * FROM emp_info WHERE is_archive = 1";
  db.query(sql, (err, results) => {
    if (err) return res.json(err);
    return res.json(results); // Check if results itself is the array
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

// COUNT INACTIVE EMPLOYEE
app.get("/inactive_emp", (req, res) => {
  const sql = "SELECT COUNT(*) AS count FROM emp_info WHERE is_archive = 1";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH Religion
app.get("/religion", (req, res) => {
  const sql = "SELECT * FROM religion";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH RATE TYPE
app.get("/rate-type", (req, res) => {
  const sql = "SELECT * FROM rate_type";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH RATE TYPE Value
app.get("/rate-type-value", (req, res) => {
  const sql = "SELECT * FROM rate_type_value";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH employment_type
app.get("/employment_type", (req, res) => {
  const sql = "SELECT * FROM employment_type";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Fetch Department For Report
app.get("/fetch-department", (req, res) => {
  const sql = "SELECT * FROM emp_department";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Employee Status
app.get("/status", (req, res) => {
  const sql = "SELECT * FROM emp_status";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Fetch data when RFID is scanned
app.get("/scan/:rfid", (req, res) => {
  const { rfid } = req.params;
  const sql = "SELECT emp_id, f_name, m_name, l_name, image FROM emp_info WHERE rfid = ?";
  db.query(sql, [rfid], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve data' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No employee found with this RFID' });
    }

    const employee = results[0];
    // Make sure the image path is correct
    employee.image = `http://localhost:8800/images/${employee.image}`; // Ensure it's a complete URL
    return res.json(employee); // Return the first match (assuming unique RFID)
  });
});

// Register RFID for employee
app.post("/register-rfid", (req, res) => {
  const { emp_id, rfid } = req.body;

  // SQL query to update the RFID of the selected employee
  const sql = "UPDATE emp_info SET rfid = ? WHERE emp_id = ?";
  db.query(sql, [rfid, emp_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to register RFID" });
    }
    return res.status(200).json({ message: "RFID registered successfully!" });
  });
});

// Attendance Time In Handler
app.post('/attendance-scan', (req, res) => {
  const { emp_id, time, date } = req.body;

  const query = `SELECT * FROM emp_attendance WHERE emp_id = ? AND date = ?`;
  db.query(query, [emp_id, date], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: 'Database error.' });
    }

    const currentTime = new Date(`${time}:00`);
    const workStart = new Date(`${date}T11:00:00`);
    const workEnd = new Date(`${date}T16:00:00`);
    const graceLimit = new Date(workStart.getTime() + 10 * 60000); // 11:10 AM


    const getDayStatus = (dateStr) => {
      const date = new Date(dateStr);
      const day = date.getDay();
      if (day === 0) return "Holiday";
      if (day === 6) return "Special Hoilday";
      return "Regular Day";
    }

    const getHours = (start, end) => {
      const ms = new Date(end) - new Date(start);
      return +(ms / (1000 * 60 * 60)).toFixed(2);
    }

    if (results.length === 0) {
      // Time-in
      const status = currentTime > graceLimit ? 'Late' : 'On time';
      const insertQuery = `
        INSERT INTO emp_attendance (emp_id, time_in, date, entry_status)
        VALUES (?, ?, ?, ?)
      `;
      db.query(insertQuery, [emp_id, time, date, status], (err) => {
        if (err) {
          console.error("Insert Time-in error:", err);
          return res.status(500).json({ message: 'Failed to time in.' });
        }
        return res.status(200).json({ message: `Time-in recorded (${status}).` });
      });

    } else if (!results[0].time_out) {
      // Time-out
      const record = results[0];
      let timeOutStatus = 'On time';
      if (currentTime < workEnd) {
        timeOutStatus = 'Left early';
      } else if (currentTime > workEnd) {
        timeOutStatus = 'Overtime';
      }

      //Total Working Hours
      const timeOutISO = `${time.length === 5 ? time + ':00' : time}`;
      const totalHours  = getHours(record.time_in, timeOutISO);
      const overTime = currentTime > workEnd ? getHours(workEnd, currentTime) : 0;
      const dayStatus = getDayStatus(date);

      console.log(timeOutISO);

      //Calculate Break Hours
      let breakHours = 0;
      if (record.break_in && record.break_out) {
        breakHours = getHours(`${date}T${record.break_in}`, `${date}T${record.break_out}`);
      }


      const updateQuery = `
        UPDATE emp_attendance
        SET total_break_hours = ?, total_hours = ?, total_ot_hours = ?, day_status = ?, time_out = ?, time_out_status = ?
        WHERE emp_id = ? AND date = ?
      `;
      db.query(updateQuery, [breakHours, totalHours, overTime, dayStatus, time, timeOutStatus, emp_id, date], (err) => {
        if (err) {
          console.error("Update Time-out error:", err);
          return res.status(500).json({ message: 'Failed to time out.' });
        }
        return res.status(200).json({ message: `Time-out recorded (${timeOutStatus}).`,
          total_break_hours: breakHours,
          total_hours: totalHours,
          total_ot_hours: overTime,
          day_status: dayStatus
        });
      });

    } else {
      // Already has time-out
      return res.status(409).json({ message: 'You have already timed in and out today.' });
    }
  });
});


app.listen(8800, () => {
    console.log("Connected in Backend!");
});