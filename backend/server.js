import express from "express";
import mysql from "mysql";
import cors from "cors";
import multer from "multer";
import path from "path";
import mysqldump from "mysqldump";
import puppeteer from "puppeteer";


const app = express();
app.use(express.json());
app.use(cors());
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
const __dirname = path.resolve();
const uploadDB = multer({ dest: "uploads/" });

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "apbs_db",
});

app.get("/", (req, res) => {
  return res.json("BACKEND");
});

//Backup DB
app.get("/backup", (req, res) => {
  mysqldump({
    connection: {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'apbs_db',
    },
    dumpToFile: '(C:)/backup.sql',
  })
    .then(() => res.send("Backup created successfully!"))
    .catch((error) => res.status(500).send("Error creating backup: " + error.message));
});

//Generate PDF
async function generatePDF(url, outputfile) {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'], });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });
    await page.pdf({ path: outputfile, format: 'A4' });

    await browser.close();

  } catch (err) {
    console.log(err)
  }
}

app.post("/generate-pdf", async (req, res) => {
  const url = "http://localhost:3000/PayslipFormat"; // Replace with your frontend URL
  const outputfile = path.resolve(__dirname, "payslip.pdf");

  try {
    await generatePDF(url, outputfile);
    res.sendFile(outputfile); // Send the generated PDF to the client
  } catch (err) {
    res.status(500).send({ error: "Failed to generate PDF" });
  }
});

//Restore DB
app.post("/restore", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  const exec = require("child_process").exec;
  const command = `mysql -u root -p"" apbs_db < ${filePath}`;

  exec(command, (error) => {
    if (error) {
      res.status(500).send("Error restoring database: " + error.message);
    } else {
      res.send("Database restored successfully!");
    }
  });
});

//Download DB
app.get("/download", (req, res) => {
  const filePath = "(C:)/backup.sql";
  res.download(filePath, "backup.sql", (err) => {
    if (err) {
      res.status(500).send("Error downloading backup: " + err.message);
    }
  });
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

// COUNT INACTIVE EMPLOYEE
app.get("/inactive_emp", (req, res) => {
  const sql = "SELECT COUNT(*) AS count FROM emp_info WHERE is_archive = 1";
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
  const sql = "SELECT * FROM emp_ratetype";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH RATE TYPE Value
app.get("/ratetypevalue", (req, res) => {
  const sql = "SELECT * FROM emp_ratetype_value";
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

//FETCH employment_type
app.get("/status", (req, res) => {
  const sql = "SELECT * FROM emp_status";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH DEPARTMENT
app.get("/department", (req, res) => {
  const sql = "SELECT * FROM emp_department";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH Citizenship
app.get("/citi", (req, res) => {
  const sql = "SELECT nationality FROM countries";
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

//FETCH Leave Type
app.get("/leavetype", (req, res) => {
  const sql = "SELECT * FROM emp_leave_type";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH emp file leave
app.get("/empfileleave", (req, res) => {
  const sql = "SELECT emp_id, f_name, m_name, l_name, suffix FROM emp_info";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH emp file leave
app.get("/empleavedata", (req, res) => {
  const sql = "SELECT * FROM emp_leave_balance";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH EMP_LEAVE BY ID INSIDE MODAL
app.get("/empleavesaved/:empId", (req, res) => {
  const empId = req.params.empId;
  const sql = "SELECT emp_id, leave_type_id, leave_type_name,leave_use, date_start, date_end FROM emp_leave WHERE emp_id = ?";

  db.query(sql, [empId], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH emp file leave
app.get("/empleave", (req, res) => {
  const sql = "SELECT * FROM emp_leave";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//FETCH emp file leave by ID
app.get("/empleavebalance/:empId", (req, res) => {
  const empId = req.params.empId;
  const sql = "SELECT leave_type_id, leave_type_name, leave_balance, leave_spent, leave_remaining FROM emp_leave_balance WHERE emp_id = ?";

  db.query(sql, [empId], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
// FETCH EMP_LEAVE_BALANCE BY TOTAL
app.get('/empleavetable', (req, res) => {
  const query = `
      SELECT 
          ei.emp_id,
          CONCAT(ei.f_name, ' ', ei.m_name, ' ', ei.l_name, ' ', ei.suffix) AS full_name,
          SUM(el.leave_balance) AS total_leave_balance,
          SUM(el.leave_spent) AS total_leave_spent,
          SUM(el.leave_remaining) AS total_leave_remaining
      FROM 
          emp_info ei
      LEFT JOIN 
          emp_leave_balance el ON ei.emp_id = el.emp_id
      GROUP BY 
          ei.emp_id, full_name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employee leave data:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results); // Send results as JSON response
  });
});

// Endpoint to get leave balance for a specific employee based on empId
app.get("/empleavebalance/:empId", (req, res) => {
  const empId = req.params.empId;
  const sql = `
      SELECT 
          leave_type_id, 
          leave_type_name, 
          leave_balance, 
          leave_spent, 
          leave_remaining 
      FROM 
          emp_leave_balance 
      WHERE 
          emp_id = ?
  `;

  db.query(sql, [empId], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});


app.get('/empleavetable/:empId', (req, res) => {
  const empId = req.params.empId;
  const query = `
      SELECT 
          ei.emp_id,
          CONCAT(ei.f_name, ' ', ei.m_name, ' ', ei.l_name, ' ', ei.suffix) AS full_name,
          SUM(el.leave_balance) AS total_leave_balance,
          SUM(el.leave_spent) AS total_leave_spent,
          SUM(el.leave_remaining) AS total_leave_remaining
      FROM 
          emp_info ei
      LEFT JOIN 
          emp_leave_balance el ON ei.emp_id = el.emp_id
      WHERE 
          ei.emp_id = ?
      GROUP BY 
          ei.emp_id, full_name;
  `;

  db.query(query, [empId], (err, results) => {
    if (err) {
      console.error('Error fetching employee leave data:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results); // Send results as JSON response
  });
});


// INSERT EMPLOYEE INFO
app.post('/AddEmpLeave', (req, res) => {
  const { emp_id, leave_type_id, leave_type_name, leave_balance, leave_spent, leave_remaining, date_start, date_end } = req.body;

  const query = 'INSERT INTO emp_leave_balance ( emp_id, leave_type_id, leave_type_name ,leave_balance, leave_spent, leave_remaining, date_start, date_end) VALUES (?,?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [emp_id, leave_type_id, leave_type_name, leave_balance, leave_spent, leave_remaining, date_start, date_end], (error, results) => {
    if (error) {
      console.error('Error inserting employee into database:', error); // Log error details
      return res.status(500).json({ error: 'Failed to insert employee' });
    }

    res.status(200).json({ insertId: results.insertId });
  });
});


// Insert employee leave data
app.post('/emp_leave_save', async (req, res) => {
  console.log('Received data for insert/update:', req.body); // Log the received data

  const { emp_id, leave_type_id, leave_type_name, date_start, date_end, leave_use } = req.body;

  // Validate the input
  if (!emp_id || !leave_type_id || !date_start || !date_end || !leave_use) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // SQL query to check if a leave record exists for this employee and leave type
  const checkSql = `
      SELECT * FROM emp_leave WHERE emp_id = ? AND leave_type_id = ? AND date_start = ? AND date_end = ?
  `;

  db.query(checkSql, [emp_id, leave_type_id, date_start, date_end], (error, results) => {
    if (error) {
      console.error('Error checking employee leave data:', error);
      return res.status(500).json({ error: 'Error checking leave data' });
    }

    if (results.length > 0) {
      // Record exists, send a warning response
      return res.status(409).json({
        error: 'Leave record already exists for this employee with the same leave type and dates.'
      });
    } else {
      // No record found, insert new leave data
      const insertSql = `
              INSERT INTO emp_leave (emp_id, leave_type_id, leave_type_name, date_start, date_end, leave_use)
              VALUES (?, ?, ?, ?, ?, ?)
          `;

      db.query(insertSql, [emp_id, leave_type_id, leave_type_name, date_start, date_end, leave_use], (error, insertResults) => {
        if (error) {
          console.error('Error inserting employee leave data:', error);
          return res.status(500).json({ error: 'Error saving leave data' });
        }

        // After inserting the leave data, update the leave balance
        updateLeaveBalance(emp_id, leave_type_id, res);
      });
    }
  });
});

// Function to update the leave balance
function updateLeaveBalance(emp_id, leave_type_id, res) {
  const updateBalanceSql = `
      UPDATE emp_leave_balance AS elb
      SET 
      elb.leave_spent = COALESCE((
          SELECT SUM(el.leave_use) 
          FROM emp_leave AS el 
          WHERE el.emp_id = elb.emp_id 
          AND el.leave_type_id = elb.leave_type_id
          GROUP BY el.emp_id, el.leave_type_id), 0),
      elb.leave_remaining = elb.leave_balance - COALESCE((
          SELECT SUM(el.leave_use) 
          FROM emp_leave AS el 
          WHERE el.emp_id = elb.emp_id 
          AND el.leave_type_id = elb.leave_type_id
          GROUP BY el.emp_id, el.leave_type_id), 0)
      WHERE elb.emp_id = ? AND elb.leave_type_id = ?
  `;

  db.query(updateBalanceSql, [emp_id, leave_type_id], (error, results) => {
    if (error) {
      console.error('Error updating leave balance:', error);
      return res.status(500).json({ error: 'Error updating leave balance' });
    }

    // If update successful, respond with success message
    res.status(200).json({ message: 'Leave data and balance updated successfully', results });
  });
}

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

//EDUC BG
app.get('/educationbg', (req, res) => {
  const emp_id = req.query.emp_id;

  if (!emp_id) {
    return res.json([]); // Return an empty array if emp_id is missing
  }

  const query = 'SELECT * FROM emp_education_background WHERE emp_id = ?';
  db.query(query, [emp_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});
// WORK EXP
app.get('/workexp', (req, res) => {
  const emp_id = req.query.emp_id;

  if (!emp_id) {
    return res.json([]); // Return an empty array if emp_id is missing
  }

  const query = 'SELECT * FROM emp_work_exp WHERE emp_id = ?';
  db.query(query, [emp_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


// FETCH DATE HIRED AND END
app.get('/event', (req, res) => {
  const query = "SELECT emp_datehired, emp_dateend, l_name, f_name, m_name, suffix FROM emp_info";

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching event data:', err);
      return res.status(500).json({ message: 'Error fetching event data' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'No events found' });
    }
    res.status(200).json(result); // Return the result as a JSON response
  });
});

// INSERT EMPLOYEE INFO
app.post('/AddEmp', (req, res) => {
  const { surname, firstname, middlename, suffix, civilStatusId, sexId, citizenshipId, religionId, dateOfBirth, provinceOfBirth, municipalityOfBirth,
    email, number, region, province, municipality, barangay, streetadd,
    status, employmentType, position, ratetype, rateValue, department, datestart, dateend, sss, philHealth, hdmfNumber, tin } = req.body;

  const query = 'INSERT INTO emp_info (l_name, f_name, m_name, suffix, civil_status, sex, emp_citi, emp_religion, date_of_birth, province_of_birth, city_of_birth, email, mobile_num, region, province, city, barangay, street_add, emp_status, emp_emptype, emp_pos,  emp_ratetype, emp_rate, emp_dept, emp_datehired, emp_dateend, emp_tin, emp_sss, emp_philhealth, emp_hdmf) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)';
  db.query(query, [surname, firstname, middlename, suffix, civilStatusId, sexId, citizenshipId, religionId, dateOfBirth, provinceOfBirth, municipalityOfBirth,
    email, number, region.region_name, province, municipality, barangay, streetadd,
    status, employmentType, position, ratetype, rateValue, department, datestart, dateend, sss, philHealth, hdmfNumber, tin], (error, results) => {
      if (error) {
        console.error('Error inserting employee into database:', error); // Log error details
        return res.status(500).json({ error: 'Failed to insert employee' });
      }

      res.status(200).json({ insertId: results.insertId });
    });
});

// Add employee
app.post('/AddEmployee1', (req, res) => {
  const { firstname, middlename, surname } = req.body;

  // Add a check to see if required data is missing
  if (!firstname || !middlename || !surname) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO emp_info_try (f_name, m_name, l_name) VALUES (?, ?, ?)';

  db.query(query, [firstname, middlename, surname], (error, results) => {
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
    const query = 'INSERT INTO emp_education_background (emp_id, school_uni_id, school_university, category, year) VALUES (?, ?, ?, ?, ?)';
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


// Add work experience
app.post('/AddWorkExp', (req, res) => {
  const workExpData = req.body; // Get the incoming data
  console.log('Received work experience data:', workExpData); // Log incoming data

  // Check if workExpData is an array
  if (!Array.isArray(workExpData)) {
    console.error('Expected workExpData to be an array, but got:', typeof workExpData);
    return res.status(400).json({ error: 'Invalid data format for work experience' });
  }

  const values = workExpData.map(item => [item.emp_id, item.category_id, item.company_name, item.position, item.year]);

  const query = 'INSERT INTO emp_work_exp (emp_id, category_id, company_name, position, year) VALUES ?';
  db.query(query, [values], (error, results) => {
    if (error) {
      console.error('Error inserting work experience:', error); // Log error details
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json({ message: 'Work experience added successfully' });
  });
});

// Assuming you have express and mysql set up already
app.get('/empleave/:emp_id', (req, res) => {
  const empId = req.params.emp_id;

  // SQL query to fetch employee leaves along with their full name
  const sqlQuery = `
    SELECT 
        CONCAT(ei.f_name, ' ', ei.l_name) AS full_name,
        el.leave_type_id,
        el.leave_type_name,
        el.date_start,
        el.date_end,
        el.leave_use
    FROM 
        emp_leave AS el
    JOIN 
        emp_info AS ei ON el.emp_id = ei.emp_id
    WHERE 
        ei.emp_id = ?
  `;

  db.query(sqlQuery, [empId], (error, results) => {
    if (error) {
      console.error('Error fetching employee leaves:', error);
      return res.status(500).json({ error: 'Error fetching employee leaves' });
    }

    res.status(200).json(results);
  });
});




// Endpoint to upload attendance data
app.post('/upload-attendance', (req, res) => {
  const attendanceData = req.body.data; // Expecting data in the format sent from the frontend

  // Prepare a promise array to insert all records
  const insertPromises = attendanceData.map((row) => {
    // Assuming your row has the following structure
    const sql = `INSERT INTO emp_attendance_2 (attendance, employee_id, employee_name, date, time_in, time_out, total_hours, total_ot_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    return new Promise((resolve, reject) => {
      db.query(sql, row, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });

  // Execute all insert promises
  Promise.all(insertPromises)
    .then((results) => {
      res.status(200).send({ message: "Data uploaded successfully!", results });
    })
    .catch((error) => {
      console.error("Error saving data:", error);
      res.status(500).send({ message: "Error uploading data" });
    });
});

// Fetch all attendance records
app.get("/attendance", (req, res) => {
  const sql = "SELECT * FROM emp_attendance_3"; // Adjust the query as necessary
  db.query(sql, (err, results) => {
    if (err) return res.json(err);
    return res.json(results);
  });
});

// ATTTENDANCE FETCH 
app.get("/attendance-module", (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const sql = `
    SELECT 
    ea.emp_attendance_id, 
    ea.emp_id, 
    CONCAT(ei.f_name, ' ', ei.l_name) AS full_name, 
    ea.time_in, 
    ea.time_out, 
    -- Use CASE to replace 00:00:00 with --:--:-- for break_in
    CASE 
        WHEN ea.break_in = '00:00:00' THEN '--:--:--'
        ELSE TIME_FORMAT(ea.break_in, '%H:%i')
    END AS break_in, 
    -- Use CASE to replace 00:00:00 with --:--:-- for break_out
    CASE 
        WHEN ea.break_out = '00:00:00' THEN '--:--:--'
        ELSE TIME_FORMAT(ea.break_out, '%H:%i')
    END AS break_out,
    -- Use CASE to replace 00:00:00 with --:--:-- for total_break_hr
    CASE 
        WHEN ea.total_break_hr = '00:00:00' THEN '--:--:--'
        ELSE TIME_FORMAT(ea.total_break_hr, '%H:%i:%s')
    END AS total_break_hr,
    -- Use CASE to replace 00:00:00 with --:--:-- for total_ot_hours
    CASE 
        WHEN ea.total_ot_hours = '00:00:00' THEN '--:--:--'
        ELSE TIME_FORMAT(ea.total_ot_hours, '%H:%i:%s')
    END AS total_ot_hours,
    ea.total_hours,
    ea.total_regular_hours,
    ea.total_regular_ot_hours,
    ea.total_night_diff_hours,
    ea.total_night_diff_ot_hours
FROM 
    emp_attendance_1 ea
JOIN 
    emp_info ei ON ea.emp_id = ei.emp_id
ORDER BY 
    ea.emp_attendance_id DESC
    LIMIT ? OFFSET ?`

  db.query(sql, [limit, offset], (err, results) => {
    if (err) {
      console.error(err); // Log any SQL errors
      return res.status(500).json(err); // Return error to client
    }
    console.log(results); // Log the results to see the data being returned
    return res.json(results); // Send the data back to the frontend
  });
});

// Save Edit from ViewEmpModal
app.post("/save", (req, res) => {
  const {
    civil_status,
    email,
    mobile_num,
    region,
    province,
    city,
    barangay,
    street_add,
    emp_id,
    emp_status,
    emp_emptype,
    emp_pos,
    emp_ratetype,
    emp_dept,
    emp_datehired,
    emp_dateend
  } = req.body;

  const sql = `
      UPDATE emp_info 
      SET 
          civil_status = ?, 
          email = ?, 
          mobile_num = ?, 
          region = ?, 
          province = ?, 
          city = ?, 
          barangay = ?, 
          street_add = ?, 
          emp_status = ?, 
          emp_emptype = ?, 
          emp_pos = ?, 
          emp_ratetype = ?, 
          emp_dept = ?, 
          emp_datehired = ?, 
          emp_dateend = ?
      WHERE emp_id = ?`; // Assuming emp_id is the unique identifier for the employee

  db.query(sql, [
    civil_status,
    email,
    mobile_num,
    region,
    province,
    city,
    barangay,
    street_add,
    emp_status,
    emp_emptype,
    emp_pos,
    emp_ratetype,
    emp_dept,
    emp_datehired,
    emp_dateend,
    emp_id // Include emp_id in the query parameters
  ], (err, results) => {
    if (err) return res.status(500).json(err); // Send a 500 error if there's an issue
    return res.json(results); // Send the results back to the client
  });
});


app.get("/manage-users", (req, res) => {
  const sql = "SELECT * FROM users"; // Adjust the query as necessary
  db.query(sql, (err, results) => {
    if (err) return res.json(err);
    return res.json(results);
  });
});

// Fetch data when RFID is scanned
app.get("/scan/:rfid", (req, res) => {
  const { rfid } = req.params;
  const sql = "SELECT emp_id, f_name, m_name, l_name FROM emp_info WHERE rfid = ?";
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

// Upload Picture
app.post('/upload', upload.single('image'), (req, res) => {
  const image = req.file.filename;
  const sql = "UPDATE emp_info SET image = ?";
  db.query(sql, [image], (err, result) => {
    if (err) return res.json({ Message: "Error" });
    return res.json({ Status: "Success" });
  })
})

// Time In/Time Out/Break In/Break Out Handler
app.post('/time-in', (req, res) => {
  const { emp_id, time, mode } = req.body; // Accept the mode (time-in, time-out, break-in, break-out)

  if (mode === 'time-in') {
    const queryCheck = `SELECT * FROM timein WHERE emp_id = ?`;

    db.query(queryCheck, [emp_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error checking time-in' });
      }

      if (results.length > 0) {
        const queryUpdate = `UPDATE timein SET time_in = ? WHERE emp_id = ?`;
        db.query(queryUpdate, [time, emp_id], (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error recording time-out' });
          }

          return res.status(200).json({ message: 'Time-out recorded successfully' });
        });
      }
    });
  } else if (mode === 'time-out') {
    const queryCheck = `SELECT * FROM timein WHERE emp_id = ?`;

    db.query(queryCheck, [emp_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error checking time-out' });
      }

      if (results.length > 0) {
        const queryUpdate = `UPDATE timein SET time_out = ? WHERE emp_id = ?`;
        db.query(queryUpdate, [time, emp_id], (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error recording time-out' });
          }

          return res.status(200).json({ message: 'Time-out recorded successfully' });
        });
      } else {
        return res.status(400).json({ message: 'You need to time in first before timing out.' });
      }
    });
  } else if (mode === 'break-in') {
    const queryCheck = `SELECT * FROM timein WHERE emp_id = ?`;

    db.query(queryCheck, [emp_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error checking break-in' });
      }

      if (results.length > 0) {
        const queryUpdate = `UPDATE timein SET break_in = ? WHERE emp_id = ?`;
        db.query(queryUpdate, [time, emp_id], (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error recording break-in' });
          }

          return res.status(200).json({ message: 'Break-in recorded successfully' });
        });
      } else {
        return res.status(400).json({ message: 'You need to time in first before starting a break.' });
      }
    });
  } else if (mode === 'break-out') {
    const queryCheck = `SELECT * FROM timein WHERE emp_id = ?`;

    db.query(queryCheck, [emp_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error checking break-out' });
      }

      if (results.length > 0) {
        const queryUpdate = `UPDATE timein SET break_out = ? WHERE emp_id = ?`;
        db.query(queryUpdate, [time, emp_id], (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error recording break-out' });
          }

          return res.status(200).json({ message: 'Break-out recorded successfully' });
        });
      } else {
        return res.status(400).json({ message: 'You need to break-in first before ending a break.' });
      }
    });
  } else {
    return res.status(400).json({ message: 'Invalid mode. Please select either time-in, time-out, break-in, or break-out.' });
  }
});

//Enroll Fingerprint
app.post('/finger-enrollment', async (req, res) => {
  const { emp_id, fingerprint_template } = req.body;

  if (!emp_id || !fingerprint_template) {
    return res.status(400).json({ error: 'Employee ID and template are required' });
  }

  try {
    // Save template to the database
    const sql = 'INSERT INTO fingerprinttemplates (emp_id, template) VALUES (?, ?)';
    const values = [emp_id, fingerprint_template];
    await db.query(sql, values);

    res.status(200).json({ message: 'Fingerprint template saved successfully' });
  } catch (err) {
    console.error('Error saving fingerprint template:', err);
    res.status(500).json({ error: 'Failed to save fingerprint template' });
  }
});


// Identify Fingerprint
app.post('/identify-fingerprint', async (req, res) => {
  const { fingerprint_template } = req.body;

  if (!fingerprint_template) {
    console.error('Invalid input: No fingerprint template provided');
    return res.status(400).json({ error: 'Fingerprint template is required' });
  }

  try {
    // Retrieve all stored templates from the database
    const sql = 'SELECT emp_id, template FROM fingerprinttemplates';
    const [rows] = await db.query(sql);

    console.log('Templates retrieved:', rows);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No fingerprint templates found in the database' });
    }

    // Perform fingerprint matching
    let identifiedEmployee = null;

    for (const row of rows) {
      const storedTemplate = row.template;
      console.log('Comparing with stored template:', storedTemplate);

      // Assuming `matchFingerprints` is your function for advanced fingerprint matching
      const isMatch = matchFingerprints(fingerprint_template, storedTemplate);

      if (isMatch) {
        identifiedEmployee = row.emp_id;
        break;
      }
    }

    if (identifiedEmployee) {
      // Fetch employee details
      const employeeSql = 'SELECT * FROM employees WHERE emp_id = ?'; // Adjust table name and columns as needed
      const [employeeRows] = await db.query(employeeSql, [identifiedEmployee]);

      if (employeeRows.length > 0) {
        const employeeData = employeeRows[0];
        return res.status(200).json({ success: true, employee: employeeData });
      } else {
        return res.status(404).json({ error: 'Employee data not found for the matched fingerprint' });
      }
    } else {
      return res.status(404).json({ success: false, error: 'No matching fingerprint found' });
    }
  } catch (err) {
    console.error('Error identifying fingerprint:', err);
    res.status(500).json({ error: 'Failed to identify fingerprint' });
  }
});

// Dummy function for fingerprint matching
function matchFingerprints(template1, template2) {
  // Replace this with actual fingerprint matching logic or library
  return template1 === template2; // Simplified comparison for testing
}


// PAYROLL EARNINGS
//  FETCH EARNINGS TOTAL
app.get('/employee-table-earnings', async (req, res) => {
  const query = `
   SELECT 
    ei.emp_id,
    CONCAT(ei.f_name, ' ', ei.l_name) AS full_name,
    edm.rice_allow,
    edm.clothing_allow,
    edm.laundry_allow,
    edm.medical_allow,
    (COALESCE(edm.rice_allow, 0) + COALESCE(edm.clothing_allow, 0) + COALESCE(edm.laundry_allow, 0) + COALESCE(edm.medical_allow, 0)) AS total_de_minimis,
    COALESCE(SUM(CASE WHEN eab.allowance_type = 'monthly' THEN eab.allowance_value ELSE 0 END), 0) AS total_additional_benefits,
    (COALESCE(edm.rice_allow, 0) + COALESCE(edm.clothing_allow, 0) + COALESCE(edm.laundry_allow, 0) + COALESCE(edm.medical_allow, 0) + 
     COALESCE(SUM(CASE WHEN eab.allowance_type = 'monthly' THEN eab.allowance_value ELSE 0 END), 0)) AS grand_total_benefits
FROM 
    emp_info ei
JOIN 
    emp_allowance_benefits_deminimis_monthly edm ON ei.emp_id = edm.emp_id
LEFT JOIN 
    emp_allowance_benefits eab ON ei.emp_id = eab.emp_id  -- Changed to LEFT JOIN
JOIN
    emp_allowance_benefits_deminimis_annually eda ON ei.emp_id = eda.emp_id
GROUP BY 
    ei.emp_id, ei.f_name, ei.l_name, 
    edm.rice_allow, edm.clothing_allow, edm.laundry_allow, edm.medical_allow;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employee earnings:', err);
      return res.status(500).json({ message: 'Error fetching data' });
    }
    res.json(results);  // Send the results back as JSON
  });
});
//  FETCH EARNINGS TOTAL PER ID VIEW
app.get('/employee-table-earnings-id/:emp_id', (req, res) => {
  const empId = req.params.emp_id;
  const query = `
SELECT 
    ei.emp_id,
    CONCAT(ei.f_name, ' ', ei.l_name) AS full_name,
    edm.rice_allow,
    edm.clothing_allow,
    edm.laundry_allow,
    edm.medical_allow,
    (COALESCE(edm.rice_allow, 0) + COALESCE(edm.clothing_allow, 0) + COALESCE(edm.laundry_allow, 0) + COALESCE(edm.medical_allow, 0)) AS total_de_minimis,
    COALESCE(SUM(CASE WHEN eab.allowance_type = 'monthly' THEN eab.allowance_value ELSE 0 END), 0) AS total_additional_benefits,
    (COALESCE(edm.rice_allow, 0) + COALESCE(edm.clothing_allow, 0) + COALESCE(edm.laundry_allow, 0) + COALESCE(edm.medical_allow, 0) + 
     COALESCE(SUM(CASE WHEN eab.allowance_type = 'monthly' THEN eab.allowance_value ELSE 0 END), 0)) AS grand_total_benefits
FROM 
    emp_info ei
JOIN 
    emp_allowance_benefits_deminimis_monthly edm ON ei.emp_id = edm.emp_id
LEFT JOIN 
    emp_allowance_benefits eab ON ei.emp_id = eab.emp_id  -- Changed to LEFT JOIN
JOIN
    emp_allowance_benefits_deminimis_annually eda ON ei.emp_id = eda.emp_id
WHERE
    ei.emp_id = ?  
GROUP BY 
    ei.emp_id, ei.f_name, ei.l_name, 
    edm.rice_allow, edm.clothing_allow, edm.laundry_allow, edm.medical_allow;
  `;
  db.query(query, [empId], (err, results) => {
    if (err) {
      console.error('Error fetching employee earnings:', err);
      return res.status(500).json({ message: 'Error fetching data' });
    }
    res.json(results);  // Send the results back as JSON
  });
});

//  FETCH EARNINGS ALL
app.get('/employee-earnings/:emp_id', (req, res) => {
  const empId = req.params.emp_id;  // Extract emp_id from the route parameter

  const query = `
    SELECT 
      ei.emp_id,
      CONCAT(ei.f_name, ' ', ei.l_name) AS full_name,
      COALESCE(edm.rice_allow, 0) AS rice_allow,
      COALESCE(edm.clothing_allow, 0) AS clothing_allow,
      COALESCE(edm.laundry_allow, 0) AS laundry_allow,
      COALESCE(edm.medical_allow, 0) AS medical_allow 
    FROM 
      emp_info ei
    LEFT JOIN 
      emp_allowance_benefits_deminimis_monthly edm ON ei.emp_id = edm.emp_id
    WHERE 
      ei.emp_id = ?;
  `;
  db.query(query, [empId], (err, results) => {
    if (err) {
      console.error('Error fetching employee earnings:', err);
      return res.status(500).json({ message: 'Error fetching data' });
    }
    res.json(results);  // Send the results as JSON
  });
});
//  FETCH EARNINGS ADDTIONAL BENIFITS OR ALLOWANCE PER ID
app.get('/emp-additional-benifits/:emp_id', (req, res) => {
  const empId = req.params.emp_id;

  const query = 'SELECT * FROM emp_allowance_benefits WHERE emp_id = ?';
  db.query(query, [empId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log('Results from DB:', results); // Log the DB results to check data
    res.json(results); // Send the data back to the client
  });
});

app.get('/emp-benifits-deminimis-annually/:emp_id', (req, res) => {
  const empId = req.params.emp_id;  // Use req.params to access the URL parameter

  const query = 'SELECT * FROM emp_allowance_benefits_deminimis_annually WHERE emp_id = ?';
  db.query(query, [empId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// SELECT EMP INDIVIDUAL
app.get('/emp_list', (req, res) => {
  const { startDate, endDate } = req.query;

  const sql = ` SELECT emp_id, f_name, l_name FROM emp_info`;

  db.query(sql, [startDate, endDate], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});
// SELECT EMP BY DATE
app.get('/emp_list_by_date', (req, res) => {
  const { startDate, endDate } = req.query;

  const sql = `
    SELECT emp_id, f_name, l_name 
    FROM emp_info 
    WHERE emp_datehired BETWEEN ? AND ?
  `;

  db.query(sql, [startDate, endDate], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

//  FETCH EARNINGS ADDTIONAL BENIFITS OR ALLOWANCE FILTER
app.get('/emp-additional-benefits-filter/:empId/:filter', (req, res) => {
  const empId = req.params.empId;
  const filter = req.params.filter;

  console.log('Received empId:', empId, 'and filter:', filter);

  let query = `
    SELECT * 
    FROM emp_allowance_benefits
    WHERE emp_id = ?
  `;

  let queryParams = [empId];

  if (filter && filter !== 'All') {
    query += ' AND type = ?';
    queryParams.push(filter);
  }

  console.log('Executing query:', query);  // Verify query string
  console.log('Query parameters:', queryParams);  // Verify params passed to query

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ message: 'Error fetching data' });
    }

    console.log('Fetched results:', results);
    res.json(results);
  });
});
//  FETCH EARNINGS MONTHLY DE MINIMIS
app.get('/ViewEarningsDeMinimisM', async (req, res) => {
  try {
    const query = `
      SELECT * FROM emp_allowance_benefits_deminimis_monthly; `;
    db.query(query, (error, results) => {
      if (error) {
        console.error("Error retrieving EarningsDeMinimisM records:", error);
        return res.status(500).json({ message: "Database error", error });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
//  FETCH EARNINGS ANNUALLY DE MINIMIS
app.get('/ViewEarningsDeMinimisA', async (req, res) => {
  try {
    const query = `
      SELECT * FROM emp_allowance_benefits_deminimis_annually; `;
    db.query(query, (error, results) => {
      if (error) {
        console.error("Error retrieving EarningsDeMinimisM records:", error);
        return res.status(500).json({ message: "Database error", error });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
// INSERT EMPLOYEE EARNINGS DE MINIMIS MONTHLY
app.post('/AddEarningsDeMinimisM', (req, res) => {
  const {
    emp_id,
    riceSubsidy,
    clothingAllowance,
    laundryAllowance,
    medicalAllowance,
    allowance_type,
    status,
    date
  } = req.body;
  const query = `INSERT INTO emp_allowance_benefits_deminimis_monthly (emp_id, rice_allow, clothing_allow, laundry_allow, medical_allow, allowance_type, status, date_activate)  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    query,
    [emp_id, riceSubsidy, clothingAllowance, laundryAllowance, medicalAllowance, allowance_type, status, date],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to save data");
      } else {
        res.status(200).send("Data saved successfully");
      }
    }
  );
});
// INSERT EMPLOYEE EARNINGS DE MINIMIS ANNUALLY
app.post("/AddEarningsDeMinimisA", (req, res) => {
  const { emp_id, medicalAssistant, achivementAwards } = req.body;
  const query = `INSERT INTO emp_allowance_benefits_deminimis_annually (emp_id, actualmedical_assist, achivement_allow) VALUES (?, ?, ?)`;
  db.query(
    query,
    [emp_id, medicalAssistant, achivementAwards],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to save data");
      } else {
        res.status(200).send("Data saved successfully");
      }
    }
  );
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
    const query = 'INSERT INTO emp_allowance_benefits (emp_id, allowance_name, allowance_value, allowance_type) VALUES (?, ?, ?, ?)';
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


//  FETCH LOANS TOTAL
app.get('/employee-table-loans', async (req, res) => {
  const query = `
    SELECT 
      ei.emp_id,
      CONCAT(ei.f_name, ' ', ei.l_name) AS full_name,
      COALESCE(SUM(egl.loan_amount), 0) AS government_loan_amount,
      COALESCE(SUM(ecl.loan_amount), 0) AS company_loan_amount,
      COALESCE(SUM(egl.loan_amount), 0) + COALESCE(SUM(ecl.loan_amount), 0) AS total_loan_amount,
      ROUND(COALESCE(SUM(egl.loan_monthly_payment), 0) + COALESCE(SUM(ecl.loan_monthly_payment), 0), 2) AS total_loan_monthly_payment,
      ROUND(COALESCE(SUM(egl.loan_interest_per_month), 0) + COALESCE(SUM(ecl.loan_interest_per_month), 0), 2) AS total_loan_interest_per_month
    FROM 
      emp_info ei
    LEFT JOIN 
      emp_goverment_loans egl ON ei.emp_id = egl.emp_id
    LEFT JOIN 
      emp_company_loans ecl ON ei.emp_id = ecl.emp_id
    GROUP BY 
      ei.emp_id, full_name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employee loan data:', err);
      return res.status(500).json({ message: 'Error fetching data' });
    }
    res.json(results);  // Send the results back as JSON
  });
});
//  FETCH LOANS TOTAL PER ID
app.get('/employee-table-loans-id/:emp_id', (req, res) => {
  const empId = req.params.emp_id;  // Extract emp_id from the route parameter

  const query = `
    SELECT 
      ei.emp_id,
      CONCAT(ei.f_name, ' ', ei.l_name) AS full_name,
      COALESCE(SUM(egl.loan_amount), 0) AS government_loan_amount,
      COALESCE(SUM(ecl.loan_amount), 0) AS company_loan_amount,
      COALESCE(SUM(egl.loan_amount), 0) + COALESCE(SUM(ecl.loan_amount), 0) AS total_loan_amount,
      ROUND(COALESCE(SUM(egl.loan_monthly_payment), 0) + COALESCE(SUM(ecl.loan_monthly_payment), 0), 2) AS total_loan_monthly_payment,
      ROUND(COALESCE(SUM(egl.loan_interest_per_month), 0) + COALESCE(SUM(ecl.loan_interest_per_month), 0), 2) AS total_loan_interest_per_month
    FROM 
      emp_info ei
    LEFT JOIN 
      emp_goverment_loans egl ON ei.emp_id = egl.emp_id
    LEFT JOIN 
      emp_company_loans ecl ON ei.emp_id = ecl.emp_id
    WHERE 
      ei.emp_id = ?
    GROUP BY 
      ei.emp_id, full_name;
  `;

  db.query(query, [empId], (err, results) => {
    if (err) {
      console.error('Error fetching employee loan data:', err);
      return res.status(500).json({ message: 'Error fetching data' });
    }
    res.json(results);  // Send the results as JSON
  });
});
//  FETCH LOANS DETAILED PER ID
app.get('/employee-loans/:emp_id', (req, res) => {
  const empId = req.params.emp_id;  // Extract emp_id from the route parameter

  const query = `
    SELECT 
      ei.emp_id,
      CONCAT(ei.f_name, ' ', ei.l_name) AS full_name,
      
      -- Government Loans
      egl.government_name AS government_loan_name,
      egl.loan_type_name AS government_loan_type,
      egl.status AS government_loan_status,
      COALESCE(egl.loan_amount, 0) AS government_loan_amount,
      COALESCE(egl.loan_interest_per_month, 0) AS government_loan_interest_per_month,
      COALESCE(egl.loan_monthly_payment, 0) AS government_loan_monthly_payment,
      egl.payment_terms AS government_payment_terms,
      egl.payment_terms_remains AS government_payment_terms_remains,

      -- Company Loans
      ecl.loan_name AS company_loan_name,
      ecl.loan_type AS company_loan_type,
      ecl.status AS company_loan_status,
      COALESCE(ecl.loan_amount, 0) AS company_loan_amount,
      COALESCE(ecl.loan_interest_per_month, 0) AS company_loan_interest_per_month,
      COALESCE(ecl.loan_monthly_payment, 0) AS company_loan_monthly_payment,
      ecl.payment_terms AS company_payment_terms,
      ecl.payment_terms_remains AS company_payment_terms_remains

    FROM 
      emp_info ei
    LEFT JOIN 
      emp_goverment_loans egl ON ei.emp_id = egl.emp_id
    LEFT JOIN 
      emp_company_loans ecl ON ei.emp_id = ecl.emp_id
    WHERE 
      ei.emp_id = ?
    GROUP BY 
      ei.emp_id, full_name, government_loan_name, government_loan_type, government_loan_status, government_payment_terms, government_payment_terms_remains,
      company_loan_name, company_loan_type, company_loan_status, company_payment_terms, company_payment_terms_remains;
  `;

  db.query(query, [empId], (err, results) => {
    if (err) {
      console.error('Error fetching employee loan data:', err);
      return res.status(500).json({ message: 'Error fetching data' });
    }
    res.json(results);  // Send the results as JSON
  });
});

// FETCH GOVERMENT NAME
app.get("/gov-name", (req, res) => {
  const sql = "SELECT * FROM emp_goverment";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
// FETCH LOAN TYPE
app.get("/loan-type", (req, res) => {
  const sql = "SELECT * FROM loan_type";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
// FETCH COMPANY LOAN NAME
app.get("/com-name", (req, res) => {
  const sql = "SELECT * FROM company_loan_name";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
// FETCH COMPANY LOAN TYPE
app.get("/company-loan-type", (req, res) => {
  const sql = "SELECT * FROM company_loan_type";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
// FETCH STATUS Active / CLOSE
app.get("/status-loans", (req, res) => {
  const sql = "SELECT * FROM emp_status_loans";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/AddGovernmentLoans", async (req, res) => {
  try {
    const loans = req.body; // Array of loan objects from the frontend

    if (!Array.isArray(loans) || loans.length === 0) {
      return res.status(400).send({ message: "Invalid loan data" });
    }

    // Insert loan data for each employee
    for (const loan of loans) {
      await db.query(
        "INSERT INTO emp_goverment_loans (emp_id, government_id, government_name, loan_type_id ,loan_type_name, loan_amount, loan_interest_per_month, loan_monthly_payment, status, payment_terms, payment_terms_remains) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          loan.emp_id,                   // Employee ID
          loan.government_id,            // Government ID (new)
          loan.government_name,          // Government name
          loan.loan_type_id,              // Loan Type ID (new)
          loan.loan_type_name,           // Loan type name
          loan.loan_amount,              // Loan amount
          loan.loan_interest_per_month,  // Monthly interest
          loan.loan_monthly_payment,     // Monthly payment
          loan.status,                   // Loan status
          loan.payment_terms,            // Payment terms
          loan.payment_terms_remains,
        ]
      );
    }

    res.status(200).send({ message: "Government loans added successfully" });
  } catch (error) {
    console.error("Error saving loans:", error);
    res.status(500).send({ message: "Failed to save government loans" });
  }
});
app.post('/AddCompanyLoans', (req, res) => {
  // Data received from the frontend
  const companyLoanData = req.body;

  // Validate the received data
  if (!companyLoanData || !Array.isArray(companyLoanData) || companyLoanData.length === 0) {
    return res.status(400).json({ error: 'Invalid data or empty array' });
  }

  // Insert each loan data item into the database
  companyLoanData.forEach((loan) => {
    const {
      emp_id,
      company_loan_name,
      company_loan_type,
      status,
      payment_terms,
      payment_terms_remains,
      loan_amount,
      interest_per_month,
      loan_monthly_payment,
    } = loan;

    // SQL query to insert the loan data into your database table
    const query = `INSERT INTO emp_company_loans (emp_id, loan_name, loan_type, status, 
                  payment_terms, payment_terms_remains, loan_amount, loan_interest_per_month, loan_monthly_payment) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [
      emp_id,
      company_loan_name,
      company_loan_type,
      status,
      payment_terms,
      payment_terms_remains,
      loan_amount,
      interest_per_month,
      loan_monthly_payment,
    ], (err, result) => {
      if (err) {
        console.error('Error inserting loan data:', err);
        return res.status(500).json({ error: 'Failed to insert loan data' });
      }
      console.log('Loan inserted successfully.');
    });
  });

  // Return success response
  res.status(200).json({ message: 'Loan data added successfully' });
});

//  FETCH Goverment Loans
app.get('/ViewGovernmentLoans', async (req, res) => {
  try {
    const query = `
      SELECT * FROM emp_goverment_loans; `;
    db.query(query, (error, results) => {
      if (error) {
        console.error("Error retrieving Government Loan records:", error);
        return res.status(500).json({ message: "Database error", error });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
//  FETCH company loans
app.get('/ViewCompanyLoans', async (req, res) => {
  try {
    const query = `
      SELECT * FROM emp_company_loans; `;
    db.query(query, (error, results) => {
      if (error) {
        console.error("Error retrieving Comapany Loan records:", error);
        return res.status(500).json({ message: "Database error", error });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// FETCH PAYROLL
app.get("/payroll-summary", (req, res) => {
  const sql = "SELECT * FROM emp_payroll";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.post('/payroll-table', (req, res) => {
  const { payrollCycle } = req.body;

  const query = `
    SELECT
      pp.emp_id,
      CONCAT(ei.f_name, ' ', ei.l_name) AS full_name,
      pp.payrollCycle,
      ppp.total_taxable_income,
      ROUND(ppp.total_taxable_income - ppp.total_net_pay, 2) AS total_deduction,
      ppp.total_net_pay
    FROM
      emp_payroll_part_1 pp
    JOIN
      emp_payroll_part_2 ppp ON pp.emp_id = ppp.emp_id AND pp.payrollCycle = ppp.payrollCycle
    JOIN
      emp_info ei ON pp.emp_id = ei.emp_id
    WHERE
      pp.payrollCycle = ?
    ORDER BY
      pp.emp_id, pp.payrollCycle;
  `;

  db.query(query, [payrollCycle], (err, result) => {
    if (err) {
      console.error('Error fetching payroll data:', err);
      return res.status(500).json({ message: 'Error fetching payroll data' });
    }
    res.status(200).json(result);
  });
});

app.get('/ViewPayroll_Part1/:id', async (req, res) => {
  const { id } = req.params; // Extract the selectedId from route parameters
  console.log("Received ID:", id); // Log to check what ID is being received
  try {
    const query = `SELECT * FROM emp_payroll_part_1 WHERE emp_id = ?;`;
    db.query(query, [id], (error, results) => {
      if (error) {
        console.error("Error retrieving Payroll Part 1:", error);
        return res.status(500).json({ message: "Database error", error });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "No records found for the given employee ID." });
      }
      res.status(200).json(results[0]); // Return the single record as a JSON object
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.get('/ViewPayroll_Part2/:id', async (req, res) => {
  const { id } = req.params; // Extract the selectedId from route parameters
  console.log("Received ID:", id); // Log to check what ID is being received
  try {
    const query = `SELECT * FROM emp_payroll_part_2 WHERE emp_id = ?;`;
    db.query(query, [id], (error, results) => {
      if (error) {
        console.error("Error retrieving Payroll Part 2:", error);
        return res.status(500).json({ message: "Database error", error });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "No records found for the given employee ID." });
      }
      res.status(200).json(results[0]); // Return the single record as a JSON object
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.get('/emp-info/:id', async (req, res) => {
  const { id } = req.params; // Extract the selectedId from route parameters
  console.log("Received ID:", id); // Log to check what ID is being received
  try {
    const query = `SELECT * FROM emp_info WHERE emp_id = ?;`;
    db.query(query, [id], (error, results) => {
      if (error) {
        console.error("Error retrieving Employee info:", error);
        return res.status(500).json({ message: "Database error", error });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "No records found for the given employee ID." });
      }
      res.status(200).json(results[0]); // Return the single record as a JSON object
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Server error", error });
  }
});



// Check if payroll exists for the given dates
app.post('/ViewPayrollPart1', async (req, res) => {
  const { startDate, endDate } = req.body;

  try {
    const query = `
      SELECT COUNT(*) AS count 
      FROM emp_payroll_part_1 
      WHERE startDate = ? OR endDate = ?;
    `;

    db.query(query, [startDate, endDate], (error, results) => {
      if (error) {
        console.error("Error checking Payroll Part 1 records:", error);
        return res.status(500).json({ message: "Database error", error });
      }

      // If count > 0, payroll exists
      if (results[0].count > 0) {
        res.status(200).json({ exists: true, message: "Payroll exists for the given dates." });
      } else {
        res.status(200).json({ exists: false, message: "No payroll found for the given dates." });
      }
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
// INSERT PAYROLL
app.post('/payroll', (req, res) => {
  const { startDate, endDate, payrollType, payrollCycle } = req.body;

  const query = `INSERT INTO emp_payroll (startDate, endDate, payrollType, payrollCycle) 
                 VALUES (?, ?, ?, ? )`;

  const values = [startDate, endDate, payrollType, payrollCycle];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ message: 'Failed to save payroll data' });
      return;
    }
    res.status(200).json({ message: 'Payroll data saved successfully', id: result.insertId });
  });
});

// COMPILE ATTENDANCE

app.post('/payroll-part-1-sm', async (req, res) => {
  const { startDate, endDate, payrollType, payrollCycle } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  // SQL query for inserting payroll summary
  const query = `
      INSERT INTO emp_payroll_part_1 (
        emp_id, full_name, payrollType, payrollCycle, startDate, endDate, emp_rate, hourly_rate, emp_ratetype, emp_pos, total_hours_, total_hours_work, 
		  
		  total_reg_hours_rt1_r, total_regular_hours_value_rt1, total_reg_hours_rt2_rd, total_regular_hours_value_rt2,
        total_reg_hours_rt3_sh, total_regular_hours_value_rt3, total_reg_hours_rt4_shrd, total_regular_hours_value_rt4, 
		  total_reg_hours_rt5_dsh,total_regular_hours_value_rt5,  total_reg_hours_rt6_dshrd, total_regular_hours_value_rt6 ,
        total_reg_hours_rt7_rh, total_regular_hours_value_rt7, total_reg_hours_rt8_rhrd, total_regular_hours_value_rt8, 
		  total_reg_hours_rt9_drh, total_regular_hours_value_rt9,  total_reg_hours_rt10_drhrd, total_regular_hours_value_rt10,
		  
        overtime_regular_hours_rt1_r,total_overtime_hours_value_rt1, overtime_regular_hours_rt2_rd, total_overtime_hours_value_rt2, 
		  overtime_regular_hours_rt3_sh, total_overtime_hours_value_rt3, overtime_regular_hours_rt4_shrd , total_overtime_hours_value_rt4, 
		  overtime_regular_hours_rt5_dsh, total_overtime_hours_value_rt5, overtime_regular_hours_rt6_dshrd, total_overtime_hours_value_rt6,
        overtime_regular_hours_rt7_rh, total_overtime_hours_value_rt7,  overtime_regular_hours_rt8_rhrd ,total_overtime_hours_value_rt8, 
		  overtime_regular_hours_rt9_drh, total_overtime_hours_value_rt9, overtime_regular_hours_rt10_drhrd, total_overtime_hours_value_rt10,
		  
        total_nightdiff_hours_rt1_r, total_nightdiff_hours_value_rt1, total_nightdiff_hours_rt2_rd, total_nightdiff_hours_value_rt2, 
		  total_nightdiff_hours_rt3_sh, total_nightdiff_hours_value_rt3, total_nightdiff_hours_rt4_shrd, total_nightdiff_hours_value_rt4, 
		  total_nightdiff_hours_rt5_dsh, total_nightdiff_hours_value_rt5,  total_nightdiff_hours_rt6_dshrd, total_nightdiff_hours_value_rt6,
        total_nightdiff_hours_rt7_rh, total_nightdiff_hours_value_rt7,  total_nightdiff_hours_rt8_rhrd, total_nightdiff_hours_value_rt8,  
		  total_nightdiff_hours_rt9_drh, total_nightdiff_hours_value_rt9,  total_nightdiff_hours_rt10_drhrd, total_nightdiff_hours_value_rt10,
		  
        overtime_nightdiff_hours_rt1_r, total_overtime_nightdiff_hours_value_rt1, overtime_nightdiff_hours_rt2_rd, total_overtime_nightdiff_hours_value_rt2, 
		  overtime_nightdiff_hours_rt3_sh, total_overtime_nightdiff_hours_value_rt3, overtime_nightdiff_hours_rt4_shrd, total_overtime_nightdiff_hours_value_rt4, 
		  overtime_nightdiff_hours_rt5_dsh, total_overtime_nightdiff_hours_value_rt5, overtime_nightdiff_hours_rt6_dshrd, total_overtime_nightdiff_hours_value_rt6,
        overtime_nightdiff_hours_rt7_rh, total_overtime_nightdiff_hours_value_rt7,  overtime_nightdiff_hours_rt8_rhrd,total_overtime_nightdiff_hours_value_rt8, 
		  overtime_nightdiff_hours_rt9_drh,  total_overtime_nightdiff_hours_value_rt9, overtime_nightdiff_hours_rt10_drhrd,total_overtime_nightdiff_hours_value_rt10,
		  
        total_overtime_hours_rt1_r,  total_overtime_hours_rt2_rd,  
		  total_overtime_hours_rt3_sh,  total_overtime_hours_rt4_shrd, 
		  total_overtime_hours_rt5_dsh, total_overtime_hours_rt6_dshrd, 
		  total_overtime_hours_rt7_rh,  total_overtime_hours_rt8_rhrd, 
		  total_overtime_hours_rt9_drh,  total_overtime_hours_rt10_drhrd,
		  
		  total_regular_hours_value, total_overtime_hours_value, total_nightdiff_hours_value, total_overtime_nightdiff_hours_value
        
      )
      WITH EmployeeTotals AS (
    SELECT 
        emp_info.emp_id,
        CONCAT(emp_info.f_name, ' ', emp_info.l_name) AS full_name, 
        emp_info.emp_pos,
        emp_info.emp_rate,
        emp_info.emp_ratetype,
        emp_attendance_1.rate_table_id,
        emp_attendance_1.total_hours,
        emp_attendance_1.total_hours_worked,
        emp_attendance_1.total_regular_hours,
        emp_attendance_1.total_regular_ot_hours,
        emp_attendance_1.total_night_diff_hours,
        emp_attendance_1.total_night_diff_ot_hours,
        emp_attendance_1.total_ot_hours, 
        
         ROUND(
        CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE emp_rate  -- Default case, in case other types exist
        END,
    2) AS hourly_rate,
        
        SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_hours))) AS total_hours_,
        SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_hours_worked))) AS total_hours_work,
        
       -- SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_regular_hours))) AS total_reg_hours,
       -- SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours))) AS overtime_regular_hours,
        -- SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_night_diff_hours))) AS total_nightdiff_hours,
       -- SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours))) AS overtime_nightdiff_hours,
      -- SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_ot_hours))) AS total_overtime_hours,
      
      
      -- REGULAR HOUR AND VALUE
    	  SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt1_r,
        ROUND(CASE WHEN emp_ratetype = 'Monthly' THEN emp_rate / 2  ELSE  SUM(LEAST(TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600, 8)) *  CASE  WHEN emp_ratetype = 'Daily' THEN emp_rate / 8 WHEN emp_ratetype = 'Hourly' THEN emp_rate ELSE emp_rate END *  (SELECT regular_shift FROM rate_table WHERE rate_table_id = 1) END, 2) AS total_regular_hours_value_rt1,
        
		  SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt2_rd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 2), 2) AS total_regular_hours_value_rt2,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt3_sh,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8) ) * 
        CASE WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8 * ((SELECT regular_shift FROM rate_table WHERE rate_table_id = 3) - 1) 
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8 * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 3) WHEN emp_ratetype = 'Hourly' THEN emp_rate *  (SELECT regular_shift FROM rate_table WHERE rate_table_id = 3)  ELSE 0 END, 2) AS total_regular_hours_value_rt3,  -- Added closing parenthesis here

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt4_shrd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 4), 2) AS total_regular_hours_value_rt4,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt5_dsh,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8) ) * CASE WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8 * ((SELECT regular_shift FROM rate_table WHERE rate_table_id = 5) - 1) 
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8 * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 5)  WHEN emp_ratetype = 'Hourly' THEN emp_rate *   (SELECT regular_shift FROM rate_table WHERE rate_table_id = 5) ELSE 0  END, 2) AS total_regular_hours_value_rt5,  -- For rate_table_id = 5

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt6_dshrd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 6), 2) AS total_regular_hours_value_rt6,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt7_rh,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8 )) * CASE WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8 * ((SELECT regular_shift FROM rate_table WHERE rate_table_id = 7) - 1) 
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8 *(SELECT regular_shift FROM rate_table WHERE rate_table_id = 7) WHEN emp_ratetype = 'Hourly' THEN emp_rate *(SELECT regular_shift FROM rate_table WHERE rate_table_id = 7) ELSE 0  END, 2) AS total_regular_hours_value_rt7,  -- For rate_table_id = 7

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt8_rhrd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 8), 2) AS total_regular_hours_value_rt8,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt9_drh,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8 )) * CASE WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8 *  ((SELECT regular_shift FROM rate_table WHERE rate_table_id = 9) - 1) 
        		WHEN emp_ratetype = 'Daily' THEN emp_rate / 8 * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 9) WHEN emp_ratetype = 'Hourly' THEN emp_rate *  (SELECT regular_shift FROM rate_table WHERE rate_table_id = 9)  ELSE 0  END, 2) AS total_regular_hours_value_rt9 ,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt10_drhrd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 10), 2) AS total_regular_hours_value_rt10,

		 -- REGUALR OT HOUR AND VALUE
    	  SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt1_r,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 1), 2) AS total_overtime_hours_value_rt1,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt2_rd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 2), 2) AS total_overtime_hours_value_rt2,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt3_sh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 3), 2) AS total_overtime_hours_value_rt3,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt4_shrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 4), 2) AS total_overtime_hours_value_rt4,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt5_dsh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 5), 2) AS total_overtime_hours_value_rt5,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt6_dshrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 6), 2) AS total_overtime_hours_value_rt6,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt7_rh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 7), 2) AS total_overtime_hours_value_rt7,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt8_rhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 8), 2) AS total_overtime_hours_value_rt8,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt9_drh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 9), 2) AS total_overtime_hours_value_rt9,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt10_drhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 10), 2) AS total_overtime_hours_value_rt10,


    -- NIGHT DIFF HOUR AND VALUE
    	  SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt1_r,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 1), 2) AS total_nightdiff_hours_value_rt1,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt2_rd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 2), 2) AS total_nightdiff_hours_value_rt2,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt3_sh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 3), 2) AS total_nightdiff_hours_value_rt3,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt4_shrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 4), 2) AS total_nightdiff_hours_value_rt4,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt5_dsh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 5), 2) AS total_nightdiff_hours_value_rt5,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt6_dshrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 6), 2) AS total_nightdiff_hours_value_rt6,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt7_rh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 7), 2) AS total_nightdiff_hours_value_rt7,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt8_rhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 8), 2) AS total_nightdiff_hours_value_rt8,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt9_drh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 9), 2) AS total_nightdiff_hours_value_rt9,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt10_drhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 10), 2) AS total_nightdiff_hours_value_rt10,

    
    
    -- NIGHT DIFF OVERTIME HOUR AND VALUE
        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt1_r,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 1), 2) AS total_overtime_nightdiff_hours_value_rt1,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt2_rd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 2), 2) AS total_overtime_nightdiff_hours_value_rt2,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt3_sh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 3), 2) AS total_overtime_nightdiff_hours_value_rt3,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt4_shrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 4), 2) AS total_overtime_nightdiff_hours_value_rt4,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt5_dsh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 5), 2) AS total_overtime_nightdiff_hours_value_rt5,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt6_dshrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 6), 2) AS total_overtime_nightdiff_hours_value_rt6,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt7_rh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 7), 2) AS total_overtime_nightdiff_hours_value_rt7,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt8_rhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 8), 2) AS total_overtime_nightdiff_hours_value_rt8,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt9_drh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 9), 2) AS total_overtime_nightdiff_hours_value_rt9,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt10_drhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 10), 2) AS total_overtime_nightdiff_hours_value_rt10,

    -- TOTAL OVER TIME HOUR
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt1_r,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt2_rd,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt3_sh,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt4_shrd,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt5_dsh,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt6_dshrd,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt7_rh,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt8_rhrd,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt9_drh,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt10_drhrd
 
FROM emp_attendance_1
JOIN emp_info ON emp_attendance_1.emp_id = emp_info.emp_id
JOIN rate_table rt ON emp_attendance_1.rate_table_id = rt.rate_table_id
WHERE emp_attendance_1.time_in BETWEEN ? AND ?
GROUP BY emp_info.emp_id, emp_info.emp_pos
)

SELECT 
    et.emp_id,
    et.full_name,
    ? AS payrollType, 
    ? AS payrollCycle,
    ? AS startDate,
    ? AS endDate,
    et.emp_rate,
    hourly_rate,
    et.emp_ratetype,
    et.emp_pos,
    et.total_hours_,
    et.total_hours_work,
 
    -- REGULAR
    COALESCE(et.total_reg_hours_rt1_r, '00:00:00') AS total_reg_hours_rt1_r,  COALESCE(et.total_regular_hours_value_rt1, 0) AS total_regular_hours_value_rt1,
    COALESCE(et.total_reg_hours_rt2_rd, '00:00:00') AS total_reg_hours_rt2_rd,   COALESCE(et.total_regular_hours_value_rt2, 0) AS total_regular_hours_value_rt2,
    COALESCE(et.total_reg_hours_rt3_sh, '00:00:00') AS total_reg_hours_rt3_sh,  COALESCE(et.total_regular_hours_value_rt3, 0) AS total_regular_hours_value_rt3,
    COALESCE(et.total_reg_hours_rt4_shrd, '00:00:00') AS total_reg_hours_rt4_shrd,  COALESCE(et.total_regular_hours_value_rt4, 0) AS total_regular_hours_value_rt4,
    COALESCE(et.total_reg_hours_rt5_dsh, '00:00:00') AS total_reg_hours_rt5_dsh,  COALESCE(et.total_regular_hours_value_rt5, 0) AS total_regular_hours_value_rt5,
    COALESCE(et.total_reg_hours_rt6_dshrd, '00:00:00') AS total_reg_hours_rt6_dshrd,  COALESCE(et.total_regular_hours_value_rt6, 0) AS total_regular_hours_value_rt6,
	 COALESCE(et.total_reg_hours_rt7_rh, '00:00:00') AS total_reg_hours_rt7_rh,  COALESCE(et.total_regular_hours_value_rt7, 0) AS total_regular_hours_value_rt7,
	 COALESCE(et.total_reg_hours_rt8_rhrd, '00:00:00') AS total_reg_hours_rt8_rhrd,  COALESCE(et.total_regular_hours_value_rt8, 0) AS total_regular_hours_value_rt8,
	 COALESCE(et.total_reg_hours_rt9_drh, '00:00:00') AS total_reg_hours_rt9_drh,   COALESCE(et.total_regular_hours_value_rt9, 0) AS total_regular_hours_value_rt9,
	 COALESCE(et.total_reg_hours_rt10_drhrd, '00:00:00') AS total_reg_hours_rt10_drhrd,  COALESCE(et.total_regular_hours_value_rt10, 0) AS total_regular_hours_value_rt10,
    
    -- REGULAR OT 
    COALESCE(et.overtime_regular_hours_rt1_r, '00:00:00') AS overtime_regular_hours_rt1_r, COALESCE(et.total_overtime_hours_value_rt1, 0) AS total_overtime_hours_value_rt1, 
	COALESCE(et.overtime_regular_hours_rt2_rd, '00:00:00') AS overtime_regular_hours_rt2_rd, COALESCE(et.total_overtime_hours_value_rt2, 0) AS total_overtime_hours_value_rt2,
	COALESCE(et.overtime_regular_hours_rt3_sh, '00:00:00') AS overtime_regular_hours_rt3_sh, 	COALESCE(et.total_overtime_hours_value_rt3, 0) AS total_overtime_hours_value_rt3,
	COALESCE(et.overtime_regular_hours_rt4_shrd, '00:00:00') AS overtime_regular_hours_rt4_shrd, 	COALESCE(et.total_overtime_hours_value_rt4, 0) AS total_overtime_hours_value_rt4,
	COALESCE(et.overtime_regular_hours_rt5_dsh, '00:00:00') AS overtime_regular_hours_rt5_dsh, 	COALESCE(et.total_overtime_hours_value_rt5, 0) AS total_overtime_hours_value_rt5,
	COALESCE(et.overtime_regular_hours_rt6_dshrd, '00:00:00') AS overtime_regular_hours_rt6_dshrd, 	COALESCE(et.total_overtime_hours_value_rt6, 0) AS total_overtime_hours_value_rt6,
	COALESCE(et.overtime_regular_hours_rt7_rh, '00:00:00') AS overtime_regular_hours_rt7_rh, 	COALESCE(et.total_overtime_hours_value_rt7, 0) AS total_overtime_hours_value_rt7,
	COALESCE(et.overtime_regular_hours_rt8_rhrd, '00:00:00') AS overtime_regular_hours_rt8_rhrd,  COALESCE(et.total_overtime_hours_value_rt8, 0) AS total_overtime_hours_value_rt8,
	COALESCE(et.overtime_regular_hours_rt9_drh, '00:00:00') AS overtime_regular_hours_rt9_drh,  COALESCE(et.total_overtime_hours_value_rt9, 0) AS total_overtime_hours_value_rt9,	
	COALESCE(et.overtime_regular_hours_rt10_drhrd, '00:00:00') AS overtime_regular_hours_rt10_drhrd, COALESCE(et.total_overtime_hours_value_rt10, 0) AS total_overtime_hours_value_rt10,
	
	-- NIGHT DIFF
		
	COALESCE(et.total_nightdiff_hours_rt1_r, '00:00:00') AS total_nightdiff_hours_rt1_r, COALESCE(et.total_nightdiff_hours_value_rt1, 0) AS total_nightdiff_hours_value_rt1,
	COALESCE(et.total_nightdiff_hours_rt2_rd, '00:00:00') AS total_nightdiff_hours_rt2_rd, COALESCE(et.total_nightdiff_hours_value_rt2, 0) AS total_nightdiff_hours_value_rt2,
	COALESCE(et.total_nightdiff_hours_rt3_sh, '00:00:00') AS total_nightdiff_hours_rt3_sh, COALESCE(et.total_nightdiff_hours_value_rt3, 0) AS total_nightdiff_hours_value_rt3,
	COALESCE(et.total_nightdiff_hours_rt4_shrd, '00:00:00') AS total_nightdiff_hours_rt4_shrd,	COALESCE(et.total_nightdiff_hours_value_rt4, 0) AS total_nightdiff_hours_value_rt4,
	COALESCE(et.total_nightdiff_hours_rt5_dsh, '00:00:00') AS total_nightdiff_hours_rt5_dsh, COALESCE(et.total_nightdiff_hours_value_rt5, 0) AS total_nightdiff_hours_value_rt5,
	COALESCE(et.total_nightdiff_hours_rt6_dshrd, '00:00:00') AS total_nightdiff_hours_rt6_dshrd, COALESCE(et.total_nightdiff_hours_value_rt6, 0) AS total_nightdiff_hours_value_rt6,
	COALESCE(et.total_nightdiff_hours_rt7_rh, '00:00:00') AS total_nightdiff_hours_rt7_rh,  COALESCE(et.total_nightdiff_hours_value_rt7, 0) AS total_nightdiff_hours_value_rt7,
	COALESCE(et.total_nightdiff_hours_rt8_rhrd, '00:00:00') AS total_nightdiff_hours_rt8_rhrd, COALESCE(et.total_nightdiff_hours_value_rt8, 0) AS total_nightdiff_hours_value_rt8,
	COALESCE(et.total_nightdiff_hours_rt9_drh, '00:00:00') AS total_nightdiff_hours_rt9_drh, COALESCE(et.total_nightdiff_hours_value_rt9, 0) AS total_nightdiff_hours_value_rt9,
	COALESCE(et.total_nightdiff_hours_rt10_drhrd, '00:00:00') AS total_nightdiff_hours_rt10_drhrd, COALESCE(et.total_nightdiff_hours_value_rt10, 0) AS total_nightdiff_hours_value_rt10,

	
	-- NIGHT DIFF OVERTIME
	    
	COALESCE(et.overtime_nightdiff_hours_rt1_r, '00:00:00') AS overtime_nightdiff_hours_rt1_r, COALESCE(et.total_overtime_nightdiff_hours_value_rt1, 0) AS total_overtime_nightdiff_hours_value_rt1,
	COALESCE(et.overtime_nightdiff_hours_rt2_rd, '00:00:00') AS overtime_nightdiff_hours_rt2_rd, COALESCE(et.total_overtime_nightdiff_hours_value_rt2, 0) AS total_overtime_nightdiff_hours_value_rt2,
	COALESCE(et.overtime_nightdiff_hours_rt3_sh, '00:00:00') AS overtime_nightdiff_hours_rt3_sh, COALESCE(et.total_overtime_nightdiff_hours_value_rt3, 0) AS total_overtime_nightdiff_hours_value_rt3, 
	COALESCE(et.overtime_nightdiff_hours_rt4_shrd, '00:00:00') AS overtime_nightdiff_hours_rt4_shrd, COALESCE(et.total_overtime_nightdiff_hours_value_rt4, 0) AS total_overtime_nightdiff_hours_value_rt4, 
	COALESCE(et.overtime_nightdiff_hours_rt5_dsh, '00:00:00') AS overtime_nightdiff_hours_rt5_dsh, COALESCE(et.total_overtime_nightdiff_hours_value_rt5, 0) AS total_overtime_nightdiff_hours_value_rt5, 
	COALESCE(et.overtime_nightdiff_hours_rt6_dshrd, '00:00:00') AS overtime_nightdiff_hours_rt6_dshrd, COALESCE(et.total_overtime_nightdiff_hours_value_rt6, 0) AS total_overtime_nightdiff_hours_value_rt6, 
	COALESCE(et.overtime_nightdiff_hours_rt7_rh, '00:00:00') AS overtime_nightdiff_hours_rt7_rh, COALESCE(et.total_overtime_nightdiff_hours_value_rt7, 0) AS total_overtime_nightdiff_hours_value_rt7, 
	COALESCE(et.overtime_nightdiff_hours_rt8_rhrd, '00:00:00') AS overtime_nightdiff_hours_rt8_rhrd, COALESCE(et.total_overtime_nightdiff_hours_value_rt8, 0) AS total_overtime_nightdiff_hours_value_rt8, 
	COALESCE(et.overtime_nightdiff_hours_rt9_drh, '00:00:00') AS overtime_nightdiff_hours_rt9_drh, COALESCE(et.total_overtime_nightdiff_hours_value_rt9, 0) AS total_overtime_nightdiff_hours_value_rt9, 
	COALESCE(et.overtime_nightdiff_hours_rt10_drhrd, '00:00:00') AS overtime_nightdiff_hours_rt10_drhrd, COALESCE(et.total_overtime_nightdiff_hours_value_rt10, 0) AS total_overtime_nightdiff_hours_value_rt10,

-- TOTAL OVER TIME

	COALESCE(et.total_overtime_hours_rt1_r, '00:00:00') AS total_overtime_hours_rt1_r,
	COALESCE(et.total_overtime_hours_rt2_rd, '00:00:00') AS total_overtime_hours_rt2_rd,
	COALESCE(et.total_overtime_hours_rt3_sh, '00:00:00') AS total_overtime_hours_rt3_sh,
	COALESCE(et.total_overtime_hours_rt4_shrd, '00:00:00') AS total_overtime_hours_rt4_shrd,
	COALESCE(et.total_overtime_hours_rt5_dsh, '00:00:00') AS total_overtime_hours_rt5_dsh,
	COALESCE(et.total_overtime_hours_rt6_dshrd, '00:00:00') AS total_overtime_hours_rt6_dshrd,
	COALESCE(et.total_overtime_hours_rt7_rh, '00:00:00') AS total_overtime_hours_rt7_rh,
	COALESCE(et.total_overtime_hours_rt8_rhrd, '00:00:00') AS total_overtime_hours_rt8_rhrd,
	COALESCE(et.total_overtime_hours_rt9_drh, '00:00:00') AS total_overtime_hours_rt9_drh,
	COALESCE(et.total_overtime_hours_rt10_drhrd, '00:00:00') AS total_overtime_hours_rt10_drhrd,
	

    COALESCE(et.total_regular_hours_value_rt1, 0) +  COALESCE(et.total_regular_hours_value_rt2, 0) + COALESCE(et.total_regular_hours_value_rt3, 0) +
    COALESCE(et.total_regular_hours_value_rt4, 0) +  COALESCE(et.total_regular_hours_value_rt5, 0) +  COALESCE(et.total_regular_hours_value_rt6, 0) +
    COALESCE(et.total_regular_hours_value_rt7, 0) +  COALESCE(et.total_regular_hours_value_rt8, 0) + COALESCE(et.total_regular_hours_value_rt9, 0) +  COALESCE(et.total_regular_hours_value_rt10, 0
	 ) AS total_regular_hours_value,
  
    COALESCE(et.total_overtime_hours_value_rt1, 0) + COALESCE(et.total_overtime_hours_value_rt2, 0) + COALESCE(et.total_overtime_hours_value_rt3, 0) +  COALESCE(et.total_overtime_hours_value_rt4, 0) +
    COALESCE(et.total_overtime_hours_value_rt5, 0) +  COALESCE(et.total_overtime_hours_value_rt6, 0) + COALESCE(et.total_overtime_hours_value_rt7, 0) +
    COALESCE(et.total_overtime_hours_value_rt8, 0) + COALESCE(et.total_overtime_hours_value_rt9, 0) +  COALESCE(et.total_overtime_hours_value_rt10, 0
	 ) AS total_overtime_hours_value,
  
    COALESCE(et.total_nightdiff_hours_value_rt1, 0) + COALESCE(et.total_nightdiff_hours_value_rt2, 0) +  COALESCE(et.total_nightdiff_hours_value_rt3, 0) +  COALESCE(et.total_nightdiff_hours_value_rt4, 0) +
    COALESCE(et.total_nightdiff_hours_value_rt5, 0) + COALESCE(et.total_nightdiff_hours_value_rt6, 0) + COALESCE(et.total_nightdiff_hours_value_rt7, 0) +
    COALESCE(et.total_nightdiff_hours_value_rt8, 0) + COALESCE(et.total_nightdiff_hours_value_rt9, 0) + COALESCE(et.total_nightdiff_hours_value_rt10, 0
	 ) AS total_nightdiff_hours_value,
    
    -- Sum of Overtime Night Differential Values
    COALESCE(et.total_overtime_nightdiff_hours_value_rt1, 0) + COALESCE(et.total_overtime_nightdiff_hours_value_rt2, 0) +  COALESCE(et.total_overtime_nightdiff_hours_value_rt3, 0) + COALESCE(et.total_overtime_nightdiff_hours_value_rt4, 0) +
    COALESCE(et.total_overtime_nightdiff_hours_value_rt5, 0) +  COALESCE(et.total_overtime_nightdiff_hours_value_rt6, 0) + COALESCE(et.total_overtime_nightdiff_hours_value_rt7, 0) +
    COALESCE(et.total_overtime_nightdiff_hours_value_rt8, 0) + COALESCE(et.total_overtime_nightdiff_hours_value_rt9, 0) +  COALESCE(et.total_overtime_nightdiff_hours_value_rt10, 0
	 ) AS total_overtime_nightdiff_hours_value
	 

FROM EmployeeTotals et;


    `;

  db.query(query, [startDate, endDate, payrollType, payrollCycle, startDate, endDate], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).send({ message: 'Employee summary data inserted successfully' });
  });
});

app.post('/payroll-part-1-m', async (req, res) => {
  const { startDate, endDate, payrollType, payrollCycle } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  // SQL query for inserting payroll summary
  const query = `
      INSERT INTO emp_payroll_part_1 (
        emp_id, full_name, payrollType, payrollCycle, startDate, endDate, emp_rate, hourly_rate, emp_ratetype, emp_pos, total_hours_, total_hours_work, 
		  
		  total_reg_hours_rt1_r, total_regular_hours_value_rt1, total_reg_hours_rt2_rd, total_regular_hours_value_rt2,
        total_reg_hours_rt3_sh, total_regular_hours_value_rt3, total_reg_hours_rt4_shrd, total_regular_hours_value_rt4, 
		  total_reg_hours_rt5_dsh,total_regular_hours_value_rt5,  total_reg_hours_rt6_dshrd, total_regular_hours_value_rt6 ,
        total_reg_hours_rt7_rh, total_regular_hours_value_rt7, total_reg_hours_rt8_rhrd, total_regular_hours_value_rt8, 
		  total_reg_hours_rt9_drh, total_regular_hours_value_rt9,  total_reg_hours_rt10_drhrd, total_regular_hours_value_rt10,
		  
        overtime_regular_hours_rt1_r,total_overtime_hours_value_rt1, overtime_regular_hours_rt2_rd, total_overtime_hours_value_rt2, 
		  overtime_regular_hours_rt3_sh, total_overtime_hours_value_rt3, overtime_regular_hours_rt4_shrd , total_overtime_hours_value_rt4, 
		  overtime_regular_hours_rt5_dsh, total_overtime_hours_value_rt5, overtime_regular_hours_rt6_dshrd, total_overtime_hours_value_rt6,
        overtime_regular_hours_rt7_rh, total_overtime_hours_value_rt7,  overtime_regular_hours_rt8_rhrd ,total_overtime_hours_value_rt8, 
		  overtime_regular_hours_rt9_drh, total_overtime_hours_value_rt9, overtime_regular_hours_rt10_drhrd, total_overtime_hours_value_rt10,
		  
        total_nightdiff_hours_rt1_r, total_nightdiff_hours_value_rt1, total_nightdiff_hours_rt2_rd, total_nightdiff_hours_value_rt2, 
		  total_nightdiff_hours_rt3_sh, total_nightdiff_hours_value_rt3, total_nightdiff_hours_rt4_shrd, total_nightdiff_hours_value_rt4, 
		  total_nightdiff_hours_rt5_dsh, total_nightdiff_hours_value_rt5,  total_nightdiff_hours_rt6_dshrd, total_nightdiff_hours_value_rt6,
        total_nightdiff_hours_rt7_rh, total_nightdiff_hours_value_rt7,  total_nightdiff_hours_rt8_rhrd, total_nightdiff_hours_value_rt8,  
		  total_nightdiff_hours_rt9_drh, total_nightdiff_hours_value_rt9,  total_nightdiff_hours_rt10_drhrd, total_nightdiff_hours_value_rt10,
		  
        overtime_nightdiff_hours_rt1_r, total_overtime_nightdiff_hours_value_rt1, overtime_nightdiff_hours_rt2_rd, total_overtime_nightdiff_hours_value_rt2, 
		  overtime_nightdiff_hours_rt3_sh, total_overtime_nightdiff_hours_value_rt3, overtime_nightdiff_hours_rt4_shrd, total_overtime_nightdiff_hours_value_rt4, 
		  overtime_nightdiff_hours_rt5_dsh, total_overtime_nightdiff_hours_value_rt5, overtime_nightdiff_hours_rt6_dshrd, total_overtime_nightdiff_hours_value_rt6,
        overtime_nightdiff_hours_rt7_rh, total_overtime_nightdiff_hours_value_rt7,  overtime_nightdiff_hours_rt8_rhrd,total_overtime_nightdiff_hours_value_rt8, 
		  overtime_nightdiff_hours_rt9_drh,  total_overtime_nightdiff_hours_value_rt9, overtime_nightdiff_hours_rt10_drhrd,total_overtime_nightdiff_hours_value_rt10,
		  
        total_overtime_hours_rt1_r,  total_overtime_hours_rt2_rd,  
		  total_overtime_hours_rt3_sh,  total_overtime_hours_rt4_shrd, 
		  total_overtime_hours_rt5_dsh, total_overtime_hours_rt6_dshrd, 
		  total_overtime_hours_rt7_rh,  total_overtime_hours_rt8_rhrd, 
		  total_overtime_hours_rt9_drh,  total_overtime_hours_rt10_drhrd,
		  
		  total_regular_hours_value, total_overtime_hours_value, total_nightdiff_hours_value, total_overtime_nightdiff_hours_value
        
      )
      WITH EmployeeTotals AS (
    SELECT 
        emp_info.emp_id,
        CONCAT(emp_info.f_name, ' ', emp_info.l_name) AS full_name, 
        emp_info.emp_pos,
        emp_info.emp_rate,
        emp_info.emp_ratetype,
        emp_attendance_1.rate_table_id,
        emp_attendance_1.total_hours,
        emp_attendance_1.total_hours_worked,
        emp_attendance_1.total_regular_hours,
        emp_attendance_1.total_regular_ot_hours,
        emp_attendance_1.total_night_diff_hours,
        emp_attendance_1.total_night_diff_ot_hours,
        emp_attendance_1.total_ot_hours, 
        
         ROUND(
        CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE emp_rate  -- Default case, in case other types exist
        END,
    2) AS hourly_rate,
        
        SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_hours))) AS total_hours_,
        SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_hours_worked))) AS total_hours_work,
        
       -- SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_regular_hours))) AS total_reg_hours,
       -- SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours))) AS overtime_regular_hours,
        -- SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_night_diff_hours))) AS total_nightdiff_hours,
       -- SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours))) AS overtime_nightdiff_hours,
      -- SEC_TO_TIME(SUM(TIME_TO_SEC(emp_attendance_1.total_ot_hours))) AS total_overtime_hours,
      
      
      -- REGULAR HOUR AND VALUE
    	  SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt1_r,
        ROUND(CASE WHEN emp_ratetype = 'Monthly' THEN emp_rate  ELSE  SUM(LEAST(TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600, 8)) *  CASE  WHEN emp_ratetype = 'Daily' THEN emp_rate / 8 WHEN emp_ratetype = 'Hourly' THEN emp_rate ELSE emp_rate END *  (SELECT regular_shift FROM rate_table WHERE rate_table_id = 1) END, 2) AS total_regular_hours_value_rt1,
        
		  SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt2_rd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 2), 2) AS total_regular_hours_value_rt2,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt3_sh,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8) ) * 
        CASE WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8 * ((SELECT regular_shift FROM rate_table WHERE rate_table_id = 3) - 1) 
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8 * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 3) WHEN emp_ratetype = 'Hourly' THEN emp_rate *  (SELECT regular_shift FROM rate_table WHERE rate_table_id = 3)  ELSE 0 END, 2) AS total_regular_hours_value_rt3,  -- Added closing parenthesis here

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt4_shrd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 4), 2) AS total_regular_hours_value_rt4,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt5_dsh,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8) ) * CASE WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8 * ((SELECT regular_shift FROM rate_table WHERE rate_table_id = 5) - 1) 
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8 * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 5)  WHEN emp_ratetype = 'Hourly' THEN emp_rate *   (SELECT regular_shift FROM rate_table WHERE rate_table_id = 5) ELSE 0  END, 2) AS total_regular_hours_value_rt5,  -- For rate_table_id = 5

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt6_dshrd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 6), 2) AS total_regular_hours_value_rt6,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt7_rh,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8 )) * CASE WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8 * ((SELECT regular_shift FROM rate_table WHERE rate_table_id = 7) - 1) 
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8 *(SELECT regular_shift FROM rate_table WHERE rate_table_id = 7) WHEN emp_ratetype = 'Hourly' THEN emp_rate *(SELECT regular_shift FROM rate_table WHERE rate_table_id = 7) ELSE 0  END, 2) AS total_regular_hours_value_rt7,  -- For rate_table_id = 7

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt8_rhrd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 8), 2) AS total_regular_hours_value_rt8,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt9_drh,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8 )) * CASE WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8 *  ((SELECT regular_shift FROM rate_table WHERE rate_table_id = 9) - 1) 
        		WHEN emp_ratetype = 'Daily' THEN emp_rate / 8 * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 9) WHEN emp_ratetype = 'Hourly' THEN emp_rate *  (SELECT regular_shift FROM rate_table WHERE rate_table_id = 9)  ELSE 0  END, 2) AS total_regular_hours_value_rt9 ,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt10_drhrd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 10), 2) AS total_regular_hours_value_rt10,

		 -- REGUALR OT HOUR AND VALUE
    	  SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt1_r,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 1), 2) AS total_overtime_hours_value_rt1,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt2_rd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 2), 2) AS total_overtime_hours_value_rt2,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt3_sh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 3), 2) AS total_overtime_hours_value_rt3,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt4_shrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 4), 2) AS total_overtime_hours_value_rt4,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt5_dsh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 5), 2) AS total_overtime_hours_value_rt5,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt6_dshrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 6), 2) AS total_overtime_hours_value_rt6,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt7_rh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 7), 2) AS total_overtime_hours_value_rt7,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt8_rhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 8), 2) AS total_overtime_hours_value_rt8,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt9_drh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 9), 2) AS total_overtime_hours_value_rt9,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt10_drhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 10), 2) AS total_overtime_hours_value_rt10,


    -- NIGHT DIFF HOUR AND VALUE
    	  SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt1_r,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 1), 2) AS total_nightdiff_hours_value_rt1,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt2_rd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 2), 2) AS total_nightdiff_hours_value_rt2,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt3_sh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 3), 2) AS total_nightdiff_hours_value_rt3,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt4_shrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 4), 2) AS total_nightdiff_hours_value_rt4,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt5_dsh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 5), 2) AS total_nightdiff_hours_value_rt5,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt6_dshrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 6), 2) AS total_nightdiff_hours_value_rt6,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt7_rh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 7), 2) AS total_nightdiff_hours_value_rt7,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt8_rhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 8), 2) AS total_nightdiff_hours_value_rt8,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt9_drh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 9), 2) AS total_nightdiff_hours_value_rt9,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt10_drhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 10), 2) AS total_nightdiff_hours_value_rt10,

    
    
    -- NIGHT DIFF OVERTIME HOUR AND VALUE
        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt1_r,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 1), 2) AS total_overtime_nightdiff_hours_value_rt1,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt2_rd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 2), 2) AS total_overtime_nightdiff_hours_value_rt2,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt3_sh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 3), 2) AS total_overtime_nightdiff_hours_value_rt3,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt4_shrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 4), 2) AS total_overtime_nightdiff_hours_value_rt4,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt5_dsh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 5), 2) AS total_overtime_nightdiff_hours_value_rt5,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt6_dshrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 6), 2) AS total_overtime_nightdiff_hours_value_rt6,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt7_rh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 7), 2) AS total_overtime_nightdiff_hours_value_rt7,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt8_rhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 8), 2) AS total_overtime_nightdiff_hours_value_rt8,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt9_drh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 9), 2) AS total_overtime_nightdiff_hours_value_rt9,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt10_drhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 10), 2) AS total_overtime_nightdiff_hours_value_rt10,

    -- TOTAL OVER TIME HOUR
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt1_r,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt2_rd,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt3_sh,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt4_shrd,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt5_dsh,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt6_dshrd,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt7_rh,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt8_rhrd,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt9_drh,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt10_drhrd
 
FROM emp_attendance_1
JOIN emp_info ON emp_attendance_1.emp_id = emp_info.emp_id
JOIN rate_table rt ON emp_attendance_1.rate_table_id = rt.rate_table_id
WHERE emp_attendance_1.time_in BETWEEN ? AND ?
GROUP BY emp_info.emp_id, emp_info.emp_pos
)

SELECT 
    et.emp_id,
    et.full_name,
    ? AS payrollType, 
    ? AS payrollCycle,
    ? AS startDate,
    ? AS endDate,
    et.emp_rate,
    hourly_rate,
    et.emp_ratetype,
    et.emp_pos,
    et.total_hours_,
    et.total_hours_work,
 
    -- REGULAR
    COALESCE(et.total_reg_hours_rt1_r, '00:00:00') AS total_reg_hours_rt1_r,  COALESCE(et.total_regular_hours_value_rt1, 0) AS total_regular_hours_value_rt1,
    COALESCE(et.total_reg_hours_rt2_rd, '00:00:00') AS total_reg_hours_rt2_rd,   COALESCE(et.total_regular_hours_value_rt2, 0) AS total_regular_hours_value_rt2,
    COALESCE(et.total_reg_hours_rt3_sh, '00:00:00') AS total_reg_hours_rt3_sh,  COALESCE(et.total_regular_hours_value_rt3, 0) AS total_regular_hours_value_rt3,
    COALESCE(et.total_reg_hours_rt4_shrd, '00:00:00') AS total_reg_hours_rt4_shrd,  COALESCE(et.total_regular_hours_value_rt4, 0) AS total_regular_hours_value_rt4,
    COALESCE(et.total_reg_hours_rt5_dsh, '00:00:00') AS total_reg_hours_rt5_dsh,  COALESCE(et.total_regular_hours_value_rt5, 0) AS total_regular_hours_value_rt5,
    COALESCE(et.total_reg_hours_rt6_dshrd, '00:00:00') AS total_reg_hours_rt6_dshrd,  COALESCE(et.total_regular_hours_value_rt6, 0) AS total_regular_hours_value_rt6,
	 COALESCE(et.total_reg_hours_rt7_rh, '00:00:00') AS total_reg_hours_rt7_rh,  COALESCE(et.total_regular_hours_value_rt7, 0) AS total_regular_hours_value_rt7,
	 COALESCE(et.total_reg_hours_rt8_rhrd, '00:00:00') AS total_reg_hours_rt8_rhrd,  COALESCE(et.total_regular_hours_value_rt8, 0) AS total_regular_hours_value_rt8,
	 COALESCE(et.total_reg_hours_rt9_drh, '00:00:00') AS total_reg_hours_rt9_drh,   COALESCE(et.total_regular_hours_value_rt9, 0) AS total_regular_hours_value_rt9,
	 COALESCE(et.total_reg_hours_rt10_drhrd, '00:00:00') AS total_reg_hours_rt10_drhrd,  COALESCE(et.total_regular_hours_value_rt10, 0) AS total_regular_hours_value_rt10,
    
    -- REGULAR OT 
    COALESCE(et.overtime_regular_hours_rt1_r, '00:00:00') AS overtime_regular_hours_rt1_r, COALESCE(et.total_overtime_hours_value_rt1, 0) AS total_overtime_hours_value_rt1, 
	COALESCE(et.overtime_regular_hours_rt2_rd, '00:00:00') AS overtime_regular_hours_rt2_rd, COALESCE(et.total_overtime_hours_value_rt2, 0) AS total_overtime_hours_value_rt2,
	COALESCE(et.overtime_regular_hours_rt3_sh, '00:00:00') AS overtime_regular_hours_rt3_sh, 	COALESCE(et.total_overtime_hours_value_rt3, 0) AS total_overtime_hours_value_rt3,
	COALESCE(et.overtime_regular_hours_rt4_shrd, '00:00:00') AS overtime_regular_hours_rt4_shrd, 	COALESCE(et.total_overtime_hours_value_rt4, 0) AS total_overtime_hours_value_rt4,
	COALESCE(et.overtime_regular_hours_rt5_dsh, '00:00:00') AS overtime_regular_hours_rt5_dsh, 	COALESCE(et.total_overtime_hours_value_rt5, 0) AS total_overtime_hours_value_rt5,
	COALESCE(et.overtime_regular_hours_rt6_dshrd, '00:00:00') AS overtime_regular_hours_rt6_dshrd, 	COALESCE(et.total_overtime_hours_value_rt6, 0) AS total_overtime_hours_value_rt6,
	COALESCE(et.overtime_regular_hours_rt7_rh, '00:00:00') AS overtime_regular_hours_rt7_rh, 	COALESCE(et.total_overtime_hours_value_rt7, 0) AS total_overtime_hours_value_rt7,
	COALESCE(et.overtime_regular_hours_rt8_rhrd, '00:00:00') AS overtime_regular_hours_rt8_rhrd,  COALESCE(et.total_overtime_hours_value_rt8, 0) AS total_overtime_hours_value_rt8,
	COALESCE(et.overtime_regular_hours_rt9_drh, '00:00:00') AS overtime_regular_hours_rt9_drh,  COALESCE(et.total_overtime_hours_value_rt9, 0) AS total_overtime_hours_value_rt9,	
	COALESCE(et.overtime_regular_hours_rt10_drhrd, '00:00:00') AS overtime_regular_hours_rt10_drhrd, COALESCE(et.total_overtime_hours_value_rt10, 0) AS total_overtime_hours_value_rt10,
	
	-- NIGHT DIFF
		
	COALESCE(et.total_nightdiff_hours_rt1_r, '00:00:00') AS total_nightdiff_hours_rt1_r, COALESCE(et.total_nightdiff_hours_value_rt1, 0) AS total_nightdiff_hours_value_rt1,
	COALESCE(et.total_nightdiff_hours_rt2_rd, '00:00:00') AS total_nightdiff_hours_rt2_rd, COALESCE(et.total_nightdiff_hours_value_rt2, 0) AS total_nightdiff_hours_value_rt2,
	COALESCE(et.total_nightdiff_hours_rt3_sh, '00:00:00') AS total_nightdiff_hours_rt3_sh, COALESCE(et.total_nightdiff_hours_value_rt3, 0) AS total_nightdiff_hours_value_rt3,
	COALESCE(et.total_nightdiff_hours_rt4_shrd, '00:00:00') AS total_nightdiff_hours_rt4_shrd,	COALESCE(et.total_nightdiff_hours_value_rt4, 0) AS total_nightdiff_hours_value_rt4,
	COALESCE(et.total_nightdiff_hours_rt5_dsh, '00:00:00') AS total_nightdiff_hours_rt5_dsh, COALESCE(et.total_nightdiff_hours_value_rt5, 0) AS total_nightdiff_hours_value_rt5,
	COALESCE(et.total_nightdiff_hours_rt6_dshrd, '00:00:00') AS total_nightdiff_hours_rt6_dshrd, COALESCE(et.total_nightdiff_hours_value_rt6, 0) AS total_nightdiff_hours_value_rt6,
	COALESCE(et.total_nightdiff_hours_rt7_rh, '00:00:00') AS total_nightdiff_hours_rt7_rh,  COALESCE(et.total_nightdiff_hours_value_rt7, 0) AS total_nightdiff_hours_value_rt7,
	COALESCE(et.total_nightdiff_hours_rt8_rhrd, '00:00:00') AS total_nightdiff_hours_rt8_rhrd, COALESCE(et.total_nightdiff_hours_value_rt8, 0) AS total_nightdiff_hours_value_rt8,
	COALESCE(et.total_nightdiff_hours_rt9_drh, '00:00:00') AS total_nightdiff_hours_rt9_drh, COALESCE(et.total_nightdiff_hours_value_rt9, 0) AS total_nightdiff_hours_value_rt9,
	COALESCE(et.total_nightdiff_hours_rt10_drhrd, '00:00:00') AS total_nightdiff_hours_rt10_drhrd, COALESCE(et.total_nightdiff_hours_value_rt10, 0) AS total_nightdiff_hours_value_rt10,

	
	-- NIGHT DIFF OVERTIME
	    
	COALESCE(et.overtime_nightdiff_hours_rt1_r, '00:00:00') AS overtime_nightdiff_hours_rt1_r, COALESCE(et.total_overtime_nightdiff_hours_value_rt1, 0) AS total_overtime_nightdiff_hours_value_rt1,
	COALESCE(et.overtime_nightdiff_hours_rt2_rd, '00:00:00') AS overtime_nightdiff_hours_rt2_rd, COALESCE(et.total_overtime_nightdiff_hours_value_rt2, 0) AS total_overtime_nightdiff_hours_value_rt2,
	COALESCE(et.overtime_nightdiff_hours_rt3_sh, '00:00:00') AS overtime_nightdiff_hours_rt3_sh, COALESCE(et.total_overtime_nightdiff_hours_value_rt3, 0) AS total_overtime_nightdiff_hours_value_rt3, 
	COALESCE(et.overtime_nightdiff_hours_rt4_shrd, '00:00:00') AS overtime_nightdiff_hours_rt4_shrd, COALESCE(et.total_overtime_nightdiff_hours_value_rt4, 0) AS total_overtime_nightdiff_hours_value_rt4, 
	COALESCE(et.overtime_nightdiff_hours_rt5_dsh, '00:00:00') AS overtime_nightdiff_hours_rt5_dsh, COALESCE(et.total_overtime_nightdiff_hours_value_rt5, 0) AS total_overtime_nightdiff_hours_value_rt5, 
	COALESCE(et.overtime_nightdiff_hours_rt6_dshrd, '00:00:00') AS overtime_nightdiff_hours_rt6_dshrd, COALESCE(et.total_overtime_nightdiff_hours_value_rt6, 0) AS total_overtime_nightdiff_hours_value_rt6, 
	COALESCE(et.overtime_nightdiff_hours_rt7_rh, '00:00:00') AS overtime_nightdiff_hours_rt7_rh, COALESCE(et.total_overtime_nightdiff_hours_value_rt7, 0) AS total_overtime_nightdiff_hours_value_rt7, 
	COALESCE(et.overtime_nightdiff_hours_rt8_rhrd, '00:00:00') AS overtime_nightdiff_hours_rt8_rhrd, COALESCE(et.total_overtime_nightdiff_hours_value_rt8, 0) AS total_overtime_nightdiff_hours_value_rt8, 
	COALESCE(et.overtime_nightdiff_hours_rt9_drh, '00:00:00') AS overtime_nightdiff_hours_rt9_drh, COALESCE(et.total_overtime_nightdiff_hours_value_rt9, 0) AS total_overtime_nightdiff_hours_value_rt9, 
	COALESCE(et.overtime_nightdiff_hours_rt10_drhrd, '00:00:00') AS overtime_nightdiff_hours_rt10_drhrd, COALESCE(et.total_overtime_nightdiff_hours_value_rt10, 0) AS total_overtime_nightdiff_hours_value_rt10,

-- TOTAL OVER TIME

	COALESCE(et.total_overtime_hours_rt1_r, '00:00:00') AS total_overtime_hours_rt1_r,
	COALESCE(et.total_overtime_hours_rt2_rd, '00:00:00') AS total_overtime_hours_rt2_rd,
	COALESCE(et.total_overtime_hours_rt3_sh, '00:00:00') AS total_overtime_hours_rt3_sh,
	COALESCE(et.total_overtime_hours_rt4_shrd, '00:00:00') AS total_overtime_hours_rt4_shrd,
	COALESCE(et.total_overtime_hours_rt5_dsh, '00:00:00') AS total_overtime_hours_rt5_dsh,
	COALESCE(et.total_overtime_hours_rt6_dshrd, '00:00:00') AS total_overtime_hours_rt6_dshrd,
	COALESCE(et.total_overtime_hours_rt7_rh, '00:00:00') AS total_overtime_hours_rt7_rh,
	COALESCE(et.total_overtime_hours_rt8_rhrd, '00:00:00') AS total_overtime_hours_rt8_rhrd,
	COALESCE(et.total_overtime_hours_rt9_drh, '00:00:00') AS total_overtime_hours_rt9_drh,
	COALESCE(et.total_overtime_hours_rt10_drhrd, '00:00:00') AS total_overtime_hours_rt10_drhrd,
	

    COALESCE(et.total_regular_hours_value_rt1, 0) +  COALESCE(et.total_regular_hours_value_rt2, 0) + COALESCE(et.total_regular_hours_value_rt3, 0) +
    COALESCE(et.total_regular_hours_value_rt4, 0) +  COALESCE(et.total_regular_hours_value_rt5, 0) +  COALESCE(et.total_regular_hours_value_rt6, 0) +
    COALESCE(et.total_regular_hours_value_rt7, 0) +  COALESCE(et.total_regular_hours_value_rt8, 0) + COALESCE(et.total_regular_hours_value_rt9, 0) +  COALESCE(et.total_regular_hours_value_rt10, 0
	 ) AS total_regular_hours_value,
  
    COALESCE(et.total_overtime_hours_value_rt1, 0) + COALESCE(et.total_overtime_hours_value_rt2, 0) + COALESCE(et.total_overtime_hours_value_rt3, 0) +  COALESCE(et.total_overtime_hours_value_rt4, 0) +
    COALESCE(et.total_overtime_hours_value_rt5, 0) +  COALESCE(et.total_overtime_hours_value_rt6, 0) + COALESCE(et.total_overtime_hours_value_rt7, 0) +
    COALESCE(et.total_overtime_hours_value_rt8, 0) + COALESCE(et.total_overtime_hours_value_rt9, 0) +  COALESCE(et.total_overtime_hours_value_rt10, 0
	 ) AS total_overtime_hours_value,
  
    COALESCE(et.total_nightdiff_hours_value_rt1, 0) + COALESCE(et.total_nightdiff_hours_value_rt2, 0) +  COALESCE(et.total_nightdiff_hours_value_rt3, 0) +  COALESCE(et.total_nightdiff_hours_value_rt4, 0) +
    COALESCE(et.total_nightdiff_hours_value_rt5, 0) + COALESCE(et.total_nightdiff_hours_value_rt6, 0) + COALESCE(et.total_nightdiff_hours_value_rt7, 0) +
    COALESCE(et.total_nightdiff_hours_value_rt8, 0) + COALESCE(et.total_nightdiff_hours_value_rt9, 0) + COALESCE(et.total_nightdiff_hours_value_rt10, 0
	 ) AS total_nightdiff_hours_value,
    
    -- Sum of Overtime Night Differential Values
    COALESCE(et.total_overtime_nightdiff_hours_value_rt1, 0) + COALESCE(et.total_overtime_nightdiff_hours_value_rt2, 0) +  COALESCE(et.total_overtime_nightdiff_hours_value_rt3, 0) + COALESCE(et.total_overtime_nightdiff_hours_value_rt4, 0) +
    COALESCE(et.total_overtime_nightdiff_hours_value_rt5, 0) +  COALESCE(et.total_overtime_nightdiff_hours_value_rt6, 0) + COALESCE(et.total_overtime_nightdiff_hours_value_rt7, 0) +
    COALESCE(et.total_overtime_nightdiff_hours_value_rt8, 0) + COALESCE(et.total_overtime_nightdiff_hours_value_rt9, 0) +  COALESCE(et.total_overtime_nightdiff_hours_value_rt10, 0
	 ) AS total_overtime_nightdiff_hours_value
	 

FROM EmployeeTotals et;


    `;

  db.query(query, [startDate, endDate, payrollType, payrollCycle, startDate, endDate], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).send({ message: 'Employee summary data inserted successfully' });
  });
});


app.post('/payroll-part-2-2nd', async (req, res) => {
  const { startDate, endDate, payrollType, payrollCycle, totalDays } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  // SQL query for inserting payroll summary
  const query = `
    INSERT INTO emp_payroll_part_2 (
    emp_id,
    full_name,
    payrollType,
    payrollCycle,
    totalDays, 
    startDate,
    endDate,
    emp_rate,
    emp_pos,
    rice_allow,
    clothing_allow,
    laundry_allow,
    medical_allow,
    achivement_allow,
    actualmedical_assist,
    rice_allow_excess,
    clothing_allow_excess,
    laundry_allow_excess,
	 medical_allow_excess,
	 achivement_allow_excess,
	 actualmedical_assist_excess,
	 regular_value,
    total_regular_hours,
    total_regular_value,
    total_overtime_hours,
    total_overtime_value,
    total_nightdiff_hours,
    total_nightdiff_value,
    total_overtime_nightdiff_hours,
    total_overtime_nightdiff_value,
    total_hours_work,
    non_taxable_deminimis,
    total_deminimis_allowance,
    total_allow_excess,
    total_allow_benefits_m,
    total_allow_benefits_a,
    total_worked_value,
    total_taxable_income,
    total_gross_income,
    Excess_tax,
    percentage_deduction_tax,
	 total_percentage_tax,
	 total_fixed_tax,
	 total_value_after_tax,
	 employee_sss_share,
	 employer_sss_share,
	 employment_compensation_share,
	 wisp_employee_share,
	 wisp_employer_share,
	 total_philhealth,
	 employee_philhealth,
	 employer_philhealth,
	 employee_hdmf,
	 employer_hdmf,
	 total_contribution_deduction,
	 total_gov_deduction,
	 total_loan_amount,
	 total_net_pay
)
WITH EmployeeTotals AS (
    SELECT 
        emp_info.emp_id,
        CONCAT(emp_info.f_name, ' ', emp_info.l_name) AS full_name, 
        emp_info.emp_pos,
        emp_info.emp_rate,
        emp_payroll_part_1.total_hours_,
        emp_payroll_part_1.total_hours_work,  
		  emp_payroll_part_1.total_regular_hours_value,
		  emp_payroll_part_1.total_overtime_hours_value,
		  emp_payroll_part_1.total_nightdiff_hours_value,
		  emp_payroll_part_1.total_overtime_nightdiff_hours_value ,
		  ROUND(COALESCE(emp_payroll_part_1.total_regular_hours_value_rt1, 0), 2) AS regular_value,

        
        TIME_FORMAT( SEC_TO_TIME( TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt1_r, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt2_rd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt3_sh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt4_shrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt5_dsh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt6_dshrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt7_rh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt8_rhrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt9_drh, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt10_drhrd, '00:00:00')) ), '%H:%i:%s' ) AS total_regular_hours,
		
		ROUND(  COALESCE(emp_payroll_part_1.total_regular_hours_value_rt1, 0) +  COALESCE(emp_payroll_part_1.total_regular_hours_value_rt2, 0) + COALESCE(emp_payroll_part_1.total_regular_hours_value_rt3, 0) +
  	    COALESCE(emp_payroll_part_1.total_regular_hours_value_rt4, 0) + COALESCE(emp_payroll_part_1.total_regular_hours_value_rt5, 0) +
   	 COALESCE(emp_payroll_part_1.total_regular_hours_value_rt6, 0) +  COALESCE(emp_payroll_part_1.total_regular_hours_value_rt7, 0) +
    	 COALESCE(emp_payroll_part_1.total_regular_hours_value_rt8, 0) + COALESCE(emp_payroll_part_1.total_regular_hours_value_rt9, 0) + COALESCE(emp_payroll_part_1.total_regular_hours_value_rt10, 0), 	2 ) AS total_regular_value,

		TIME_FORMAT( SEC_TO_TIME(
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt1_r, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt2_rd, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt3_sh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt4_shrd, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt5_dsh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt6_dshrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt7_rh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt8_rhrd, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt9_drh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt10_drhrd, '00:00:00')) ), '%H:%i:%s' ) AS total_overtime_hours,
		
		ROUND( COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt1, 0) +
   	 COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt2, 0) + COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt3, 0) + COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt4, 0) +
   	 COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt5, 0) + COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt6, 0) + COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt7, 0) +
   	 COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt8, 0) +  COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt9, 0) +  COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt10, 0), 	2 ) AS total_overtime_value,
		
		TIME_FORMAT(  SEC_TO_TIME( TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt1_r, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt2_rd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt3_sh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt4_shrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt5_dsh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt6_dshrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt7_rh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt8_rhrd, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt9_drh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt10, '00:00:00')) ),  '%H:%i:%s' ) AS total_nightdiff_hours,
		
		ROUND( 	COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt1, 0) + 	COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt2, 0) +
  		   COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt3, 0) +  COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt4, 0) +
		   COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt5, 0) + COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt6, 0) + COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt7, 0) +
  		   COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt8, 0) + COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt9, 0) + COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt10, 0), 2) AS total_nightdiff_value,
		
		TIME_FORMAT( SEC_TO_TIME( TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt1_r, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt2_rd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt3_sh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt4_shrd, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt5_dsh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt6_dshrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt7_rh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt8_rhrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt9_drh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt10_drhrd, '00:00:00')) ), '%H:%i:%s' ) AS total_overtime_nightdiff_hours,
		
		ROUND( COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt1, 0) + COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt2, 0) + COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt3, 0) +
   		COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt4, 0) + COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt5, 0) + COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt6, 0) +
    		COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt7, 0) + COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt8, 0) +
   		COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt9, 0) +	COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt10, 0), 	2 ) AS total_overtime_nightdiff_value,

-- Total Taxable Income (Including allowances and payroll values)
	ROUND(
    -- Payroll values for taxable income
    emp_payroll_part_1.total_regular_hours_value + 
    emp_payroll_part_1.total_overtime_hours_value + 
    emp_payroll_part_1.total_nightdiff_hours_value + 
    emp_payroll_part_1.total_overtime_nightdiff_hours_value,
    2 ) AS total_worked_value

    FROM emp_info
    LEFT JOIN emp_payroll_part_1 ON emp_info.emp_id = emp_payroll_part_1.emp_id
    LEFT JOIN emp_allowance_benefits_deminimis_monthly_1 
        ON emp_info.emp_id = emp_allowance_benefits_deminimis_monthly_1.emp_id
    LEFT JOIN emp_deminimis_1 
        ON emp_allowance_benefits_deminimis_monthly_1.allowance_type = emp_deminimis_1.allowance_type
	WHERE  emp_payroll_part_1.startDate BETWEEN ? AND ?
	 GROUP BY emp_info.emp_id

),
Deminimis AS (
    SELECT
        emp_info.emp_id,
		        
		CASE WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
		    THEN ROUND(COALESCE(eabdm.rice_allow, 0), 2)  ELSE 0.00 
		END AS rice_allow,
		
		CASE WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
		    THEN ROUND(COALESCE(eabdm.clothing_allow, 0), 2) ELSE 0.00 
		END AS clothing_allow,
		
		CASE WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
		    THEN ROUND(COALESCE(eabdm.laundry_allow, 0), 2)  ELSE 0.00 
		END AS laundry_allow,
		
		CASE WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
		    THEN ROUND(COALESCE(eabdm.medical_allow, 0), 2)  ELSE 0.00 
		END AS medical_allow,
		
		CASE WHEN eabda.allowance_type = 'Annually' AND eabda.status = 'Active' 
		    THEN ROUND(COALESCE(eabda.achivement_allow, 0), 2)  ELSE 0.00 
		END AS achivement_allow,
		
		CASE WHEN eabda.allowance_type = 'Annually' AND eabda.status = 'Active' 
		    THEN ROUND(COALESCE(eabda.actualmedical_assist, 0), 2) ELSE 0.00 
		END AS actualmedical_assist,
		  
		  -- Monthly Allowances with Excess Calculation
    GREATEST(CASE WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active'
            THEN ROUND(COALESCE(eabdm.rice_allow, 0), 2)
            ELSE 0 END - ROUND(COALESCE(ed.rice_allow, 0), 2),  0
    ) AS rice_allow_excess,

    GREATEST( CASE  WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active'
            THEN ROUND(COALESCE(eabdm.clothing_allow, 0), 2)
            ELSE 0 END -   ROUND(COALESCE(ed.clothing_allow, 0), 2), 0
    ) AS clothing_allow_excess,

    GREATEST(CASE WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active'
            THEN ROUND(COALESCE(eabdm.laundry_allow, 0), 2)
            ELSE 0  END -   ROUND(COALESCE(ed.laundry_allow, 0), 2),   0
    ) AS laundry_allow_excess,

    GREATEST( CASE  WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active'
            THEN ROUND(COALESCE(eabdm.medical_allow, 0), 2)
            ELSE 0  END - ROUND(COALESCE(ed.medical_allow, 0), 2),   0
    ) AS medical_allow_excess,

    -- Annually Allowances with Excess Calculation
    GREATEST( CASE WHEN eabda.allowance_type = 'Annually' AND eabda.status = 'Active'
            THEN ROUND(COALESCE(eabda.achivement_allow, 0), 2)
            ELSE 0  END -  ROUND(COALESCE(ed.achivement_allow, 0), 2), 0
    ) AS achivement_allow_excess,

    GREATEST(  CASE  WHEN eabda.allowance_type = 'Annually' AND eabda.status = 'Active'
            THEN ROUND(COALESCE(eabda.actualmedical_assist, 0), 2)
            ELSE 0 END -  ROUND(COALESCE(ed.actualmedical_assist, 0), 2), 0
    ) AS actualmedical_assist_excess,

		-- TOTAL EXCESS
	
	 GREATEST( CASE WHEN eabdm.status = 'Active' THEN ROUND(COALESCE(eabdm.rice_allow, 0), 2) ELSE 0
        END - ROUND(COALESCE(ed.rice_allow, 0), 2),  0 ) +
    GREATEST(  CASE WHEN eabdm.status = 'Active' THEN ROUND(COALESCE(eabdm.clothing_allow, 0), 2) ELSE 0
        END - ROUND(COALESCE(ed.clothing_allow, 0), 2),  0  ) +
    GREATEST( CASE WHEN eabdm.status = 'Active' THEN ROUND(COALESCE(eabdm.laundry_allow, 0), 2) ELSE 0
        END - ROUND(COALESCE(ed.laundry_allow, 0), 2),  0  ) +
    GREATEST( CASE  WHEN eabdm.status = 'Active' THEN ROUND(COALESCE(eabdm.medical_allow, 0), 2)  ELSE 0
        END - ROUND(COALESCE(ed.medical_allow, 0), 2),   0  ) +
    GREATEST(  CASE WHEN eabda.status = 'Active' THEN ROUND(COALESCE(eabda.achivement_allow, 0), 2)  ELSE 0
        END - ROUND(COALESCE(ed.achivement_allow, 0), 2),   0 ) +
    GREATEST(  CASE WHEN eabda.status = 'Active' THEN ROUND(COALESCE(eabda.actualmedical_assist, 0), 2) ELSE 0
        END - ROUND(COALESCE(ed.actualmedical_assist, 0), 2), 0
    ) AS total_allow_excess

    FROM emp_info
    LEFT JOIN emp_allowance_benefits_deminimis_monthly eabdm
        ON emp_info.emp_id = eabdm.emp_id
    LEFT JOIN emp_allowance_benefits_deminimis_annually eabda
        ON emp_info.emp_id = eabda.emp_id
    LEFT JOIN emp_deminimis ed
        ON eabdm.allowance_type = ed.allowance_type
    GROUP BY emp_info.emp_id
), 
Benefits AS (
    SELECT
        emp_info.emp_id,
        ROUND(SUM(CASE WHEN emp_allowance_benefits.status = 'Active'  AND emp_allowance_benefits.allowance_type = 'Monthly' 
        THEN COALESCE(emp_allowance_benefits.allowance_value, 0) ELSE 0  END  ),  2
        ) AS total_allowance_benefit_m,
        
        ROUND(SUM(CASE WHEN emp_allowance_benefits.status = 'Active'  AND emp_allowance_benefits.allowance_type = 'Annually' 
        THEN COALESCE(emp_allowance_benefits.allowance_value, 0) ELSE 0  END  ),  2
        ) AS total_allowance_benefit_a,
        
        
        de.rice_allow + de.clothing_allow + de.laundry_allow + de.medical_allow +  de.achivement_allow + de.actualmedical_assist 
		  AS total_deminimis_allowance
        
        
    FROM emp_info
    LEFT JOIN emp_allowance_benefits 
        ON emp_info.emp_id = emp_allowance_benefits.emp_id
    LEFT JOIN Deminimis de
    ON emp_info.emp_id = de.emp_id
	 LEFT JOIN EmployeeTotals et
    ON emp_info.emp_id = et.emp_id   
    GROUP BY emp_info.emp_id
),

TotalComputation AS (
    SELECT
        emp_info.emp_id,
        
		  et.total_worked_value + de.total_allow_excess + ben.total_allowance_benefit_m  + ben.total_allowance_benefit_a AS total_taxable_income ,
        et.total_worked_value + ben.total_deminimis_allowance + ben.total_allowance_benefit_m  + ben.total_allowance_benefit_a AS total_gross_income,
        ben.total_deminimis_allowance - de.total_allow_excess AS non_taxable_deminimis
    FROM emp_info
    LEFT JOIN Deminimis de
    ON emp_info.emp_id = de.emp_id
    LEFT JOIN Benefits ben
    ON emp_info.emp_id = ben.emp_id  
	 LEFT JOIN EmployeeTotals et
    ON emp_info.emp_id = et.emp_id   
    GROUP BY emp_info.emp_id
),
Loans AS (
    SELECT
        emp_info.emp_id,
        
        ROUND(COALESCE(gl.loan_monthly_payment, 0), 2) AS gov_loan_amount,
    ROUND(COALESCE(cl.loan_monthly_payment, 0), 2) AS com_loan_amount
        
       
       
    FROM emp_info
    LEFT JOIN emp_goverment_loans gl
    ON emp_info.emp_id = gl.emp_id
    LEFT JOIN emp_company_loans cl
    ON emp_info.emp_id = cl.emp_id
    LEFT JOIN Deminimis de
    ON emp_info.emp_id = de.emp_id
    LEFT JOIN Benefits ben
    ON emp_info.emp_id = ben.emp_id  
	 LEFT JOIN EmployeeTotals et
    ON emp_info.emp_id = et.emp_id   
    GROUP BY emp_info.emp_id
)

SELECT 
    et.emp_id,
    et.full_name,
    ? AS payrollType,
    ? AS payrollCycle,
    ? AS startDate,
    ? AS endDate,
    ? AS totalDays,
	 et.emp_rate,
    et.emp_pos,
    
    de.rice_allow,
    de.clothing_allow,
    de.laundry_allow,
    de.medical_allow,
    de.achivement_allow,
    de.actualmedical_assist,
   
    de.rice_allow_excess,
    de.clothing_allow_excess,
    de.laundry_allow_excess,
    de.medical_allow_excess,
    de.achivement_allow_excess,
    de.actualmedical_assist_excess,
	 	
    et.regular_value,
    et.total_regular_hours,
    et.total_regular_value,
    et.total_overtime_hours,
    et.total_overtime_value,
    et.total_nightdiff_hours,
    et.total_nightdiff_value,
	 et.total_overtime_nightdiff_hours,
	 et.total_overtime_nightdiff_value,
	 et.total_hours_work,
	 tc.non_taxable_deminimis,
	 ben.total_deminimis_allowance,
    de.total_allow_excess,
    ben.total_allowance_benefit_m,
	 ben.total_allowance_benefit_a,
	 et.total_worked_value,
	 tc.total_taxable_income,
    tc.total_gross_income,
    
	 
    -- Calculate the amount above the minimum income
     CASE WHEN tc.total_taxable_income >= b.min_income THEN  CASE 
     WHEN tc.total_taxable_income - b.min_income = tc.total_taxable_income  THEN 0 ELSE tc.total_taxable_income - b.min_income
     END ELSE 0  END AS Excess_tax,
     b.percentage_deduction_tax,

    -- Calculate the percentage tax based on the income above the minimum
    ROUND(
        CASE 
            WHEN tc.total_taxable_income > b.min_income THEN
                GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
            ELSE
                0
        END, 2
    ) AS total_percentage_tax,

    -- Fixed tax from the tax brackets
    COALESCE(b.fixed_tax, 0) AS total_fixed_tax,
    
    -- TOTAL TAX
		COALESCE( ROUND( CASE  WHEN tc.total_taxable_income > b.min_income THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
		ELSE 0 END, 2  ) + COALESCE(b.fixed_tax, 0), 0 ) AS total_tax,
		
    -- Total value after both fixed tax and percentage tax
    ROUND(
        tc.total_taxable_income - 
        (COALESCE(b.fixed_tax, 0) + 
        CASE 
            WHEN tc.total_taxable_income > b.min_income THEN
                GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
            ELSE
                0
        END), 2
    ) AS total_value_after_tax,
    
    -- Determine the SSS bracket based on total taxable income
    sss.ee_share AS employee_sss_share,
    sss.er_share AS employer_sss_share,
    sss.ec AS employment_compensation_share,
    sss.wisp_ee AS wisp_employee_share, 
    sss.wisp_er AS wisp_employer_share ,

    -- Calculate PhilHealth contributions
    ROUND(
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth), 2
    ) AS Total_philhealth,
    ROUND(
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2
    ) AS employee_philhealth,
    ROUND(
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) - 
        ROUND(LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2), 2
    ) AS employer_philhealth,

    -- Calculate HDMF contributions
    ROUND(
    CASE 
        WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
            -- Check if taxable income exceeds the limit, if so, use the limit for calculation
            CASE 
                WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                    COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_ee / 100
                ELSE
                    tc.total_gross_income * hb.hdmf_value_ee / 100
            END
		        ELSE
		            0
		    END, 2
		) AS employee_hdmf,
		 
  
			COALESCE(sss.ee_share, 0) + COALESCE(sss.wisp_ee, 0) +
			ROUND(COALESCE(LEAST( GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth ) / 2, 0 ), 2 ) +
			ROUND(COALESCE(CASE WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
			CASE  WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_ee / 100
			ELSE tc.total_gross_income * hb.hdmf_value_ee / 100 END ELSE  0 END,  0  ),  2
			) AS total_contribution_deduction,

			COALESCE(  ROUND( CASE  
			WHEN tc.total_taxable_income > b.min_income THEN  GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
			ELSE 0  END,  2 ) + COALESCE(b.fixed_tax, 0),   0 	)  + COALESCE(sss.ee_share, 0) 	+ COALESCE(sss.wisp_ee, 0)
			+ ROUND(COALESCE( LEAST( GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth),  pb.phb_max_philhealth ) / 2,  0 ),  2 ) 
			+ ROUND(CASE WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN 
			CASE WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_ee / 100
			ELSE tc.total_gross_income * hb.hdmf_value_ee / 100 END ELSE  0  END,  2 	) 
			AS total_gov_deduction,

			ls.gov_loan_amount + ls.com_loan_amount AS total_loan_amount,
					
			COALESCE(
			    ROUND(
        tc.total_taxable_income -   ls.gov_loan_amount - ls.com_loan_amount -
        (
            COALESCE(b.fixed_tax, 0) +  
            CASE  
                WHEN tc.total_taxable_income > b.min_income THEN 
                    GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100 
                ELSE  
                    0 
            END
        ) - 
        COALESCE(sss.wisp_ee, 0) - 
        COALESCE(sss.ee_share, 0) - 
        ROUND(
            LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2
        ) - 
        ROUND(
            CASE  
                WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN  
                    CASE 
                        WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                            COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_ee / 100  
                        ELSE 
                            tc.total_gross_income * hb.hdmf_value_ee / 100  
                    END 
                ELSE  
                    0  
            END, 2
        ) + 
		        COALESCE(non_taxable_deminimis, 0), 
		    2),
		0
		) AS total_net_pay

FROM EmployeeTotals et
LEFT JOIN TotalComputation tc
    ON et.emp_id = tc.emp_id 
LEFT JOIN tax_brackets_semi_monthly b ON 
    tc.total_taxable_income BETWEEN b.min_income AND COALESCE(b.max_income, tc.total_taxable_income)
LEFT JOIN philhealth_bracket pb ON pb.phb_id = 1 
LEFT JOIN hdmf_bracket hb ON 
    tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income)
LEFT JOIN sss_bracket sss ON 
    tc.total_gross_income BETWEEN sss.sss_min AND COALESCE(sss.sss_max, tc.total_gross_income)
LEFT JOIN Benefits ben
    ON et.emp_id = ben.emp_id
LEFT JOIN Deminimis de
    ON et.emp_id = de.emp_id
LEFT JOIN Loans ls
    ON et.emp_id = ls.emp_id	      
GROUP BY et.emp_id, et.emp_pos, b.min_income, b.percentage_deduction_tax, sss.ee_share, sss.er_share, sss.ec, sss.wisp_ee, sss.wisp_er;

`;

  db.query(query, [startDate, endDate, payrollType, payrollCycle, totalDays, startDate, endDate], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).send({ message: 'Employee summary data inserted successfully' });
  });
});


app.post('/payroll-part-2-m', async (req, res) => {
  const { startDate, endDate, payrollType, payrollCycle, totalDays } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  // SQL query for inserting payroll summary
  const query = `
   INSERT INTO emp_payroll_part_2 (
    emp_id,
    full_name,
    payrollType,
    payrollCycle,
    totalDays, 
    startDate,
    endDate,
    emp_rate,
    emp_pos,
    rice_allow,
    clothing_allow,
    laundry_allow,
    medical_allow,
    achivement_allow,
    actualmedical_assist,
    rice_allow_excess,
    clothing_allow_excess,
    laundry_allow_excess,
	 medical_allow_excess,
	 achivement_allow_excess,
	 actualmedical_assist_excess,
	 regular_value,
    total_regular_hours,
    total_regular_value,
    total_overtime_hours,
    total_overtime_value,
    total_nightdiff_hours,
    total_nightdiff_value,
    total_overtime_nightdiff_hours,
    total_overtime_nightdiff_value,
    total_hours_work,
    non_taxable_deminimis,
    total_deminimis_allowance,
    total_allow_excess,
    total_allow_benefits_m,
    total_allow_benefits_a,
    total_worked_value,
    total_taxable_income,
    total_gross_income,
    Excess_tax,
    percentage_deduction_tax,
	 total_percentage_tax,
	 total_fixed_tax,
   total_tax,
	 total_value_after_tax,
	 employee_sss_share,
	 employer_sss_share,
	 employment_compensation_share,
	 wisp_employee_share,
	 wisp_employer_share,
	 total_philhealth,
	 employee_philhealth,
	 employer_philhealth,
	 employee_hdmf,
	 employer_hdmf,
	 total_contribution_deduction,
	 total_gov_deduction,
	 total_loan_amount,
	 total_net_pay
)
WITH EmployeeTotals AS (
    SELECT 
        emp_info.emp_id,
        CONCAT(emp_info.f_name, ' ', emp_info.l_name) AS full_name, 
        emp_info.emp_pos,
        emp_info.emp_rate,
        emp_payroll_part_1.total_hours_,
        emp_payroll_part_1.total_hours_work,  
		  emp_payroll_part_1.total_regular_hours_value,
		  emp_payroll_part_1.total_overtime_hours_value,
		  emp_payroll_part_1.total_nightdiff_hours_value,
		  emp_payroll_part_1.total_overtime_nightdiff_hours_value ,
		  ROUND(COALESCE(emp_payroll_part_1.total_regular_hours_value_rt1, 0), 2) AS regular_value,

        
        TIME_FORMAT( SEC_TO_TIME( TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt1_r, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt2_rd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt3_sh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt4_shrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt5_dsh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt6_dshrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt7_rh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt8_rhrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt9_drh, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt10_drhrd, '00:00:00')) ), '%H:%i:%s' ) AS total_regular_hours,
		
		ROUND(  COALESCE(emp_payroll_part_1.total_regular_hours_value_rt1, 0) +  COALESCE(emp_payroll_part_1.total_regular_hours_value_rt2, 0) + COALESCE(emp_payroll_part_1.total_regular_hours_value_rt3, 0) +
  	    COALESCE(emp_payroll_part_1.total_regular_hours_value_rt4, 0) + COALESCE(emp_payroll_part_1.total_regular_hours_value_rt5, 0) +
   	 COALESCE(emp_payroll_part_1.total_regular_hours_value_rt6, 0) +  COALESCE(emp_payroll_part_1.total_regular_hours_value_rt7, 0) +
    	 COALESCE(emp_payroll_part_1.total_regular_hours_value_rt8, 0) + COALESCE(emp_payroll_part_1.total_regular_hours_value_rt9, 0) + COALESCE(emp_payroll_part_1.total_regular_hours_value_rt10, 0), 	2 ) AS total_regular_value,

		TIME_FORMAT( SEC_TO_TIME(
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt1_r, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt2_rd, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt3_sh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt4_shrd, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt5_dsh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt6_dshrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt7_rh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt8_rhrd, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt9_drh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_regular_hours_rt10_drhrd, '00:00:00')) ), '%H:%i:%s' ) AS total_overtime_hours,
		
		ROUND( COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt1, 0) +
   	 COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt2, 0) + COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt3, 0) + COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt4, 0) +
   	 COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt5, 0) + COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt6, 0) + COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt7, 0) +
   	 COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt8, 0) +  COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt9, 0) +  COALESCE(emp_payroll_part_1.total_overtime_hours_value_rt10, 0), 	2 ) AS total_overtime_value,
		
		TIME_FORMAT(  SEC_TO_TIME( TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt1_r, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt2_rd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt3_sh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt4_shrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt5_dsh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt6_dshrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt7_rh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt8_rhrd, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_rt9_drh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt10, '00:00:00')) ),  '%H:%i:%s' ) AS total_nightdiff_hours,
		
		ROUND( 	COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt1, 0) + 	COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt2, 0) +
  		   COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt3, 0) +  COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt4, 0) +
		   COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt5, 0) + COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt6, 0) + COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt7, 0) +
  		   COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt8, 0) + COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt9, 0) + COALESCE(emp_payroll_part_1.total_nightdiff_hours_value_rt10, 0), 2) AS total_nightdiff_value,
		
		TIME_FORMAT( SEC_TO_TIME( TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt1_r, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt2_rd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt3_sh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt4_shrd, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt5_dsh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt6_dshrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt7_rh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt8_rhrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt9_drh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.overtime_nightdiff_hours_rt10_drhrd, '00:00:00')) ), '%H:%i:%s' ) AS total_overtime_nightdiff_hours,
		
		ROUND( COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt1, 0) + COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt2, 0) + COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt3, 0) +
   		COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt4, 0) + COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt5, 0) + COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt6, 0) +
    		COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt7, 0) + COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt8, 0) +
   		COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt9, 0) +	COALESCE(emp_payroll_part_1.total_overtime_nightdiff_hours_value_rt10, 0), 	2 ) AS total_overtime_nightdiff_value,

-- Total Taxable Income (Including allowances and payroll values)
	ROUND(
    -- Payroll values for taxable income
    emp_payroll_part_1.total_regular_hours_value + 
    emp_payroll_part_1.total_overtime_hours_value + 
    emp_payroll_part_1.total_nightdiff_hours_value + 
    emp_payroll_part_1.total_overtime_nightdiff_hours_value,
    2 ) AS total_worked_value

    FROM emp_info
    LEFT JOIN emp_payroll_part_1 ON emp_info.emp_id = emp_payroll_part_1.emp_id
    LEFT JOIN emp_allowance_benefits_deminimis_monthly_1 
        ON emp_info.emp_id = emp_allowance_benefits_deminimis_monthly_1.emp_id
    LEFT JOIN emp_deminimis_1 
        ON emp_allowance_benefits_deminimis_monthly_1.allowance_type = emp_deminimis_1.allowance_type
	WHERE  emp_payroll_part_1.startDate BETWEEN ? AND ?
	 GROUP BY emp_info.emp_id

),
Deminimis AS (
    SELECT
        emp_info.emp_id,
		        
		CASE WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
		    THEN ROUND(COALESCE(eabdm.rice_allow, 0), 2)  ELSE 0.00 
		END AS rice_allow,
		
		CASE WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
		    THEN ROUND(COALESCE(eabdm.clothing_allow, 0), 2) ELSE 0.00 
		END AS clothing_allow,
		
		CASE WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
		    THEN ROUND(COALESCE(eabdm.laundry_allow, 0), 2)  ELSE 0.00 
		END AS laundry_allow,
		
		CASE WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
		    THEN ROUND(COALESCE(eabdm.medical_allow, 0), 2)  ELSE 0.00 
		END AS medical_allow,
		
		CASE WHEN eabda.allowance_type = 'Annually' AND eabda.status = 'Active' 
		    THEN ROUND(COALESCE(eabda.achivement_allow, 0), 2)  ELSE 0.00 
		END AS achivement_allow,
		
		CASE WHEN eabda.allowance_type = 'Annually' AND eabda.status = 'Active' 
		    THEN ROUND(COALESCE(eabda.actualmedical_assist, 0), 2) ELSE 0.00 
		END AS actualmedical_assist,
		  
		  -- Monthly Allowances with Excess Calculation
    GREATEST(CASE WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active'
            THEN ROUND(COALESCE(eabdm.rice_allow, 0), 2)
            ELSE 0 END - ROUND(COALESCE(ed.rice_allow, 0), 2),  0
    ) AS rice_allow_excess,

    GREATEST( CASE  WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active'
            THEN ROUND(COALESCE(eabdm.clothing_allow, 0), 2)
            ELSE 0 END -   ROUND(COALESCE(ed.clothing_allow, 0), 2), 0
    ) AS clothing_allow_excess,

    GREATEST(CASE WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active'
            THEN ROUND(COALESCE(eabdm.laundry_allow, 0), 2)
            ELSE 0  END -   ROUND(COALESCE(ed.laundry_allow, 0), 2),   0
    ) AS laundry_allow_excess,

    GREATEST( CASE  WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active'
            THEN ROUND(COALESCE(eabdm.medical_allow, 0), 2)
            ELSE 0  END - ROUND(COALESCE(ed.medical_allow, 0), 2),   0
    ) AS medical_allow_excess,

    -- Annually Allowances with Excess Calculation
    GREATEST( CASE WHEN eabda.allowance_type = 'Annually' AND eabda.status = 'Active'
            THEN ROUND(COALESCE(eabda.achivement_allow, 0), 2)
            ELSE 0  END -  ROUND(COALESCE(ed.achivement_allow, 0), 2), 0
    ) AS achivement_allow_excess,

    GREATEST(  CASE  WHEN eabda.allowance_type = 'Annually' AND eabda.status = 'Active'
            THEN ROUND(COALESCE(eabda.actualmedical_assist, 0), 2)
            ELSE 0 END -  ROUND(COALESCE(ed.actualmedical_assist, 0), 2), 0
    ) AS actualmedical_assist_excess,

		-- TOTAL EXCESS
	
	 GREATEST( CASE WHEN eabdm.status = 'Active' THEN ROUND(COALESCE(eabdm.rice_allow, 0), 2) ELSE 0
        END - ROUND(COALESCE(ed.rice_allow, 0), 2),  0 ) +
    GREATEST(  CASE WHEN eabdm.status = 'Active' THEN ROUND(COALESCE(eabdm.clothing_allow, 0), 2) ELSE 0
        END - ROUND(COALESCE(ed.clothing_allow, 0), 2),  0  ) +
    GREATEST( CASE WHEN eabdm.status = 'Active' THEN ROUND(COALESCE(eabdm.laundry_allow, 0), 2) ELSE 0
        END - ROUND(COALESCE(ed.laundry_allow, 0), 2),  0  ) +
    GREATEST( CASE  WHEN eabdm.status = 'Active' THEN ROUND(COALESCE(eabdm.medical_allow, 0), 2)  ELSE 0
        END - ROUND(COALESCE(ed.medical_allow, 0), 2),   0  ) +
    GREATEST(  CASE WHEN eabda.status = 'Active' THEN ROUND(COALESCE(eabda.achivement_allow, 0), 2)  ELSE 0
        END - ROUND(COALESCE(ed.achivement_allow, 0), 2),   0 ) +
    GREATEST(  CASE WHEN eabda.status = 'Active' THEN ROUND(COALESCE(eabda.actualmedical_assist, 0), 2) ELSE 0
        END - ROUND(COALESCE(ed.actualmedical_assist, 0), 2), 0
    ) AS total_allow_excess

    FROM emp_info
    LEFT JOIN emp_allowance_benefits_deminimis_monthly eabdm
        ON emp_info.emp_id = eabdm.emp_id
    LEFT JOIN emp_allowance_benefits_deminimis_annually eabda
        ON emp_info.emp_id = eabda.emp_id
    LEFT JOIN emp_deminimis ed
        ON eabdm.allowance_type = ed.allowance_type
    GROUP BY emp_info.emp_id
), 
Benefits AS (
    SELECT
        emp_info.emp_id,
        ROUND(SUM(CASE WHEN emp_allowance_benefits.status = 'Active'  AND emp_allowance_benefits.allowance_type = 'Monthly' 
        THEN COALESCE(emp_allowance_benefits.allowance_value, 0) ELSE 0  END  ),  2
        ) AS total_allowance_benefit_m,
        
        ROUND(SUM(CASE WHEN emp_allowance_benefits.status = 'Active'  AND emp_allowance_benefits.allowance_type = 'Annually' 
        THEN COALESCE(emp_allowance_benefits.allowance_value, 0) ELSE 0  END  ),  2
        ) AS total_allowance_benefit_a,
        
        
        de.rice_allow + de.clothing_allow + de.laundry_allow + de.medical_allow +  de.achivement_allow + de.actualmedical_assist 
		  AS total_deminimis_allowance
        
        
    FROM emp_info
    LEFT JOIN emp_allowance_benefits 
        ON emp_info.emp_id = emp_allowance_benefits.emp_id
    LEFT JOIN Deminimis de
    ON emp_info.emp_id = de.emp_id
	 LEFT JOIN EmployeeTotals et
    ON emp_info.emp_id = et.emp_id   
    GROUP BY emp_info.emp_id
),

TotalComputation AS (
    SELECT
        emp_info.emp_id,
        
		  et.total_worked_value + de.total_allow_excess + ben.total_allowance_benefit_m  + ben.total_allowance_benefit_a AS total_taxable_income ,
        et.total_worked_value + ben.total_deminimis_allowance + ben.total_allowance_benefit_m  + ben.total_allowance_benefit_a AS total_gross_income,
        ben.total_deminimis_allowance - de.total_allow_excess AS non_taxable_deminimis
    FROM emp_info
    LEFT JOIN Deminimis de
    ON emp_info.emp_id = de.emp_id
    LEFT JOIN Benefits ben
    ON emp_info.emp_id = ben.emp_id  
	 LEFT JOIN EmployeeTotals et
    ON emp_info.emp_id = et.emp_id   
    GROUP BY emp_info.emp_id
),
Loans AS (
    SELECT
        emp_info.emp_id,
        
        ROUND(COALESCE(gl.loan_monthly_payment, 0), 2) AS gov_loan_amount,
    ROUND(COALESCE(cl.loan_monthly_payment, 0), 2) AS com_loan_amount
        
       
       
    FROM emp_info
    LEFT JOIN emp_goverment_loans gl
    ON emp_info.emp_id = gl.emp_id
    LEFT JOIN emp_company_loans cl
    ON emp_info.emp_id = cl.emp_id
    LEFT JOIN Deminimis de
    ON emp_info.emp_id = de.emp_id
    LEFT JOIN Benefits ben
    ON emp_info.emp_id = ben.emp_id  
	 LEFT JOIN EmployeeTotals et
    ON emp_info.emp_id = et.emp_id   
    GROUP BY emp_info.emp_id
)

SELECT 
    et.emp_id,
    et.full_name,
    ? AS payrollType,
    ? AS payrollCycle,
    ? AS totalDays,
    ? AS startDate,
    ? AS endDate,

	 et.emp_rate,
    et.emp_pos,
    
    de.rice_allow,
    de.clothing_allow,
    de.laundry_allow,
    de.medical_allow,
    de.achivement_allow,
    de.actualmedical_assist,
   
    de.rice_allow_excess,
    de.clothing_allow_excess,
    de.laundry_allow_excess,
    de.medical_allow_excess,
    de.achivement_allow_excess,
    de.actualmedical_assist_excess,
	 	
    et.regular_value,
    et.total_regular_hours,
    et.total_regular_value,
    et.total_overtime_hours,
    et.total_overtime_value,
    et.total_nightdiff_hours,
    et.total_nightdiff_value,
	 et.total_overtime_nightdiff_hours,
	 et.total_overtime_nightdiff_value,
	 et.total_hours_work,
	 tc.non_taxable_deminimis,
	 ben.total_deminimis_allowance,
    de.total_allow_excess,
    ben.total_allowance_benefit_m,
	 ben.total_allowance_benefit_a,
	 et.total_worked_value,
	 tc.total_taxable_income,
    tc.total_gross_income,
    
	 
    -- Calculate the amount above the minimum income
     CASE WHEN tc.total_taxable_income >= b.min_income THEN  CASE 
     WHEN tc.total_taxable_income - b.min_income = tc.total_taxable_income  THEN 0 ELSE tc.total_taxable_income - b.min_income
     END ELSE 0  END AS Excess_tax,
     b.percentage_deduction_tax,

    -- Calculate the percentage tax based on the income above the minimum
    ROUND(
        CASE 
            WHEN tc.total_taxable_income > b.min_income THEN
                GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
            ELSE
                0
        END, 2
    ) AS total_percentage_tax,

    -- Fixed tax from the tax brackets
    COALESCE(b.fixed_tax, 0) AS total_fixed_tax,
    
    -- TOTAL TAX
		COALESCE( ROUND( CASE  WHEN tc.total_taxable_income > b.min_income THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
		ELSE 0 END, 2  ) + COALESCE(b.fixed_tax, 0), 0 ) AS total_tax,
		
    -- Total value after both fixed tax and percentage tax
    ROUND(
        tc.total_taxable_income - 
        (COALESCE(b.fixed_tax, 0) + 
        CASE 
            WHEN tc.total_taxable_income > b.min_income THEN
                GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
            ELSE
                0
        END), 2
    ) AS total_value_after_tax,
    
    -- Determine the SSS bracket based on total taxable income
    sss.ee_share AS employee_sss_share,
    sss.er_share AS employer_sss_share,
    sss.ec AS employment_compensation_share,
    sss.wisp_ee AS wisp_employee_share, 
    sss.wisp_er AS wisp_employer_share ,

    -- Calculate PhilHealth contributions
    ROUND(
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth), 2
    ) AS Total_philhealth,
    ROUND(
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2
    ) AS employee_philhealth,
    ROUND(
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) - 
        ROUND(LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2), 2
    ) AS employer_philhealth,

    -- Calculate HDMF contributions
    ROUND(
    CASE 
        WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
            -- Check if taxable income exceeds the limit, if so, use the limit for calculation
            CASE 
                WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                    COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_ee / 100
                ELSE
                    tc.total_gross_income * hb.hdmf_value_ee / 100
            END
		        ELSE
		            0
		    END, 2
		) AS employee_hdmf,

ROUND(
    CASE 
        WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
            -- Check if taxable income exceeds the limit, if so, use the limit for calculation
            CASE 
                WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                    COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100
                ELSE
                    tc.total_gross_income * hb.hdmf_value_er / 100
            END
        ELSE
            0
    END, 2
) AS employer_hdmf,

		 
  
			COALESCE(sss.ee_share, 0) + COALESCE(sss.wisp_ee, 0) +
			ROUND(COALESCE(LEAST( GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth ) / 2, 0 ), 2 ) +
			ROUND(COALESCE(CASE WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
			CASE  WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_ee / 100
			ELSE tc.total_gross_income * hb.hdmf_value_ee / 100 END ELSE  0 END,  0  ),  2
			) AS total_contribution_deduction,

			COALESCE(  ROUND( CASE  
			WHEN tc.total_taxable_income > b.min_income THEN  GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
			ELSE 0  END,  2 ) + COALESCE(b.fixed_tax, 0),   0 	)  + COALESCE(sss.ee_share, 0) 	+ COALESCE(sss.wisp_ee, 0)
			+ ROUND(COALESCE( LEAST( GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth),  pb.phb_max_philhealth ) / 2,  0 ),  2 ) 
			+ ROUND(CASE WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN 
			CASE WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_ee / 100
			ELSE tc.total_gross_income * hb.hdmf_value_ee / 100 END ELSE  0  END,  2 	) 
			AS total_gov_deduction,

			ls.gov_loan_amount + ls.com_loan_amount AS total_loan_amount,
					
			COALESCE(
			    ROUND(
        tc.total_taxable_income -   ls.gov_loan_amount - ls.com_loan_amount -
        (
            COALESCE(b.fixed_tax, 0) +  
            CASE  
                WHEN tc.total_taxable_income > b.min_income THEN 
                    GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100 
                ELSE  
                    0 
            END
        ) - 
        COALESCE(sss.wisp_ee, 0) - 
        COALESCE(sss.ee_share, 0) - 
        ROUND(
            LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2
        ) - 
        ROUND(
            CASE  
                WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN  
                    CASE 
                        WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                            COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_ee / 100  
                        ELSE 
                            tc.total_gross_income * hb.hdmf_value_ee / 100  
                    END 
                ELSE  
                    0  
            END, 2
        ) + 
		        COALESCE(non_taxable_deminimis, 0), 
		    2),
		0
		) AS total_net_pay

FROM EmployeeTotals et
LEFT JOIN TotalComputation tc
    ON et.emp_id = tc.emp_id 
LEFT JOIN tax_brackets_monthly b ON 
    tc.total_taxable_income BETWEEN b.min_income AND COALESCE(b.max_income, tc.total_taxable_income)
LEFT JOIN philhealth_bracket pb ON pb.phb_id = 1 
LEFT JOIN hdmf_bracket hb ON 
    tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income)
LEFT JOIN sss_bracket sss ON 
    tc.total_gross_income BETWEEN sss.sss_min AND COALESCE(sss.sss_max, tc.total_gross_income)
LEFT JOIN Benefits ben
    ON et.emp_id = ben.emp_id
LEFT JOIN Deminimis de
    ON et.emp_id = de.emp_id
LEFT JOIN Loans ls
    ON et.emp_id = ls.emp_id	      
GROUP BY et.emp_id, et.emp_pos, b.min_income, b.percentage_deduction_tax, sss.ee_share, sss.er_share, sss.ec, sss.wisp_ee, sss.wisp_er;
    `;

  db.query(query, [startDate, endDate, payrollType, payrollCycle, totalDays, startDate, endDate], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).send({ message: 'Employee summary data inserted successfully' });
  });
});

app.get('/payroll/cycle', async (req, res) => {
  const { payrollType, cycleType } = req.query; // Expecting query params for payrollType and cycleType

  try {
    const result = await pool.query(
      'SELECT start_day, end_day FROM payroll_cycles WHERE payroll_type = $1 AND cycle_type = $2',
      [payrollType, cycleType]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payroll cycle not found' });
    }

    const { start_day, end_day } = result.rows[0];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // Get current month (0 = January, 11 = December)

    // Calculate full start and end dates based on current month and year
    const startDate = new Date(currentYear, currentMonth, start_day);
    const endDate = new Date(currentYear, currentMonth, end_day);

    res.json({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DATE CYCLE 
app.get('/date_cycle', (req, res) => {
  const query = 'SELECT DISTINCT payroll_type, cycle_type FROM emp_date_cycle';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Failed to fetch data' });
    } else {
      res.status(200).json(results);
    }
  });
});


app.listen(8800, () => {
  console.log("Connected in Backend!");
});
