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
  database: 'apbs_db',
});

export const dbNew = await mysqlNew.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'apbs_db',
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
const __dirname = path.resolve();
const uploadDB = multer({ dest: "uploads/" });

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

//Fetch DMB Data
app.get("/get-dmb", (req, res) => {
  const query = 'SELECT * FROM sys_dmb';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching DMB values:', err);
      return res.status(500).json({ error: 'Failed to fetch DMB values' });
    }

    res.json(results);
  });
})

//Get loans
app.get("/get-loans", (req, res) => {
  const query = 'SELECT * FROM emp_loans';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Loans:', err);
      return res.status(500).json({error: 'Failed to fetch Loan'});
    }
    res.json(results);
  })
})

//Fetch NPRTRV Data
app.get("/get-nprtrv", (req, res) => {
  const query = 'SELECT * FROM sys_nprtrv';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching NPRTRV values:', err);
      return res.status(500).json({ error: 'Failed to fetch NPRTRV values' });
    }

    res.json(results);
  });
})

//Fetch Deduction Data
app.get("/get-deduc", (req, res) => {
  const query = 'SELECT * FROM sys_deduc';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Deduction values:', err);
      return res.status(500).json({ error: 'Failed to fetch Deduction values' });
    }

    res.json(results);
  });
})

//Fetch Rate Value
app.get("/get-rate-value", (req, res) => {
  const query = 'SELECT * FROM rate_value';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Rate Values:', err);
      return res.status(500).json({ error: 'Failed to fetch Rate Values' });
    }

    res.json(results);
  });
})

//Fetch Tax Data
app.get("/get-tax", (req, res) => {
  const query = 'SELECT * FROM sys_tax';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Tax values:', err);
      return res.status(500).json({ error: 'Failed to fetch Tax values' });
    }

    res.json(results);
  });
})

//Fetch Payroll Settings
app.get("/get-payroll-settings", (req, res) => {
  const query = "SELECT * FROM settings_payroll";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching Payroll settings:", err);
      return res.status(500).json({ error: "Failed to fetch Payroll settings" });
    }
    res.json(results);
  });
});

//Fetch Leave Type
app.get("/get-leave-type", (req, res) => {
  const query = "SELECT * FROM emp_leave_type";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching Leave Type:", err);
      return res.status(500).json({ error: "Failed to fetch Leave Type" });
    }
    res.json(results);
  });
});

//Fetch Loan Type
app.get("/get-loan-type", (req, res) => {
  const query = "SELECT * FROM emp_loan_type";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching Loan Type:", err);
      return res.status(500).json({ error: "Failed to fetch Loan Type" });
    }
    res.json(results);
  });
});

//Fetch Employment Type
app.get("/get-employment-type", (req, res) => {
  const query = "SELECT * FROM employment_type";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching Employment Type:", err);
      return res.status(500).json({ error: "Failed to fetch Employment Type" });
    }
    res.json(results);
  });
});

//Fetch Civil Status for System Variables
app.get("/get-civil-status", (req, res) => {
  const query = "SELECT * FROM civil_status";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching Civil Status:", err);
      return res.status(500).json({ error: "Failed to fetch Civil Status" });
    }
    res.json(results);
  });
});

//Fetch Sex for System Variables
app.get("/get-sex", (req, res) => {
  const query = "SELECT * FROM sex";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching Sex:", err);
      return res.status(500).json({ error: "Failed to fetch Civil Status" });
    }
    res.json(results);
  });
});

//Send Emp Report
app.post("/emp-report", (req, res) => {
  const { date, details, employeeId, employeeName } = req.body;
  const sql = "INSERT INTO emp_report (date, details, emp_id, emp_name) VALUES (?, ?, ?, ?)";
  db.query(sql, [date, details, employeeId, employeeName], (err, data) => {
    if (err) return res.json(err);
    return res.json({ status: 1, message: "Employee Report Created" });
  });
});

//Send Payroll Report
app.post("/payroll-report", (req, res) => {
  const { date, details, employeeId, employeeName } = req.body;
  const sql = "INSERT INTO payroll_report (date, details, emp_id, emp_name) VALUES (?, ?, ?, ?)";
  db.query(sql, [date, details, employeeId, employeeName], (err, data) => {
    if (err) return res.json(err);
    return res.json({ status: 1, message: "Payroll Report Created" });
  });
});

//Fetch Emp Report
app.get("/fetch-payroll-report", (req, res) => {
  const sql = "SELECT * FROM payroll_report";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Fetch Emp Report
app.get("/fetch-emp-report", (req, res) => {
  const sql = "SELECT * FROM emp_report";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Fetch Employee For Report
app.get("/fetch-emp", (req, res) => {
  const sql = "SELECT * FROM emp_info WHERE is_archive = 0";
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

//Fetch Category Report
app.get("/fetch-category-report", (req, res) => {
  const sql = "SELECT * FROM emp_report_category";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Fetch Report
app.get("/report-data", (req, res) => {
  const sql = "SELECT * FROM emp_report_1";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// GET /report/:id — Used in frontend
app.get("/report/:id", (req, res) => {
  const empId = req.params.id;
  const sql = "SELECT * FROM emp_report_1 WHERE emp_id = ?";
  db.query(sql, [empId], (err, result) => {
    if (err) {
      console.error("Error fetching report data:", err);
      return res.status(500).json({ error: "Failed to fetch report data" });
    }
    res.json(result[0]); // assuming you want a single object per employee
  });
});


// Update Payroll Settings
// app.post("/update-payroll-settings/:id", (req, res) => {
//   const { id } = req.params;
//   const { value } = req.body;
//   const query = 'UPDATE settings_payroll SET paysett_name = ? WHERE paysett_id = ?';

//   db.query(query, [value, id], (err, result) => {
//     if (err) {
//       console.error('Error updating Payroll settings:', err);
//       return res.status(500).json({ error: 'Failed to update Payroll settings' });
//     }
//     res.json({ message: 'Payroll settings updated successfully' });
//   });
// });

//Save New DMB Value
app.post("/save-dmb", (req, res) => {
  const { title, value } = req.body;

  if (!title || !value) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = 'INSERT INTO sys_dmb (dmb_name, dmb_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE dmb_value = VALUES(dmb_value)';
  db.query(query, [title, value], (err, results) => {
    if (err) {
      console.error('Error inserting DMB value:', err);
      return res.status(500).json({ error: 'Failed to insert DMB value' });
    }

    res.status(200).json({ message: 'DMB value added successfully' });
  });
});

// Save or Update Payroll Settings
app.post("/save-payroll-settings", (req, res) => {
  const { paysett_id, paysett_name } = req.body;

  if (!paysett_name) {
    return res.status(400).json({ error: "paysett_name is required" });
  }

  const paysett_label = `Enable ${paysett_name}`; // Automatically format value

  const query = `
    INSERT INTO settings_payroll (paysett_id, paysett_name, paysett_label) 
    VALUES (?, ?, ?) 
    ON DUPLICATE KEY UPDATE paysett_name = VALUES(paysett_name), paysett_label = VALUES(paysett_label)
  `;

  db.query(query, [paysett_id, paysett_name, paysett_label], (err, results) => {
    if (err) {
      console.error("Error saving Payroll Setting:", err);
      return res.status(500).json({ error: "Failed to save Payroll Setting" });
    }
    // If insertId exists, it's a new insert. Otherwise, it's an update.
    const returnedId = paysett_id || results.insertId;
    res.status(200).json({ message: "Payroll Setting saved successfully", paysett_id: returnedId });
  });
});

//Save Leave Type
app.post("/save-leave-type", (req, res) => {
  const { emp_leave_type_id, leave_type_name } = req.body;
  if (!leave_type_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const query = 'INSERT INTO emp_leave_type (emp_leave_type_id, leave_type_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE leave_type_name = VALUES(leave_type_name)';
  db.query(query, [emp_leave_type_id, leave_type_name], (err, results) => {
    if (err) {
      console.error('Error inserting Leave Type:', err);
      return res.status(500).json({ error: 'Failed to insert Leave Type' });
    }
    // If insertId exists, it's a new insert. Otherwise, it's an update.
    const returnedId = emp_leave_type_id || results.insertId;
    res.status(200).json({ message: 'Leave Type added successfully', emp_leave_type_id: returnedId });
  });
});

//Save Employment Type
app.post("/save-employment-type", (req, res) => {
  const { employment_type_id, employment_type_name } = req.body;
  if (!employment_type_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const query = 'INSERT INTO employment_type (employment_type_id, employment_type_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE employment_type_name = VALUES(employment_type_name)';
  db.query(query, [employment_type_id, employment_type_name], (err, results) => {
    if (err) {
      console.error('Error inserting Employment Type:', err);
      return res.status(500).json({ error: 'Failed to insert Employment Type' });
    }
    // If insertId exists, it's a new insert. Otherwise, it's an update.
    const returnedId = employment_type_id || results.insertId;
    res.status(200).json({ message: 'Employment Type added successfully', employment_type_id: returnedId });
  });
});

//Save New Nprtrv Value
app.post("/save-nprtrv", (req, res) => {
  const { title, value } = req.body;

  if (!title || !value) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = 'INSERT INTO sys_nprtrv (nprtrv_name, nprtrv_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE nprtrv_value = VALUES(nprtrv_value)';
  db.query(query, [title, value], (err, results) => {
    if (err) {
      console.error('Error inserting NPRTRV value:', err);
      return res.status(500).json({ error: 'Failed to insert NPRTRV value' });
    }

    res.status(200).json({ message: 'NPRTRV value added successfully' });
  });
});

//Save New Deduction Value
app.post("/save-deduc", (req, res) => {
  const { title, value } = req.body;

  if (!title || !value) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = 'INSERT INTO sys_deduc (deduc_name, deduc_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE deduc_value = VALUES(deduc_value)';
  db.query(query, [title, value], (err, results) => {
    if (err) {
      console.error('Error inserting Deduction value:', err);
      return res.status(500).json({ error: 'Failed to insert Deduction value' });
    }

    res.status(200).json({ message: 'Deduction value added successfully' });
  });
});

//Save Rate Value
app.post("/save-rate-value", (req, res) => {
  const { title, value } = req.body;

  if (!title || !value) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = 'INSERT INTO rate_value (position, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)';
  db.query(query, [title, value], (err, results) => {
    if (err) {
      console.error('Error inserting Rate Value:', err);
      return res.status(500).json({ error: 'Failed to insert Rate Value' });
    }

    res.status(200).json({ message: 'Rate Value added successfully' });
  });
});

//Delete Rate Value
app.delete('/delete-rate-value/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM rate_value WHERE position_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting Rate Value:', err);
      return res.status(500).json({ error: 'Failed to delete Rate Value' });
    }
    res.json({ message: 'Rate Value deleted successfully' });
  });
});

//Delete Deduction
app.delete('/delete-deduc/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM sys_deduc WHERE deduc_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting Deduction:', err);
      return res.status(500).json({ error: 'Failed to delete Deduction' });
    }
    res.json({ message: 'Deduction deleted successfully' });
  });
});

//Delete Dmb
app.delete('/delete-dmb/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM sys_dmb WHERE dmb_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting Deduction:', err);
      return res.status(500).json({ error: 'Failed to delete Deduction' });
    }
    res.json({ message: 'Deduction deleted successfully' });
  });
});

//Delete Payroll Settings
app.delete('/delete-payroll-settings/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM settings_payroll WHERE paysett_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting Payroll Settings:', err);
      return res.status(500).json({ error: 'Failed to delete Payroll Settings' });
    }
    res.json({ message: 'Payroll Settings deleted successfully' });
  });
});

//Delete Leave Type
app.delete('/delete-leave-type/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM emp_leave_type WHERE emp_leave_type_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting Leave Type:', err);
      return res.status(500).json({ error: 'Failed to delete Leave Type' });
    }
    res.json({ message: 'Leave Type deleted successfully' });
  });
});

//Delete Employment Type
app.delete('/delete-employment-type/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM employment_type WHERE employment_type_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting Employment Type:', err);
      return res.status(500).json({ error: 'Failed to delete Employment Type' });
    }
    res.json({ message: 'Employment Type deleted successfully' });
  });
});

//Delete Loan Type
app.delete('/delete-loan-type/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM emp_loan_type WHERE emp_loan_type_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting Loan Type:', err);
      return res.status(500).json({ error: 'Failed to delete Loan Type' });
    }
    res.json({ message: 'Loan Type deleted successfully' });
  });
});

//Delete Civil Status for System Variables
app.delete('/delete-civil-status/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM civil_status WHERE cs_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting Civil Status:', err);
      return res.status(500).json({ error: 'Failed to delete Civil Status' });
    }
    res.json({ message: 'Civil Status deleted successfully' });
  });
});

//Delete Sex for System Variables
app.delete('/delete-sex/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM sex WHERE sex_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting Sex:', err);
      return res.status(500).json({ error: 'Failed to delete Sex' });
    }
    res.json({ message: 'Sex deleted successfully' });
  });
});

//Save Loan Type
app.post("/save-loan-type", (req, res) => {
  const { emp_loan_type_id, goverment_name } = req.body;
  if (!goverment_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const query = 'INSERT INTO emp_loan_type (emp_loan_type_id, goverment_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE loan_type_name = VALUES(loan_type_name)';
  db.query(query, [emp_loan_type_id, goverment_name], (err, results) => {
    if (err) {
      console.error('Error inserting Loan Type:', err);
      return res.status(500).json({ error: 'Failed to insert Loan Type' });
    }
    // If insertId exists, it's a new insert. Otherwise, it's an update.
    const returnedId = emp_loan_type_id || results.insertId;
    res.status(200).json({ message: 'Loan Type added successfully', emp_loan_type_id: returnedId });
  });
});

//Save Civil Status for System Variables
app.post("/save-civil-status", (req, res) => {
  const { cs_id, cs_name } = req.body;
  if (!cs_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const query = 'INSERT INTO civil_status (cs_id, cs_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE cs_name = VALUES(cs_name)';
  db.query(query, [cs_id, cs_name], (err, results) => {
    if (err) {
      console.error('Error inserting Civil Status:', err);
      return res.status(500).json({ error: 'Failed to insert Civil Status' });
    }
    // If insertId exists, it's a new insert. Otherwise, it's an update.
    const returnedId = cs_id || results.insertId;
    res.status(200).json({ message: 'Civil Status added successfully', cs_id: returnedId });
  });
});

//Save Sex for System Variables
app.post("/save-sex", (req, res) => {
  const { sex_id, sex_name } = req.body;
  if (!sex_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const query = 'INSERT INTO sex (sex_id, sex_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE sex_name = VALUES(sex_name)';
  db.query(query, [sex_id, sex_name], (err, results) => {
    if (err) {
      console.error('Error inserting Sex:', err);
      return res.status(500).json({ error: 'Failed to insert Sex' });
    }
    // If insertId exists, it's a new insert. Otherwise, it's an update.
    const returnedId = sex_id || results.insertId;
    res.status(200).json({ message: 'Sex added successfully', sex_id: returnedId });
  });
});

//Save New Tax Value
app.post("/save-tax", (req, res) => {
  const { tax_value } = req.body;

  if (!tax_value) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = 'UPDATE sys_tax SET tax_value = ? WHERE tax_id = 1';
  db.query(query, [title, value], (err, results) => {
    if (err) {
      console.error('Error inserting Tax value:', err);
      return res.status(500).json({ error: 'Failed to insert Tax value' });
    }

    res.status(200).json({ message: 'Tax value added successfully' });
  });
});

// Fetch data in PayslipFormat
app.get('/payslip/:id', async (req, res) => {
  const id = req.params.id; // Extract ID from URL
  db.query('SELECT * FROM emp_payroll_part_1 WHERE emp_id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length > 0) {
      res.json(results[0]); // Return the first result
    } else {
      res.status(404).send('No data found for the given ID');
    }
  });
});


//Fetch Payslip Data in GeneratePayslip
app.get("/payslip-data", async (req, res) => {
  const sql = "SELECT * FROM emp_payroll_part_1"

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching payslip data: ', err);
      return res.status(500).json({ error: 'Failed to fetch payslip data' });
    }
    res.json(results);
  });
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

// FETCH for registering rfid
app.get("/fetch-emp-info", (req, res) => {
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

//Fetch Payroll Type
app.get("/payroll-type", (req, res) => {
  const sql = "SELECT * FROM payroll_type";
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
  const query = `INSERT INTO login_history (username, date, role, action) VALUES (?, ?, ?, ?)`;
  db.query(query, [loginEvent.username, loginEvent.date, loginEvent.role, loginEvent.action], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error storing login history' });
    } else {
      res.send({ message: 'Login history stored successfully' });
    }
  });
});

app.post('/audit', (req, res) => {
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


app.get('/fetch-audit', (req, res) => {
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
    status, employmentType, position, ratetype, rateValue, department, datestart, dateend, sss, philHealth, hdmf, tin } = req.body;

  const query = 'INSERT INTO emp_info (l_name, f_name, m_name, suffix, civil_status, sex, emp_citi, emp_religion, date_of_birth, province_of_birth, city_of_birth, email, mobile_num, region, province, city, barangay, street_add, emp_status, emp_emptype, emp_pos,  emp_ratetype, emp_rate, emp_dept, emp_datehired, emp_dateend, emp_tin, emp_sss, emp_philhealth, emp_hdmf) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)';
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
    const sql = `INSERT INTO emp_attendance_2 (emp_id, date, time_in, break_in, break_out, time_out) VALUES (?, ?, ?, ?, ?, ?)`;

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
      ea.total_hours,
      ea.total_ot_hours
    FROM emp_attendance_1_1 ea
    JOIN emp_info ei ON ea.emp_id = ei.emp_id
    LIMIT ? OFFSET ?
  `;

//   const sql = `
//   SELECT 
//     ea.emp_attendance_id, 
//     ea.emp_id,
//     ea.date, 
//     CONCAT(ei.f_name, ' ', ei.l_name) AS full_name, 
//     ea.time_in, 
//     ea.time_out,
//     ea.total_hours,
//     ea.total_regular_hours,
//     ea.total_ot_hours,
//     ea.total_night_diff_hours
//   FROM emp_attendance_1_1 ea
//   JOIN emp_info ei ON ea.emp_id = ei.emp_id
//   WHERE ea.date = CURDATE()  -- Only fetch today's attendance
//   ORDER BY ea.date DESC
//   LIMIT ? OFFSET ?
// `;

  db.query(sql, [limit, offset], (err, results) => {
    if (err) {
      console.error("Error fetching attendance:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
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

//Departement
app.get('/dept-attendance', (req, res) => {
  const sql = `
    SELECT 
      UPPER(TRIM(ei.emp_dept)) AS emp_dept,
      SUM(COALESCE(pac.present_count, 0)) AS present_count,
      SUM(COALESCE(pac.absent_count, 0)) AS absent_count
    FROM emp_info ei
    LEFT JOIN absent_present_count pac ON ei.emp_id = pac.emp_id
    GROUP BY UPPER(TRIM(ei.emp_dept))

  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Database Query Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// Attendance Time In Handler
app.post('/attendance-scan', (req, res) => {
  const { emp_id, time, date } = req.body;

  const query = `SELECT * FROM emp_attendance_1_1 WHERE emp_id = ? AND date = ?`;
  db.query(query, [emp_id, date], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: 'Database error.' });
    }

    const currentTime = new Date(`${time}:00`);
    const workStart = new Date(`${date}T11:00:00`);
    const workEnd = new Date(`${date}T16:00:00`);
    const graceLimit = new Date(workStart.getTime() + 10 * 60000); // 11:10 AM

    if (results.length === 0) {
      // Time-in
      const status = currentTime > graceLimit ? 'Late' : 'On time';
      const insertQuery = `
        INSERT INTO emp_attendance_1_1 (emp_id, time_in, date, entry_status)
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
      let timeOutStatus = 'On time';
      if (currentTime < workEnd) {
        timeOutStatus = 'Left early';
      } else if (currentTime > workEnd) {
        timeOutStatus = 'Overtime';
      }

      const updateQuery = `
        UPDATE emp_attendance_1_1
        SET time_out = ?, time_out_status = ?
        WHERE emp_id = ? AND date = ?
      `;
      db.query(updateQuery, [time, timeOutStatus, emp_id, date], (err) => {
        if (err) {
          console.error("Update Time-out error:", err);
          return res.status(500).json({ message: 'Failed to time out.' });
        }
        return res.status(200).json({ message: `Time-out recorded (${timeOutStatus}).` });
      });

    } else {
      // Already has time-out
      return res.status(409).json({ message: 'You have already timed in and out today.' });
    }
  });
});

//Fetch EndDate
app.get('/end-date', async (req, res) => {
  const query = 'SELECT l_name, f_name, m_name, emp_dateend FROM emp_info WHERE emp_dateend IS NOT NULL';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching end date:', err);
      return res.status(500).json({ error: 'Failed to fetch end date' });
    }
    res.json(results);
  });
});


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
app.get('/employee-loans/:emp_id', async (req, res) => {
  const empId = req.params.emp_id;

  try {
    const [govLoans] = await dbNew.query(`
      SELECT 
        emp_id,
        government_name,
        loan_type_name,
        loan_amount,
        loan_monthly_payment,
        payment_terms,
        loan_interest_per_month,
        penalty,
        penalty_option,
        total_loan,
        total_payments_previous_employer,
        beginning_balance,
        status
      FROM emp_goverment_loans
      WHERE emp_id = ?
    `, [empId]);

    const [comLoans] = await dbNew.query(`
      SELECT 
        emp_id,
        loan_name,
        loan_type,
        loan_amount,
        loan_monthly_payment,
        payment_terms,
        loan_interest_per_month,
        penalty,
        penalty_option,
        total_loan,
        total_payments_previous_employer,
        beginning_balance,
        status
      FROM emp_company_loans
      WHERE emp_id = ?
    `, [empId]);

    res.json({
      governmentLoans: govLoans,
      companyLoans: comLoans
    });
  } catch (err) {
    console.error("❌ Error fetching loans:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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

app.get("/CheckDuplicateGovernmentLoan", (req, res) => {
  const { emp_id, government_id, loan_type_id } = req.query;

  const query = `
    SELECT * FROM emp_goverment_loans 
    WHERE emp_id = ? 
      AND government_id = ? 
      AND loan_type_id = ? 
      AND status = 'Active'
  `;

  db.query(query, [emp_id, government_id, loan_type_id], (err, results) => {
    if (err) {
      console.error("Error checking for duplicate loan:", err);
      return res.status(500).send({ message: "Server error during duplicate check." });
    }

    // Only return true if ALL match (including status = Active)
    res.status(200).send({ exists: results.length > 0 });
  });
});

app.post("/AddGovernmentLoans", async (req, res) => {
  try {
    const loan = req.body; // A single loan object (not an array)

    if (!loan || !loan.emp_id || !loan.government_name) {
      return res.status(400).send({ message: "Invalid loan data" });
    }

    const query = `
      INSERT INTO emp_goverment_loans 
      (emp_id, government_id, government_name, loan_type_id, loan_type_name, loan_amount, loan_interest_per_month, loan_monthly_payment, penalty, penalty_option, total_loan, total_payments_previous_employer, period_of_deduction, beginning_balance, status, startDate, endDate, payment_terms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      loan.emp_id,
      loan.government_id,
      loan.government_name,
      loan.loan_type_id,
      loan.loan_type_name,
      loan.loan_amount,
      loan.loan_interest,
      loan.loan_monthly_payment,
      loan.penalty,
      loan.penalty_option,
      loan.total_loan,
      loan.total_payments_previous_employer,
      loan.period_of_deduction,
      loan.beginning_balance,
      loan.status,
      loan.startDate,
      loan.endDate,
      loan.payment_terms,
    ];

    await db.query(query, values);

    res.status(200).send({ message: "Government loan saved successfully" });

  } catch (error) {
    console.error("Error saving government loan:", error);
    res.status(500).send({ message: "Failed to save government loan" });
  }
});

app.post('/AddCompanyLoans', (req, res) => {
  const loan = req.body;

  // Validate required fields
  if (
    !loan ||
    !loan.emp_id ||
    !loan.company_loan_name ||
    !loan.company_loan_type
  ) {
    return res.status(400).json({ error: 'Missing required loan data' });
  }

  const {
    emp_id,
    company_loan_name,
    company_loan_type,
    loan_amount,
    loan_monthly_payment,
    payment_terms,
    loan_interest_per_month,
    penalty,
    penalty_option,
    total_loan,
    total_payments_previous_employer,
    period_of_deduction,
    beginning_balance,
    status,
    startDate,
    endDate,
  } = loan;

  const query = `
    INSERT INTO emp_company_loans (
      emp_id,
      loan_name,
      loan_type,
      loan_amount,
      loan_monthly_payment,
      payment_terms,
      loan_interest_per_month,
      penalty,
      penalty_option,
      total_loan,
      total_payments_previous_employer,
      period_of_deduction,
      beginning_balance,
      status,
      startDate, 
      endDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    emp_id,
    company_loan_name,
    company_loan_type,
    loan_amount,
    loan_monthly_payment,
    payment_terms,
    loan_interest_per_month,
    penalty,
    penalty_option,
    total_loan,
    total_payments_previous_employer,
    period_of_deduction,
    beginning_balance,
    status,
    startDate,
    endDate,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting loan data:', err);
      return res.status(500).json({ error: 'Failed to insert loan data' });
    }

    return res.status(200).json({ message: 'Loan data added successfully' });
  });
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
      pp.payrollType,
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

app.get('/ViewPayroll_Part1/:id/:payrollType/:cycle', async (req, res) => {
  const { id, payrollType, cycle } = req.params;
  console.log("Received:", id, payrollType, cycle);
  try {
    const query = `
      SELECT * FROM emp_payroll_part_1 
      WHERE emp_id = ? AND payrollType = ? AND payrollCycle = ?;
    `;
    db.query(query, [id, payrollType, cycle], (error, results) => {
      if (error) {
        console.error("Error retrieving Payroll Part 1:", error);
        return res.status(500).json({ message: "Database error", error });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "No records found for the given filters." });
      }
      res.status(200).json(results[0]);
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.get('/ViewPayroll_Part2/:id/:payrollType/:cycle', async (req, res) => {
  const { id, payrollType, cycle } = req.params;
  console.log("Received:", id, payrollType, cycle);
  try {
    const query = `
      SELECT * FROM emp_payroll_part_2 
      WHERE emp_id = ? AND payrollType = ? AND payrollCycle = ?;
    `;
    db.query(query, [id, payrollType, cycle], (error, results) => {
      if (error) {
        console.error("Error retrieving Payroll Part 2:", error);
        return res.status(500).json({ message: "Database error", error });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "No records found for the given filters." });
      }
      res.status(200).json(results[0]);
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
  const { startDate, endDate, payrollType, payrollCycle, payrollDate } = req.body;

  const query = `INSERT INTO emp_payroll (startDate, endDate, payrollType, payrollCycle, payroll_date) VALUES (?, ?, ?, ?, ? )`;

  const values = [startDate, endDate, payrollType, payrollCycle, payrollDate];

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

app.post('/payroll-part-1', async (req, res) => {
  const { startDate, endDate, payrollType, payrollCycle } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  // SQL query for inserting payroll summary
  const query = `
      INSERT INTO emp_payroll_part_1 (

        emp_id, full_name, payrollType, payrollCycle, startDate, endDate, emp_rate, hourly_rate, emp_ratetype, emp_pos, 
		  total_late_count, total_late_value, total_absent_count, total_absent_value, total_hours_, total_hours_work, 
		  
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
		  
        total_overtime_hours_rt1_r,  total_overtime_hours_rt2_rd, total_overtime_hours_rt3_sh,  total_overtime_hours_rt4_shrd,  total_overtime_hours_rt5_dsh, 
		  total_overtime_hours_rt6_dshrd, total_overtime_hours_rt7_rh,  total_overtime_hours_rt8_rhrd, total_overtime_hours_rt9_drh,  total_overtime_hours_rt10_drhrd,
	
		  total_regular_hours_value, total_overtime_hours_value, total_nightdiff_hours_value, total_overtime_nightdiff_hours_value
		  
)WITH EmployeeTotals AS (
    SELECT 
        emp_info.emp_id,
        CONCAT(emp_info.f_name, ' ', emp_info.l_name) AS full_name, 
        emp_info.emp_pos,
        emp_info.emp_rate,
        emp_info.emp_ratetype,
        emp_attendance_1.attendance_status,
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
        ROUND(
			    CASE 
			        WHEN spsm.paysett_value = 1 AND emp_ratetype = 'Monthly' THEN emp_rate / 2
			        WHEN spm.paysett_value = 1 AND emp_ratetype = 'Monthly' THEN emp_rate
			        ELSE
			            CASE 
			                WHEN emp_ratetype = 'Monthly' THEN emp_rate - emp_rate 
			                ELSE SUM(LEAST(TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600, 8)) * 
			                     CASE 
			                         WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
			                         WHEN emp_ratetype = 'Hourly' THEN emp_rate
			                         ELSE emp_rate 
			                     END * 
			                     (SELECT regular_shift FROM rate_table WHERE rate_table_id = 1)
			            END
			    END, 
			2) AS total_regular_hours_value_rt1,

		  SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt2_rd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 2), 2) AS total_regular_hours_value_rt2,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 AND spsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt3_sh,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 3 AND spsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8) ) * 
        CASE WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8 * ((SELECT regular_shift FROM rate_table WHERE rate_table_id = 3) - 1) 
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8 * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 3) WHEN emp_ratetype = 'Hourly' THEN emp_rate *  
		 (SELECT regular_shift FROM rate_table WHERE rate_table_id = 3)  ELSE 0 END, 2) AS total_regular_hours_value_rt3,  -- Added closing parenthesis here

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 AND spshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt4_shrd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 4 AND spshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 4), 2) AS total_regular_hours_value_rt4,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 AND spdsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt5_dsh,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 5 AND spdsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8) ) * CASE WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8 * ((SELECT regular_shift FROM rate_table WHERE rate_table_id = 5) - 1) 
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8 * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 5)  WHEN emp_ratetype = 'Hourly' THEN emp_rate *   (SELECT regular_shift FROM rate_table WHERE rate_table_id = 5) ELSE 0  END, 2) AS total_regular_hours_value_rt5,  -- For rate_table_id = 5

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 AND spdshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END)) AS total_reg_hours_rt6_dshrd,
        ROUND(SUM(LEAST(CASE WHEN emp_attendance_1.rate_table_id = 6  AND spdshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 END, 8)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift FROM rate_table WHERE rate_table_id = 6), 2) AS total_regular_hours_value_rt6,
			
-- 7,8,9,10

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

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 AND spsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt3_sh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 3 AND spsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 3), 2) AS total_overtime_hours_value_rt3,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 AND spshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt4_shrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 4 AND spshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 4), 2) AS total_overtime_hours_value_rt4,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 AND spdsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt5_dsh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 5 AND spdsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 5), 2) AS total_overtime_hours_value_rt5,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 AND spdshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt6_dshrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 6 AND spdshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 6), 2) AS total_overtime_hours_value_rt6,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7  AND sprh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt7_rh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 7  AND sprh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 7), 2) AS total_overtime_hours_value_rt7,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8  AND sprhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt8_rhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 8  AND sprhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 8), 2) AS total_overtime_hours_value_rt8,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9  AND spdrhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt9_drh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 9  AND spdrhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift FROM rate_table WHERE rate_table_id = 9), 2) AS total_overtime_hours_value_rt9,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10   AND spdrhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) END)) AS overtime_regular_hours_rt10_drhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 10  AND spdrhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_ot_hours) / 3600 END, 0)) * CASE
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

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 AND spsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt3_sh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 3 AND spsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 3), 2) AS total_nightdiff_hours_value_rt3,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 AND spshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt4_shrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 4 AND spshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 4), 2) AS total_nightdiff_hours_value_rt4,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 AND spdsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt5_dsh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 5 AND spdsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 5), 2) AS total_nightdiff_hours_value_rt5,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 AND spdshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt6_dshrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 6 AND spdshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 6), 2) AS total_nightdiff_hours_value_rt6,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 AND sprh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt7_rh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 7  AND sprh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 7), 2) AS total_nightdiff_hours_value_rt7,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8 AND sprhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt8_rhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 8  AND sprhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 8), 2) AS total_nightdiff_hours_value_rt8,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9  AND spdrh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt9_drh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 9  AND spdrh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT regular_shift_nsd FROM rate_table WHERE rate_table_id = 9), 2) AS total_nightdiff_hours_value_rt9,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10   AND spdrhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) END)) AS total_nightdiff_hours_rt10_drhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 10   AND spdrhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_hours) / 3600 END, 0)) * CASE
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

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 AND spsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt3_sh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 3 AND spsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 3), 2) AS total_overtime_nightdiff_hours_value_rt3,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 AND spshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt4_shrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 4 AND spshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 4), 2) AS total_overtime_nightdiff_hours_value_rt4,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 AND spdsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt5_dsh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 5 AND spdsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 5), 2) AS total_overtime_nightdiff_hours_value_rt5,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 AND spdshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt6_dshrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 6 AND spdshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 6), 2) AS total_overtime_nightdiff_hours_value_rt6,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 AND sprh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt7_rh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 7  AND sprh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 7), 2) AS total_overtime_nightdiff_hours_value_rt7,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8  AND sprhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt8_rhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 8  AND sprhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 8), 2) AS total_overtime_nightdiff_hours_value_rt8,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9  AND spdrh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt9_drh,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 9 AND spdrh.paysett_value = 1  THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 9), 2) AS total_overtime_nightdiff_hours_value_rt9,

        SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10  AND spdrhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) END)) AS overtime_nightdiff_hours_rt10_drhrd,
        ROUND(SUM(GREATEST(CASE WHEN emp_attendance_1.rate_table_id = 10 AND spdrhrd.paysett_value = 1  THEN TIME_TO_SEC(emp_attendance_1.total_night_diff_ot_hours) / 3600 END, 0)) * CASE
            WHEN emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year / 8
            WHEN emp_ratetype = 'Daily' THEN emp_rate / 8
            WHEN emp_ratetype = 'Hourly' THEN emp_rate
            ELSE 0
        END  * (SELECT overtime_shift_nsd FROM rate_table WHERE rate_table_id = 10), 2) AS total_overtime_nightdiff_hours_value_rt10,

    -- TOTAL OVER TIME HOUR
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 1 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt1_r,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 2 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt2_rd,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 3 AND spsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt3_sh,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 4 AND spshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt4_shrd,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 5 AND spdsh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt5_dsh,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 6 AND spdshrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt6_dshrd,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 7 AND sprh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt7_rh,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 8 AND sprhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt8_rhrd,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 9 AND spdrh.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt9_drh,
    SEC_TO_TIME(SUM(CASE WHEN emp_attendance_1.rate_table_id = 10 AND spdrhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_ot_hours) END)) AS total_overtime_hours_rt10_drhrd
 
FROM emp_attendance_1
JOIN settings_payroll spsm ON spsm.paysett_name = 'Semi-Monthly'
JOIN settings_payroll spm ON spm.paysett_name = 'Monthly'

JOIN settings_payroll sprh ON sprh.paysett_name = 'Regular-Holiday'
JOIN settings_payroll sprhrd ON sprhrd.paysett_name = 'Regular-Holiday-on-Restday'
JOIN settings_payroll spdrh ON spdrh.paysett_name = 'Double-Regular-Holiday'
JOIN settings_payroll spdrhrd ON spdrhrd.paysett_name = 'Double-Regular-Holiday-on-Restday'

JOIN settings_payroll spsh ON spsh.paysett_name = 'Special-Holiday'
JOIN settings_payroll spshrd ON spshrd.paysett_name = 'Special-Holiday-on-Restday'
JOIN settings_payroll spdsh ON spdsh.paysett_name = 'Double-Special-Holiday'
JOIN settings_payroll spdshrd ON spdshrd.paysett_name = 'Double-Special-Holiday-on-Restday'

JOIN emp_info ON emp_attendance_1.emp_id = emp_info.emp_id
JOIN rate_table rt ON emp_attendance_1.rate_table_id = rt.rate_table_id
WHERE emp_attendance_1.time_in BETWEEN ? AND ?
GROUP BY emp_info.emp_id, emp_info.emp_pos
),

RegularHoliday AS  (
    SELECT
        emp_info.emp_id,
    emp_info.emp_pos,
    emp_info.emp_ratetype,
    emp_info.emp_rate,
    SEC_TO_TIME(SUM(
        CASE 
            WHEN emp_attendance_1.rate_table_id = 7  AND sprh.paysett_value = 1
            THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) 
        END
    )) AS total_reg_hours_rt7_rh,
    ROUND(
    SUM(
        LEAST(
            CASE 
                WHEN EXISTS (
                    SELECT 1
                    FROM emp_attendance_1 prev_day 
                    WHERE prev_day.emp_id = emp_attendance_1.emp_id
                      AND DATE(prev_day.time_in) < DATE(emp_attendance_1.time_in)  AND sprh.paysett_value = 1
                      AND prev_day.attendance_status = 'Absent'
                      AND NOT EXISTS (
                          SELECT 1
                          FROM emp_attendance_1 skip_days
                          WHERE skip_days.emp_id = emp_attendance_1.emp_id
                            AND DATE(skip_days.time_in) < DATE(emp_attendance_1.time_in)
                            AND DATE(skip_days.time_in) > DATE(prev_day.time_in)
                            AND skip_days.attendance_status NOT IN ('Restday')
                      )
                ) AND emp_attendance_1.attendance_status = 'Absent' AND emp_info.emp_ratetype IN ( 'Hourly' , 'Daily')
                THEN TIME_TO_SEC('00:00:00') / 3600
                
                WHEN EXISTS (
                    SELECT 1
                    FROM emp_attendance_1 prev_day
                    WHERE prev_day.emp_id = emp_attendance_1.emp_id  AND sprh.paysett_value = 1
                      AND DATE(prev_day.time_in) < DATE(emp_attendance_1.time_in)
                      AND prev_day.attendance_status IN ('Present', 'Leave')
                      AND NOT EXISTS (
                          SELECT 1
                          FROM emp_attendance_1 skip_days
                          WHERE skip_days.emp_id = emp_attendance_1.emp_id
                            AND DATE(skip_days.time_in) < DATE(emp_attendance_1.time_in)
                            AND DATE(skip_days.time_in) > DATE(prev_day.time_in)
                            AND skip_days.attendance_status NOT IN ('Restday')
                      )
                ) AND emp_attendance_1.attendance_status = 'Absent' AND emp_info.emp_ratetype IN ( 'Hourly' , 'Daily')
                THEN TIME_TO_SEC('08:00:00') / 3600
                
                WHEN EXISTS (
                    SELECT 1
                    FROM emp_attendance_1 prev_day
                    WHERE prev_day.emp_id = emp_attendance_1.emp_id  AND sprh.paysett_value = 1
                      AND DATE(prev_day.time_in) < DATE(emp_attendance_1.time_in)
                      AND prev_day.attendance_status = 'Absent'
                      AND NOT EXISTS (
                          SELECT 1
                          FROM emp_attendance_1 skip_days
                          WHERE skip_days.emp_id = emp_attendance_1.emp_id
                            AND DATE(skip_days.time_in) < DATE(emp_attendance_1.time_in)
                            AND DATE(skip_days.time_in) > DATE(prev_day.time_in)
                            AND skip_days.attendance_status NOT IN ('Restday')     
                      )
                ) AND emp_attendance_1.attendance_status = 'Absent' AND emp_info.emp_ratetype = 'Monthly'
                THEN TIME_TO_SEC('08:00:00') / -3600
                
                WHEN EXISTS (
                    SELECT 1
                    FROM emp_attendance_1 prev_day
                    WHERE prev_day.emp_id = emp_attendance_1.emp_id  AND sprh.paysett_value = 1
                      AND DATE(prev_day.time_in) < DATE(emp_attendance_1.time_in)
                      AND prev_day.attendance_status IN ('Present', 'Leave')
                      AND NOT EXISTS (
                          SELECT 1
                          FROM emp_attendance_1 skip_days
                          WHERE skip_days.emp_id = emp_attendance_1.emp_id
                            AND DATE(skip_days.time_in) < DATE(emp_attendance_1.time_in)
                            AND DATE(skip_days.time_in) > DATE(prev_day.time_in)
                            AND skip_days.attendance_status NOT IN ('Restday')
                      )
                ) OR emp_attendance_1.attendance_status = 'Present'
                THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600
                
                ELSE TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600
            END, 
            8
        )
    ) * 
    CASE 
        WHEN emp_ratetype = 'Monthly'  AND sprh.paysett_value = 1  THEN 
            emp_rate * 12 / emp_info.emp_days_work_per_year / 8 * 
            (
                (
                    (SELECT regular_shift 
                     FROM rate_table 
                     WHERE rate_table_id = 7) - 1
                ) - 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                    ) AND emp_attendance_1.attendance_status = 'Present'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                    ) AND emp_attendance_1.attendance_status = 'Present'
                    THEN 0
                    
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                          AND emp_attendance_1.attendance_status IN ('Present', 'Leave')
                    ) OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                          AND prev_day_att.attendance_status = 'Present'
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    THEN 1
                    
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                          AND prev_day_att.attendance_status = 'Absent'
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    THEN 0
                    
                    ELSE 2 -- Default if no "Restday" is found in the range
                END
            )
  
            WHEN emp_ratetype = 'Daily'   AND sprh.paysett_value = 1 THEN 
                emp_rate / 8 * 
                (
                    (SELECT regular_shift 
                     FROM rate_table 
                     WHERE rate_table_id = 7) - 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                    ) AND emp_attendance_1.attendance_status = 'Present'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                    ) AND emp_attendance_1.attendance_status = 'Present'
                    THEN 0
                    
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                          AND emp_attendance_1.attendance_status IN ('Present', 'Leave')
                    ) OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                          AND prev_day_att.attendance_status IN ('Present', 'Leave')
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    THEN 1
                    
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                          AND prev_day_att.attendance_status = 'Absent'
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    THEN 2
                    
                    ELSE 0 -- Default if no "Restday" is found in the range
                END
                )
            WHEN emp_ratetype = 'Hourly'   AND sprh.paysett_value = 1 THEN 
                emp_rate * 
                 (
                    (SELECT regular_shift 
                     FROM rate_table 
                     WHERE rate_table_id = 7) - 
               CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                    ) AND emp_attendance_1.attendance_status = 'Present'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          
                    ) AND emp_attendance_1.attendance_status = 'Present'
                    THEN 0
                    
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                          AND emp_attendance_1.attendance_status IN ('Present', 'Leave')
                    ) OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                          AND prev_day_att.attendance_status IN ('Present', 'Leave')
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    THEN 1
                    
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                          AND prev_day_att.attendance_status = 'Absent'
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    THEN 2
                    
                    ELSE 2 -- Default if no "Restday" is found in the range
                END
                )
            ELSE 0  
        END, 
        2
    ) AS total_regular_hours_value_rt7
    
FROM emp_attendance_1
JOIN emp_info 
    ON emp_attendance_1.emp_id = emp_info.emp_id
JOIN rate_table rt 
    ON emp_attendance_1.rate_table_id = rt.rate_table_id
    JOIN settings_payroll sprh ON sprh.paysett_name = 'Regular-Holiday'
WHERE emp_attendance_1.rate_table_id = 7 
GROUP BY emp_info.emp_id

),
RegularHolidayRD AS  (
    SELECT
        emp_info.emp_id,
    emp_info.emp_pos,
    emp_info.emp_ratetype,
    emp_info.emp_rate,
    		  SEC_TO_TIME(SUM( CASE WHEN emp_attendance_1.rate_table_id = 8  AND sprhrd.paysett_value = 1 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours)  END )) AS total_reg_hours_rt8_rhrd,
     ROUND(
    SUM(
        LEAST(
            CASE 
                
                WHEN EXISTS (
                    SELECT 1
                    FROM emp_attendance_1 prev_day
                    WHERE prev_day.emp_id = emp_attendance_1.emp_id  AND sprhrd.paysett_value = 1
                      AND DATE(prev_day.time_in) < DATE(emp_attendance_1.time_in)
                      OR prev_day.attendance_status = 'Absent'
                      OR prev_day.attendance_status = 'Present'
                      OR prev_day.attendance_status = 'Leave'
                      OR prev_day.attendance_status = 'Restday'
                      AND NOT EXISTS (
                          SELECT 1
                          FROM emp_attendance_1 skip_days
                          WHERE skip_days.emp_id = emp_attendance_1.emp_id  AND sprhrd.paysett_value = 1
                            AND DATE(skip_days.time_in) < DATE(emp_attendance_1.time_in)
                            AND DATE(skip_days.time_in) > DATE(prev_day.time_in)
                            AND skip_days.attendance_status NOT IN ('Restday')
                      )
                ) AND emp_attendance_1.attendance_status = 'Restday' 
                THEN 
                
					TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 
                
                
                ELSE  TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 AND emp_attendance_1.rate_table_id = 8
            END, 
            8
        )
    ) * 
        CASE 
            WHEN emp_ratetype = 'Monthly'  AND sprhrd.paysett_value = 1 THEN 
                emp_rate * 12 / emp_info.emp_days_work_per_year / 8 * 
                (
                    (SELECT regular_shift 
                     FROM rate_table 
                     WHERE rate_table_id = 8) - 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att 
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                    ) AND emp_attendance_1.attendance_status = 'Restday'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                    ) AND emp_attendance_1.attendance_status = 'Restday'
                    THEN 0
                    
                    ELSE 2.6 -- Default if no "Restday" is found in the range
                END
                )

           WHEN emp_ratetype = 'Daily'  AND sprhrd.paysett_value = 1 THEN 
                emp_rate / 8 * 
                (
                    (SELECT regular_shift 
                     FROM rate_table 
                     WHERE rate_table_id = 8) - 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                    ) AND emp_attendance_1.attendance_status = 'Restday'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                    ) AND emp_attendance_1.attendance_status = 'Restday'
                    THEN 0
                    
                    ELSE 2.6 -- Default if no "Restday" is found in the range
                END
                )
            WHEN emp_ratetype = 'Hourly'  AND sprhrd.paysett_value = 1 THEN 
                emp_rate * 
                 (
                    (SELECT regular_shift 
                     FROM rate_table 
                     WHERE rate_table_id = 8) - 
                     CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                    ) AND emp_attendance_1.attendance_status = 'Restday'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                    ) AND emp_attendance_1.attendance_status = 'Restday'
                    THEN 0
                    
                    ELSE 2.6 -- Default if no "Restday" is found in the range
                END
                
                )
            ELSE 2.6  
        END, 
        2
    ) AS total_regular_hours_value_rt8
    
    
FROM emp_attendance_1
JOIN emp_info 
    ON emp_attendance_1.emp_id = emp_info.emp_id
JOIN rate_table rt 
    ON emp_attendance_1.rate_table_id = rt.rate_table_id
JOIN settings_payroll sprhrd ON sprhrd.paysett_name = 'Regular-Holiday-on-Restday' 
WHERE emp_attendance_1.rate_table_id = 8  
GROUP BY emp_info.emp_id

),
DoubleRegularHoliday AS  (
    SELECT
        emp_info.emp_id,
    emp_info.emp_pos,
    emp_info.emp_ratetype,
    emp_info.emp_rate,
    SEC_TO_TIME(SUM( CASE WHEN emp_attendance_1.rate_table_id = 8  THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours)  END )) AS total_reg_hours_rt8_rhrd,
    SEC_TO_TIME(SUM(
        CASE 
            WHEN emp_attendance_1.rate_table_id = 9 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END
    )) AS total_reg_hours_rt9_drh,
    ROUND(
    SUM(
        LEAST(
            CASE 
                WHEN EXISTS (
                    SELECT 1
                    FROM emp_attendance_1 prev_day
                    WHERE prev_day.emp_id = emp_attendance_1.emp_id  AND spdrh.paysett_value = 1
                      AND DATE(prev_day.time_in) < DATE(emp_attendance_1.time_in)
                      AND prev_day.attendance_status = 'Absent'
                      AND NOT EXISTS (
                          SELECT 1
                          FROM emp_attendance_1 skip_days
                          WHERE skip_days.emp_id = emp_attendance_1.emp_id
                            AND DATE(skip_days.time_in) < DATE(emp_attendance_1.time_in)
                            AND DATE(skip_days.time_in) > DATE(prev_day.time_in)
                            AND skip_days.attendance_status NOT IN ('Restday')
                      )
                ) AND emp_attendance_1.attendance_status = 'Absent' AND emp_info.emp_ratetype IN ( 'Hourly' , 'Daily')
                THEN TIME_TO_SEC('00:00:00') / 3600
                
                WHEN EXISTS (
                    SELECT 1
                    FROM emp_attendance_1 prev_day
                    WHERE prev_day.emp_id = emp_attendance_1.emp_id AND spdrh.paysett_value = 1
                      AND DATE(prev_day.time_in) < DATE(emp_attendance_1.time_in)
                      AND prev_day.attendance_status IN ('Present', 'Leave')
                      AND NOT EXISTS (
                          SELECT 1
                          FROM emp_attendance_1 skip_days
                          WHERE skip_days.emp_id = emp_attendance_1.emp_id AND spdrh.paysett_value = 1
                            AND DATE(skip_days.time_in) < DATE(emp_attendance_1.time_in)
                            AND DATE(skip_days.time_in) > DATE(prev_day.time_in)
                            AND skip_days.attendance_status NOT IN ('Restday')
                      )
                ) AND emp_attendance_1.attendance_status = 'Absent' AND emp_info.emp_ratetype IN ( 'Hourly' , 'Daily')
                THEN TIME_TO_SEC('08:00:00') / 3600
                
                WHEN EXISTS (
                    SELECT 1
                    FROM emp_attendance_1 prev_day
                    WHERE prev_day.emp_id = emp_attendance_1.emp_id AND spdrh.paysett_value = 1
                      AND DATE(prev_day.time_in) < DATE(emp_attendance_1.time_in)
                      AND prev_day.attendance_status = 'Absent'
                      AND NOT EXISTS (
                          SELECT 1
                          FROM emp_attendance_1 skip_days
                          WHERE skip_days.emp_id = emp_attendance_1.emp_id AND spdrh.paysett_value = 1
                            AND DATE(skip_days.time_in) < DATE(emp_attendance_1.time_in)
                            AND DATE(skip_days.time_in) > DATE(prev_day.time_in)
                            AND skip_days.attendance_status NOT IN ('Restday')     
                      )
                ) AND emp_attendance_1.attendance_status = 'Absent' AND emp_info.emp_ratetype = 'Monthly'
                THEN TIME_TO_SEC('08:00:00') / -3600
                
                WHEN EXISTS (
                    SELECT 1
                    FROM emp_attendance_1 prev_day
                    WHERE prev_day.emp_id = emp_attendance_1.emp_id AND spdrh.paysett_value = 1
                      AND DATE(prev_day.time_in) < DATE(emp_attendance_1.time_in)
                      AND prev_day.attendance_status IN ('Present', 'Leave')
                      AND NOT EXISTS (
                          SELECT 1
                          FROM emp_attendance_1 skip_days
                          WHERE skip_days.emp_id = emp_attendance_1.emp_id AND spdrh.paysett_value = 1
                            AND DATE(skip_days.time_in) < DATE(emp_attendance_1.time_in)
                            AND DATE(skip_days.time_in) > DATE(prev_day.time_in)
                            AND skip_days.attendance_status NOT IN ('Restday')
                      )
                ) OR emp_attendance_1.attendance_status = 'Present'
                THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600
                
                ELSE TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600
            END, 
            8
        )
    ) * 
    CASE 
        WHEN emp_ratetype = 'Monthly'  AND spdrh.paysett_value = 1 THEN 
            emp_rate * 12 / emp_info.emp_days_work_per_year / 8 * 
            (
                (
                    (SELECT regular_shift 
                     FROM rate_table 
                     WHERE rate_table_id = 9) - 1
                ) - 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                    ) AND emp_attendance_1.attendance_status = 'Present'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                    ) AND emp_attendance_1.attendance_status = 'Present'
                    THEN 0
                    
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                          AND emp_attendance_1.attendance_status IN ('Present', 'Leave')
                    ) OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                          AND prev_day_att.attendance_status = 'Present'
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    THEN 1
                    
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                          AND prev_day_att.attendance_status = 'Absent'
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    THEN 0
                    
                    ELSE 2 -- Default if no "Restday" is found in the range
                END
            )
  
            WHEN emp_ratetype = 'Daily'  AND spdrh.paysett_value = 1 THEN 
                emp_rate / 8 * 
                (
                    (SELECT regular_shift 
                     FROM rate_table 
                     WHERE rate_table_id = 9) - 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                    ) AND emp_attendance_1.attendance_status = 'Present'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                    ) AND emp_attendance_1.attendance_status = 'Present'
                    THEN 0
                    
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                          AND emp_attendance_1.attendance_status IN ('Present', 'Leave')
                    ) OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                          AND prev_day_att.attendance_status IN ('Present', 'Leave')
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    THEN 1
                    
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                          AND prev_day_att.attendance_status = 'Absent'
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    THEN 2
                    
                    ELSE 0 -- Default if no "Restday" is found in the range
                END
                )
            WHEN emp_ratetype = 'Hourly' AND spdrh.paysett_value = 1 THEN 
                emp_rate * 
                 (
                    (SELECT regular_shift 
                     FROM rate_table 
                     WHERE rate_table_id = 9) - 
               CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                    ) AND emp_attendance_1.attendance_status = 'Present'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          
                    ) AND emp_attendance_1.attendance_status = 'Present'
                    THEN 0
                    
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                          AND emp_attendance_1.attendance_status IN ('Present', 'Leave')
                    ) OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                          AND prev_day_att.attendance_status IN ('Present', 'Leave')
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    THEN 1
                    
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY)
                          AND prev_day_att.attendance_status = 'Absent'
                    ) AND emp_attendance_1.attendance_status = 'Absent'
                    THEN 2
                    
                    ELSE 2 -- Default if no "Restday" is found in the range
                END
                )
            ELSE 0  
        END, 
        2
    ) AS total_regular_hours_value_rt9 
    
FROM emp_attendance_1
JOIN emp_info 
    ON emp_attendance_1.emp_id = emp_info.emp_id
JOIN rate_table rt 
    ON emp_attendance_1.rate_table_id = rt.rate_table_id
JOIN settings_payroll spdrh ON spdrh.paysett_name = 'Double-Regular-Holiday'
WHERE emp_attendance_1.rate_table_id = 9  
GROUP BY emp_info.emp_id

),
DoubleRegularHolidayRD AS  (
    SELECT
        emp_info.emp_id,
    emp_info.emp_pos,
    emp_info.emp_ratetype,
    emp_info.emp_rate,
    SEC_TO_TIME(SUM(
        CASE 
            WHEN emp_attendance_1.rate_table_id = 10 THEN TIME_TO_SEC(emp_attendance_1.total_regular_hours) END
    )) AS total_reg_hours_rt10_drhrd,
   ROUND(
    SUM(
        LEAST(
            CASE 
                
                WHEN EXISTS (
                    SELECT 1
                    FROM emp_attendance_1 prev_day
                    WHERE prev_day.emp_id = emp_attendance_1.emp_id AND spdrhrd.paysett_value = 1
                      AND DATE(prev_day.time_in) < DATE(emp_attendance_1.time_in)
                      OR prev_day.attendance_status = 'Absent'
                      OR prev_day.attendance_status = 'Present'
                      OR prev_day.attendance_status = 'Leave'
                      OR prev_day.attendance_status = 'Restday'
                      AND NOT EXISTS (
                          SELECT 1
                          FROM emp_attendance_1 skip_days
                          WHERE skip_days.emp_id = emp_attendance_1.emp_id AND spdrhrd.paysett_value = 1
                            AND DATE(skip_days.time_in) < DATE(emp_attendance_1.time_in)
                            AND DATE(skip_days.time_in) > DATE(prev_day.time_in)
                            AND skip_days.attendance_status NOT IN ('Restday')
                      )
                ) AND emp_attendance_1.attendance_status = 'Restday' 
                THEN 
                
					TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 
                
                
                ELSE  TIME_TO_SEC(emp_attendance_1.total_regular_hours) / 3600 AND emp_attendance_1.rate_table_id = 8
            END, 
            8
        )
    ) * 
        CASE 
            WHEN emp_ratetype = 'Monthly' AND spdrhrd.paysett_value = 1 THEN 
                emp_rate * 12 / emp_info.emp_days_work_per_year / 8 * 
                (
                    (SELECT regular_shift 
                     FROM rate_table 
                     WHERE rate_table_id = 10) - 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                    ) AND emp_attendance_1.attendance_status = 'Restday'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                    ) AND emp_attendance_1.attendance_status = 'Restday'
                    THEN 0
                    
                    ELSE 2.6 -- Default if no "Restday" is found in the range
                END
                )

           WHEN emp_ratetype = 'Daily' AND spdrhrd.paysett_value = 1 THEN 
                emp_rate / 8 * 
                (
                    (SELECT regular_shift 
                     FROM rate_table 
                     WHERE rate_table_id = 10) - 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                    ) AND emp_attendance_1.attendance_status = 'Restday'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                    ) AND emp_attendance_1.attendance_status = 'Restday'
                    THEN 0
                    
                    ELSE 2.6 -- Default if no "Restday" is found in the range
                END
                )
            WHEN emp_ratetype = 'Hourly' AND spdrhrd.paysett_value = 1  THEN 
                emp_rate * 
                 (
                    (SELECT regular_shift 
                     FROM rate_table 
                     WHERE rate_table_id = 10) - 
                     CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                          AND DATE(prev_day_att.time_in) = DATE_SUB(DATE(emp_attendance_1.time_in), INTERVAL 1 DAY) 
                    ) AND emp_attendance_1.attendance_status = 'Restday'
                    OR EXISTS (
                        SELECT 1 
                        FROM emp_attendance_1 prev_day_att
                        WHERE prev_day_att.emp_id = emp_attendance_1.emp_id
                    ) AND emp_attendance_1.attendance_status = 'Restday'
                    THEN 0
                    
                    ELSE 2.6 -- Default if no "Restday" is found in the range
                END
                
                )
            ELSE 2.6  
        END, 
        2
    ) AS total_regular_hours_value_rt10
    
    
FROM emp_attendance_1
JOIN emp_info 
    ON emp_attendance_1.emp_id = emp_info.emp_id
JOIN rate_table rt 
    ON emp_attendance_1.rate_table_id = rt.rate_table_id
    JOIN settings_payroll spdrhrd ON spdrhrd.paysett_name = 'Double-Regular-Holiday-on-Restday'
WHERE emp_attendance_1.rate_table_id = 10  
GROUP BY emp_info.emp_id

),
Absent AS (
  
    SELECT 
        emp_info.emp_id,
        -- Count total absences
        SUM(CASE WHEN emp_attendance_1.attendance_status = 'Absent' THEN 1 ELSE 0 END) AS total_absent_count,
        -- Calculate the negative absence value
        ROUND(
            SUM(CASE 
                WHEN emp_attendance_1.attendance_status = 'Absent' AND emp_attendance_1.rate_table_id IN ('1','3','5') THEN 
                   -1  *  CASE 
                        WHEN emp_info.emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year
                        ELSE 0
                    END 
                ELSE 0 
            END),
        2) AS total_absent_value,
		  
		   SUM(CASE WHEN emp_attendance_1.attendance_status = 'Late' THEN 1 ELSE 0 END) AS total_late_count,
		   ROUND(
            SUM(CASE 
                WHEN emp_attendance_1.attendance_status = 'late' AND emp_attendance_1.rate_table_id IN ('1','3','5') THEN 
                   -1  *  CASE 
                        WHEN emp_info.emp_ratetype = 'Monthly' THEN emp_rate * 12 / emp_info.emp_days_work_per_year * (emp_atten_timeallow.percentage_deduction * 100)
								WHEN emp_info.emp_ratetype = 'Daily' THEN emp_rate * (emp_atten_timeallow.percentage_deduction / 100)
								WHEN emp_info.emp_ratetype = 'Hourly' THEN emp_rate * 8 * (emp_atten_timeallow.percentage_deduction / 100)
                        ELSE 0
                    END 
                ELSE 0 	
            END),
        2) AS total_late_value

    FROM emp_attendance_1
    LEFT JOIN emp_atten_timeallow ON emp_atten_timeallow.status =  'Active'
    LEFT JOIN emp_info ON emp_attendance_1.emp_id = emp_info.emp_id
    LEFT JOIN rate_table rt 
    ON emp_attendance_1.rate_table_id = rt.rate_table_id
     WHERE DATE(emp_attendance_1.time_in) BETWEEN ? AND ?
    GROUP BY emp_id
)

SELECT 
    et.emp_id,
    et.full_name,
     ? AS payrollType, 
    ? AS payrollCycle,
    ? AS startDate,
    ? AS endDate,
    et.emp_rate,
    et.hourly_rate,
    et.emp_ratetype,
    et.emp_pos,
    ab.total_late_count,
    ab.total_late_value,
    ab.total_absent_count,
    ab.total_absent_value,
    et.total_hours_,
    et.total_hours_work,
 
    -- REGULAR
    COALESCE(et.total_reg_hours_rt1_r, '00:00:00') AS total_reg_hours_rt1_r,  COALESCE(et.total_regular_hours_value_rt1, 0) AS total_regular_hours_value_rt1,
    COALESCE(et.total_reg_hours_rt2_rd, '00:00:00') AS total_reg_hours_rt2_rd,   COALESCE(et.total_regular_hours_value_rt2, 0) AS total_regular_hours_value_rt2,
    COALESCE(et.total_reg_hours_rt3_sh, '00:00:00') AS total_reg_hours_rt3_sh,  COALESCE(et.total_regular_hours_value_rt3, 0) AS total_regular_hours_value_rt3,
    COALESCE(et.total_reg_hours_rt4_shrd, '00:00:00') AS total_reg_hours_rt4_shrd,  COALESCE(et.total_regular_hours_value_rt4, 0) AS total_regular_hours_value_rt4,
    COALESCE(et.total_reg_hours_rt5_dsh, '00:00:00') AS total_reg_hours_rt5_dsh,  COALESCE(et.total_regular_hours_value_rt5, 0) AS total_regular_hours_value_rt5,
    COALESCE(et.total_reg_hours_rt6_dshrd, '00:00:00') AS total_reg_hours_rt6_dshrd,  COALESCE(et.total_regular_hours_value_rt6, 0) AS total_regular_hours_value_rt6,
	 COALESCE(rh.total_reg_hours_rt7_rh, '00:00:00') AS total_reg_hours_rt7_rh,  COALESCE(rh.total_regular_hours_value_rt7, 0) AS total_regular_hours_value_rt7,
	 COALESCE(rhrd.total_reg_hours_rt8_rhrd, '00:00:00') AS total_reg_hours_rt8_rhrd,  COALESCE(rhrd.total_regular_hours_value_rt8, 0) AS total_regular_hours_value_rt8,
	 COALESCE(drh.total_reg_hours_rt9_drh, '00:00:00') AS total_reg_hours_rt9_drh,   COALESCE(drh.total_regular_hours_value_rt9, 0) AS total_regular_hours_value_rt9,
	 COALESCE(drhrd.total_reg_hours_rt10_drhrd, '00:00:00') AS total_reg_hours_rt10_drhrd,  COALESCE(drhrd.total_regular_hours_value_rt10, 0) AS total_regular_hours_value_rt10,
    
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
    COALESCE(rh.total_regular_hours_value_rt7, 0) +  COALESCE(rhrd.total_regular_hours_value_rt8, 0) + COALESCE(drh.total_regular_hours_value_rt9, 0) +  COALESCE(drhrd.total_regular_hours_value_rt10, 0
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
	 

FROM EmployeeTotals et
LEFT JOIN  RegularHoliday rh
    ON et.emp_id = rh.emp_id 
LEFT JOIN  RegularHolidayRD rhrd
    ON et.emp_id = rhrd.emp_id 
LEFT JOIN  DoubleRegularHoliday drh
    ON et.emp_id = drh.emp_id 
LEFT JOIN  DoubleRegularHolidayRD drhrd
    ON et.emp_id = drhrd.emp_id
LEFT JOIN Absent ab 
	 ON et.emp_id = ab.emp_id
GROUP BY et.emp_id ;

    `;

  db.query(query, [startDate, endDate, startDate, endDate, payrollType, payrollCycle, startDate, endDate], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).send({ message: 'Employee summary data inserted successfully' });
  });
});
app.post('/payroll-part-2-1st', async (req, res) => {
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
    
 	 total_late_value,
 	 total_absent_value,
 	 
  
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
  
 
    total_worked_value,
    total_taxable_income,
    total_gross_income,
    
    Excess_tax,
    percentage_deduction_tax,
	 total_percentage_tax,
	 total_fixed_tax,
	 total_tax,
	 total_value_after_tax,
	 
 
	 total_net_pay
) WITH EmployeeTotals AS (
    SELECT 
        emp_info.emp_id,
        CONCAT(emp_info.f_name, ' ', emp_info.l_name) AS full_name, 
        emp_info.emp_pos,
        emp_info.emp_rate,
        emp_payroll_part_1.total_hours_,
        emp_payroll_part_1.total_hours_work,
		  emp_payroll_part_1.total_late_value,
		  emp_payroll_part_1.total_absent_value,  
		  emp_payroll_part_1.total_regular_hours_value,
		  emp_payroll_part_1.total_overtime_hours_value,
		  emp_payroll_part_1.total_nightdiff_hours_value,
		  emp_payroll_part_1.total_overtime_nightdiff_hours_value ,
		  
		  ROUND(COALESCE(emp_payroll_part_1.total_regular_hours_value_rt1, 0), 2) AS regular_value,
		  
 		  TIME_FORMAT( SEC_TO_TIME( TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt1_r, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt2_rd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt3_sh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt4_shrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt5_dsh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt6_dshrd, '00:00:00')) + 
		  TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt7_rh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt8_rhrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt9_drh, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt10_drhrd, '00:00:00')) ), '%H:%i:%s' ) 
		  AS total_regular_hours, 
		  
		  
		  
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
	WHERE  emp_payroll_part_1.startDate BETWEEN ?  AND ?
	 GROUP BY emp_info.emp_id
),
TotalComputation AS (
    SELECT
        emp_info.emp_id,
        et.total_worked_value AS total_taxable_income,
        et.total_worked_value AS total_gross_income
    FROM emp_info
    LEFT JOIN EmployeeTotals et ON emp_info.emp_id = et.emp_id
    GROUP BY emp_info.emp_id
)
SELECT 
    et.emp_id, et.full_name,
    ? AS payrollType, ? AS payrollCycle, ? AS totalDays, ? AS startDate, ? AS endDate,
    et.emp_rate, et.emp_pos,
    et.total_late_value, et.total_absent_value,
    et.regular_value, et.total_regular_hours, et.total_regular_value,
    et.total_overtime_hours, et.total_overtime_value,
    et.total_nightdiff_hours, et.total_nightdiff_value,
    et.total_overtime_nightdiff_hours, et.total_overtime_nightdiff_value,
    et.total_hours_work,
    et.total_worked_value,
    tc.total_taxable_income, 
	 tc.total_gross_income,

    CASE 
        WHEN tc.total_taxable_income >= b.min_income THEN 
            CASE 
                WHEN tc.total_taxable_income - b.min_income = tc.total_taxable_income THEN 0 
                ELSE tc.total_taxable_income - b.min_income 
            END 
        ELSE 0  
    END AS Excess_tax,

    b.percentage_deduction_tax,

    ROUND(
        CASE 
            WHEN tc.total_taxable_income > b.min_income THEN 
                GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100 
            ELSE 0 
        END, 2
    ) AS total_percentage_tax,

    COALESCE(b.fixed_tax, 0) AS total_fixed_tax,

    COALESCE(
        ROUND(
            CASE  
                WHEN tc.total_taxable_income > b.min_income THEN 
                    GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100 
                ELSE 0 
            END, 2
        ) + COALESCE(b.fixed_tax, 0), 0
    ) AS total_tax,

    ROUND(
        tc.total_taxable_income - (
            COALESCE(b.fixed_tax, 0) +
            CASE 
                WHEN tc.total_taxable_income > b.min_income THEN 
                    GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100 
                ELSE 0 
            END
        ), 2
    ) AS total_value_after_tax,

   ROUND(
  (
    tc.total_taxable_income - (
      COALESCE(b.fixed_tax, 0) +
      CASE 
        WHEN tc.total_taxable_income > b.min_income THEN 
          GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100 
        ELSE 0 
      END
    )
  ) - COALESCE(et.total_late_value, 0)  - COALESCE(et.total_absent_value, 0) * -1
, 2) AS total_net_pay


FROM EmployeeTotals et
LEFT JOIN TotalComputation tc ON et.emp_id = tc.emp_id
LEFT JOIN tax_brackets_semi_monthly b 
    ON tc.total_taxable_income BETWEEN b.min_income AND COALESCE(b.max_income, tc.total_taxable_income)

GROUP BY et.emp_id, et.emp_pos;
`;

  db.query(query, [startDate, endDate, payrollType, payrollCycle, totalDays, startDate, endDate], (err, result) => {
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
    
 	 total_late_value,
 	 total_absent_value,
 	 
    rice_allow,
    clothing_allow,
    laundry_allow,
    medical_allow,

    rice_allow_excess,
    clothing_allow_excess,
    laundry_allow_excess,
	 medical_allow_excess,

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
)WITH EmployeeTotals AS (
    SELECT 
        emp_info.emp_id,
        CONCAT(emp_info.f_name, ' ', emp_info.l_name) AS full_name, 
        emp_info.emp_pos,
        emp_info.emp_rate,
        emp_payroll_part_1.total_hours_,
        emp_payroll_part_1.total_hours_work,
		  emp_payroll_part_1.total_late_value,
		  emp_payroll_part_1.total_absent_value,  
		  emp_payroll_part_1.total_regular_hours_value,
		  emp_payroll_part_1.total_overtime_hours_value,
		  emp_payroll_part_1.total_nightdiff_hours_value,
		  emp_payroll_part_1.total_overtime_nightdiff_hours_value ,
		  
		  ROUND(COALESCE(emp_payroll_part_1.total_regular_hours_value_rt1, 0), 2) AS regular_value,
		  
 		  TIME_FORMAT( SEC_TO_TIME( TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt1_r, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt2_rd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt3_sh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt4_shrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt5_dsh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt6_dshrd, '00:00:00')) + 
		  TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt7_rh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt8_rhrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt9_drh, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt10_drhrd, '00:00:00')) ), '%H:%i:%s' ) 
		  AS total_regular_hours, 
		  
		  
		  
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

		  
		--  ROUND(COALESCE(ed.rice_allow, 0), 2) AS rice_allow_min,
		--  ROUND(COALESCE(ed.clothing_allow, 0), 2) AS clothing_allow_min,
		--  ROUND(COALESCE(ed.laundry_allow, 0), 2) AS laundry_allow_min,
		--  ROUND(COALESCE(ed.medical_allow, 0), 2) AS medical_allow_min,
		--  ROUND(COALESCE(ed.achivement_allow, 0), 2) AS achivement_allow_min,
		--  ROUND(COALESCE(ed.actualmedical_assist, 0), 2) AS actualmedical_assist_min

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

        de.rice_allow + de.clothing_allow + de.laundry_allow + de.medical_allow 
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
        
		  et.total_worked_value + de.total_allow_excess + ben.total_allowance_benefit_m   AS total_taxable_income ,
        et.total_worked_value + ben.total_deminimis_allowance + ben.total_allowance_benefit_m   AS total_gross_income,
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
    et.total_late_value,
    et.total_absent_value,
    
    de.rice_allow,
    de.clothing_allow,
    de.laundry_allow,
    de.medical_allow,
   
    de.rice_allow_excess,
    de.clothing_allow_excess,
    de.laundry_allow_excess,
    de.medical_allow_excess,
 
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
		  COALESCE(et.total_late_value, 0) * -1 - 
		  COALESCE(et.total_absent_value, 0) * -1 -
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
    // Prepare values for emp_loans
const emp_loans_date = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(/ /g, '-');
const emp_date_coverage = `${new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })} to ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}`;

// Insert summary info into emp_loans
const insertLoanMetaQuery = `
  INSERT INTO emp_loans (
    emp_loans_date, emp_date_coverage, emp_loans_payroll_type, emp_loans_payroll_cycle
  )
  VALUES (?, ?, ?, ?)
`;

console.log('Preparing to insert into emp_loans:', emp_loans_date, emp_date_coverage, payrollType, payrollCycle);

db.query(insertLoanMetaQuery, [emp_loans_date, emp_date_coverage, payrollType, payrollCycle], (err2) => {
  if (err2) {
    console.error('Error inserting into emp_loans:', err2);
    return res.status(500).send('Payroll saved, but error saving loan summary');
  }

  console.log('Loan summary metadata inserted successfully');
  return res.status(200).send({ message: 'Employee summary and loan metadata inserted successfully' });
});


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

app.post('/payroll-part-2-1st', async (req, res) => {
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
    
 	 total_late_value,
 	 total_absent_value,
 	 
  
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
  
 
    total_worked_value,
    total_taxable_income,
    total_gross_income,
    
    Excess_tax,
    percentage_deduction_tax,
	 total_percentage_tax,
	 total_fixed_tax,
	 total_tax,
	 total_value_after_tax,
	 
 
	 total_net_pay
) WITH EmployeeTotals AS (
    SELECT 
        emp_info.emp_id,
        CONCAT(emp_info.f_name, ' ', emp_info.l_name) AS full_name, 
        emp_info.emp_pos,
        emp_info.emp_rate,
        emp_payroll_part_1.total_hours_,
        emp_payroll_part_1.total_hours_work,
		  emp_payroll_part_1.total_late_value,
		  emp_payroll_part_1.total_absent_value,  
		  emp_payroll_part_1.total_regular_hours_value,
		  emp_payroll_part_1.total_overtime_hours_value,
		  emp_payroll_part_1.total_nightdiff_hours_value,
		  emp_payroll_part_1.total_overtime_nightdiff_hours_value ,
		  
		  ROUND(COALESCE(emp_payroll_part_1.total_regular_hours_value_rt1, 0), 2) AS regular_value,
		  
 		  TIME_FORMAT( SEC_TO_TIME( TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt1_r, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt2_rd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt3_sh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt4_shrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt5_dsh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt6_dshrd, '00:00:00')) + 
		  TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt7_rh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt8_rhrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt9_drh, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt10_drhrd, '00:00:00')) ), '%H:%i:%s' ) 
		  AS total_regular_hours, 
		  
		  
		  
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
	WHERE  emp_payroll_part_1.startDate BETWEEN ?  AND ?
	 GROUP BY emp_info.emp_id
),
TotalComputation AS (
    SELECT
        emp_info.emp_id,
        et.total_worked_value AS total_taxable_income,
        et.total_worked_value AS total_gross_income
    FROM emp_info
    LEFT JOIN EmployeeTotals et ON emp_info.emp_id = et.emp_id
    GROUP BY emp_info.emp_id
)
SELECT 
    et.emp_id, et.full_name,
    ? AS payrollType, ? AS payrollCycle, ? AS totalDays, ? AS startDate, ? AS endDate,
    et.emp_rate, et.emp_pos,
    et.total_late_value, et.total_absent_value,
    et.regular_value, et.total_regular_hours, et.total_regular_value,
    et.total_overtime_hours, et.total_overtime_value,
    et.total_nightdiff_hours, et.total_nightdiff_value,
    et.total_overtime_nightdiff_hours, et.total_overtime_nightdiff_value,
    et.total_hours_work,
    et.total_worked_value,
    tc.total_taxable_income, 
	 tc.total_gross_income,

    CASE 
        WHEN tc.total_taxable_income >= b.min_income THEN 
            CASE 
                WHEN tc.total_taxable_income - b.min_income = tc.total_taxable_income THEN 0 
                ELSE tc.total_taxable_income - b.min_income 
            END 
        ELSE 0  
    END AS Excess_tax,

    b.percentage_deduction_tax,

    ROUND(
        CASE 
            WHEN tc.total_taxable_income > b.min_income THEN 
                GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100 
            ELSE 0 
        END, 2
    ) AS total_percentage_tax,

    COALESCE(b.fixed_tax, 0) AS total_fixed_tax,

    COALESCE(
        ROUND(
            CASE  
                WHEN tc.total_taxable_income > b.min_income THEN 
                    GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100 
                ELSE 0 
            END, 2
        ) + COALESCE(b.fixed_tax, 0), 0
    ) AS total_tax,

    ROUND(
        tc.total_taxable_income - (
            COALESCE(b.fixed_tax, 0) +
            CASE 
                WHEN tc.total_taxable_income > b.min_income THEN 
                    GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100 
                ELSE 0 
            END
        ), 2
    ) AS total_value_after_tax,

   ROUND(
  (
    tc.total_taxable_income - (
      COALESCE(b.fixed_tax, 0) +
      CASE 
        WHEN tc.total_taxable_income > b.min_income THEN 
          GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100 
        ELSE 0 
      END
    )
  ) - COALESCE(et.total_late_value, 0)  - COALESCE(et.total_absent_value, 0) * -1
, 2) AS total_net_pay


FROM EmployeeTotals et
LEFT JOIN TotalComputation tc ON et.emp_id = tc.emp_id
LEFT JOIN tax_brackets_semi_monthly b 
    ON tc.total_taxable_income BETWEEN b.min_income AND COALESCE(b.max_income, tc.total_taxable_income)

GROUP BY et.emp_id, et.emp_pos;
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
    
 	 total_late_value,
 	 total_absent_value,
 	 
    rice_allow,
    clothing_allow,
    laundry_allow,
    medical_allow,

    rice_allow_excess,
    clothing_allow_excess,
    laundry_allow_excess,
	 medical_allow_excess,

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
)WITH EmployeeTotals AS (
    SELECT 
        emp_info.emp_id,
        CONCAT(emp_info.f_name, ' ', emp_info.l_name) AS full_name, 
        emp_info.emp_pos,
        emp_info.emp_rate,
        emp_payroll_part_1.total_hours_,
        emp_payroll_part_1.total_hours_work,
		  emp_payroll_part_1.total_late_value,
		  emp_payroll_part_1.total_absent_value,  
		  emp_payroll_part_1.total_regular_hours_value,
		  emp_payroll_part_1.total_overtime_hours_value,
		  emp_payroll_part_1.total_nightdiff_hours_value,
		  emp_payroll_part_1.total_overtime_nightdiff_hours_value ,
		  
		  ROUND(COALESCE(emp_payroll_part_1.total_regular_hours_value_rt1, 0), 2) AS regular_value,
		  
 		  TIME_FORMAT( SEC_TO_TIME( TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt1_r, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt2_rd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt3_sh, '00:00:00')) +
        TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt4_shrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt5_dsh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt6_dshrd, '00:00:00')) + 
		  TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt7_rh, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt8_rhrd, '00:00:00')) + TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt9_drh, '00:00:00')) +  TIME_TO_SEC(COALESCE(emp_payroll_part_1.total_reg_hours_rt10_drhrd, '00:00:00')) ), '%H:%i:%s' ) 
		  AS total_regular_hours, 
		  
		  
		  
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

		  
		--  ROUND(COALESCE(ed.rice_allow, 0), 2) AS rice_allow_min,
		--  ROUND(COALESCE(ed.clothing_allow, 0), 2) AS clothing_allow_min,
		--  ROUND(COALESCE(ed.laundry_allow, 0), 2) AS laundry_allow_min,
		--  ROUND(COALESCE(ed.medical_allow, 0), 2) AS medical_allow_min,
		--  ROUND(COALESCE(ed.achivement_allow, 0), 2) AS achivement_allow_min,
		--  ROUND(COALESCE(ed.actualmedical_assist, 0), 2) AS actualmedical_assist_min

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

        de.rice_allow + de.clothing_allow + de.laundry_allow + de.medical_allow 
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
        
		  et.total_worked_value + de.total_allow_excess + ben.total_allowance_benefit_m   AS total_taxable_income ,
        et.total_worked_value + ben.total_deminimis_allowance + ben.total_allowance_benefit_m   AS total_gross_income,
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
    et.total_late_value,
    et.total_absent_value,
    
    de.rice_allow,
    de.clothing_allow,
    de.laundry_allow,
    de.medical_allow,
   
    de.rice_allow_excess,
    de.clothing_allow_excess,
    de.laundry_allow_excess,
    de.medical_allow_excess,
 
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
		  COALESCE(et.total_late_value, 0) * -1 - 
		  COALESCE(et.total_absent_value, 0) * -1 -
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
// INSERT FOR ONE TIME EARNINGS AND DEDUCTIONS

app.post('/onetimeEarnDeduct', (req, res) => {
  const { year, month, payroll_type, cycle_type } = req.body;
  const query = `
    INSERT INTO emp_onetime_earn_deduct (year, month, payroll_type, cycle_type)
    VALUES (?, ?, ?, ?)
  `;
  db.query(query, [year, month, payroll_type, cycle_type], (err, results) => {
    if (err) {
      console.error('Error saving data to database:', err);
      res.status(500).send('Error saving data');
    } else {
      res.status(200).send('Data saved successfully');
    }
  });
});


app.get('/onetimeEarnDeduct', (req, res) => {
  const query = 'SELECT * FROM emp_onetime_earn_deduct';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err); // Log the error to check
      res.status(500).send('Error fetching data from database');
    } else {
      console.log('Data fetched from DB:', results); // Log the result to check if data is fetched
      res.json(results);
    }
  });
});

app.get('/earnings_deductions', (req, res) => {
  const query = 'SELECT emp_onetime_earn_deduct_id, year, month, payroll_type, cycle_type, DATE(create_at) AS create_at FROM emp_onetime_earn_deduct';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err); // Log the error to check
      res.status(500).send('Error fetching data from database');
    } else {
      console.log('Data fetched from DB:', results); // Log the result to check if data is fetched
      res.json(results);
    }
  });
});

app.get('/earnings_deductions/:id', (req, res) => {
  const { id } = req.params; // Retrieve the ID from the request parameters

  const query = `
    SELECT *
    FROM emp_onetime_earn_deduct
    WHERE emp_onetime_earn_deduct_id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching earnings/deductions details:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      res.json(results[0]); // Send the first matching result
    } else {
      res.status(404).json({ error: 'Earnings/Deductions not found' });
    }
  });
});


app.get('/option', (req, res) => {
  const query = `SELECT * FROM  earn_deduct`;
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error fetching earn/deduct' });
    } else {
      res.send(result);
    }
  });
});

app.get('/pay_des', (req, res) => {
  const query = `SELECT * FROM  emp_pay_des`;

  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error fetching name details' });
    } else {
      res.send(result);
    }
  });
});

app.get('/name', (req, res) => {
  const query = `
    SELECT 
      emp_id,
      f_name,
      l_name 
    FROM emp_info
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error fetching name details' });
    } else {
      res.send(result);
    }
  });
});

// Submit earnings and deductions
app.post('/submit_earnings_deductions', (req, res) => {
  const { earningsList } = req.body;

  if (!earningsList || earningsList.length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }

  // SQL query for bulk insert
  const query = `INSERT INTO emp_onetime_earn_deduct_per_emp 
      (emp_onetime_earn_deduct_id, year, month, cycle_type, payroll_type, emp_id, emp_fullname, earning_or_deduction, pay_description, amount, remarks) 
      VALUES ?`;

  // Prepare the values array for multiple inserts
  const values = earningsList.map(entry => [
    entry.pay_earn_deduct_id,
    entry.year,
    entry.month,
    entry.cycle_type,
    entry.payroll_type,
    entry.emp_id,
    entry.emp_fullname,
    entry.earning_or_deduction,
    entry.pay_description,
    entry.amount,
    entry.remarks
  ]);

  // Perform the insert query
  db.query(query, [values], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err.message);
      return res.status(500).send({ message: 'Error inserting earnings/deductions data', error: err.message });
    }

    // Get the auto-incremented IDs for the inserted rows
    const insertIds = [];
    for (let i = 0; i < values.length; i++) {
      insertIds.push(result.insertId + i); // Increment the insertId for each inserted row
    }

    // Send the response back with the inserted IDs
    res.send({
      message: 'Earnings/Deductions data submitted successfully',
      insertIds: insertIds
    });
  });
});


// Get earnings and deductions by ID
app.get('/earnings_deductions_per_emp/:id', (req, res) => {
  const empOnetimeId = req.params.id; // Get the ID from the request URL

  const query = `
    SELECT emp_onetime_earn_deduct_per_emp_id, emp_onetime_earn_deduct_id, emp_id, emp_fullname, earning_or_deduction, pay_description, amount, remarks
    FROM emp_onetime_earn_deduct_per_emp
    WHERE emp_onetime_earn_deduct_id = ?;
  `;

  db.query(query, [empOnetimeId], (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      return res.status(500).send('Error fetching data from database');
    }

    if (results.length === 0) {
      return res.status(404).send('No record found');
    }

    res.json(results); // Return single record
  });
});
// Update earnings and deductions

app.post("/update_earn_deduct/:id", (req, res) => {
  const { amount, remarks } = req.body;
  const empOnetimeId = req.params.id;

  const query = `
      UPDATE emp_onetime_earn_deduct_per_emp
      SET amount = ?, remarks = ?
      WHERE emp_onetime_earn_deduct_per_emp_id = ?;
  `;

  db.query(query, [amount, remarks, empOnetimeId], (err, result) => {
    if (err) {
      console.error("Error updating data:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Updated successfully!" });
  });
});

// delete earnings and deductions

app.delete("/delete_earn_deduct/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM emp_onetime_earn_deduct_per_emp WHERE emp_onetime_earn_deduct_per_emp_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting earnings/deductions record:", err);
      return res.status(500).json({ message: "Error deleting record", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ message: "Deleted successfully!" });
  });
  app.delete("/delete_earnings_deductions", (req, res) => {
    const { selectedItems } = req.body;  // Receive selected IDs as an array

    if (!selectedItems || selectedItems.length === 0) {
      return res.status(400).json({ message: "No items selected for deletion." });
    }

    const sql = `DELETE FROM emp_onetime_earn_deduct_per_emp WHERE emp_onetime_earn_deduct_per_emp_id IN (${selectedItems.map(() => '?').join(',')})`;

    db.query(sql, selectedItems, (err, result) => {
      if (err) {
        console.error("Error deleting selected records:", err);
        return res.status(500).json({ message: "Error deleting selected records", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No records found to delete." });
      }

      res.json({ message: "Selected records deleted successfully!" });
    });
  });

});


// Update payroll settings
app.post("/payroll-settings-toggle", (req, res) => {
  const settings = req.body;
  const queries = Object.entries(settings).map(([key, value]) =>
    db.query("UPDATE settings_payroll SET paysett_value = ? WHERE paysett_name = ?", [value, key])
  );

  Promise.all(queries)
    .then(() => res.json({ message: "Payroll settings updated successfully" }))
    .catch(err => res.status(500).json(err));
});

app.post("/settings_payroll_2", (req, res) => {
  const settings = req.body; // Expects an array of objects like: { paysett2_name, paysett2_startdate, paysett2_enddate, paysett2_value }

  const queries = settings.map(({ paysett2_name, paysett2_startdate, paysett2_enddate, paysett2_value }) =>
    db.query(
      "UPDATE settings_payroll_2 SET paysett2_startdate = ?, paysett2_enddate = ?, paysett2_value = ? WHERE paysett2_name = ?",
      [paysett2_startdate, paysett2_enddate, paysett2_value, paysett2_name]
    )
  );

  Promise.all(queries)
    .then(() => res.json({ message: "Payroll settings updated successfully" }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Error updating payroll settings" });
    });
});

app.get("/settings_payroll_2", (req, res) => {
  // Correct SQL query to select the necessary columns
  db.query("SELECT paysett2_name, paysett2_startdate, paysett2_enddate, paysett2_value FROM settings_payroll_2", (err, results) => {
    if (err) return res.status(500).json(err);

    // Initialize the settings array
    const settings = results.map(row => ({
      paysett2_name: row.paysett2_name,
      paysett2_startdate: row.paysett2_startdate,
      paysett2_enddate: row.paysett2_enddate,
      paysett2_value: row.paysett2_value
    }));

    // Send the populated settings as a response
    res.json({ settings });
  });
});
// Get all payroll toggle settings (used in UI toggle switch)
app.get("/payroll-settings", async (req, res) => {
  try {
    const [rows] = await dbNew.query("SELECT * FROM settings_payroll");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update individual toggle (and logic for exclusive payroll type)
app.put("/payroll-settings/:id", async (req, res) => {
  const { id } = req.params;
  const { paysett_value } = req.body;

  try {
    // Update settings_payroll table
    await dbNew.query("UPDATE settings_payroll SET paysett_value = ? WHERE paysett_id = ?", [paysett_value, id]);

    // Update settings_payroll_2 table
    await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = ? WHERE paysett_id = ?", [paysett_value, id]);

    // Additional logic for specific pay periods
    if (id == 10 && paysett_value == 1) {
      await dbNew.query("UPDATE settings_payroll SET paysett_value = 0 WHERE paysett_id = 11");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 1 WHERE paysett2_name = '1stCycle' ");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 1 WHERE paysett2_name ='2ndCycle'");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 0 WHERE paysett2_name = 'Monthly'");
    } else if (id == 11 && paysett_value == 1) {
      await dbNew.query("UPDATE settings_payroll SET paysett_value = 0 WHERE paysett_id = 10");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 1 WHERE paysett2_name = 'Monthly'");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 0 WHERE paysett2_name = '1stCycle' ");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 0 WHERE paysett2_name ='2ndCycle'");
    }else if (id == 10 && paysett_value == 0 ) {
      await dbNew.query("UPDATE settings_payroll SET paysett_value = 1 WHERE paysett_id = 11");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 1 WHERE paysett2_name = 'Monthly'");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 0 WHERE paysett2_name = '1stCycle' ");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 0 WHERE paysett2_name ='2ndCycle'");
    }else if (id == 11 && paysett_value == 0 ) {
      await dbNew.query("UPDATE settings_payroll SET paysett_value = 1 WHERE paysett_id = 10");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 0 WHERE paysett2_name = 'Monthly'");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 1 WHERE paysett2_name = '1stCycle' ");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 1 WHERE paysett2_name ='2ndCycle'");
    } 

    res.sendStatus(200);  // Success
  } catch (err) {
    console.error("Error updating toggle:", err);
    res.status(500).json({ error: 'Update failed' });  // Internal server error
  }
});


// Get cycle-based settings (used in Payroll Date Settings)
app.get("/payroll-date-settings", (req, res) => {
  db.query("SELECT paysett2_id, paysett2_name, paysett2_startdate, paysett2_enddate, paysett2_value FROM settings_payroll_2", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json({ settings: results });
  });
});

// Update payroll date settings in bulk
app.post("/payroll-date-settings", (req, res) => {
  const settings = req.body;
  const queries = Object.entries(settings).map(([key, value]) =>
    db.query("UPDATE settings_payroll_2 SET paysett_value = ? WHERE paysett_name = ? AND paysett2_date = ?", [value.value, key, value.date])
  );

  Promise.all(queries)
    .then(() => res.json({ message: "Payroll settings updated successfully" }))
    .catch(err => res.status(500).json(err));
});

// Category listing
app.get('/payroll-category', async (req, res) => {
  try {
    const [rows] = await dbNew.query("SELECT * FROM settings_category");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get("/active-payroll-cycles", (req, res) => {
  const query = `
    SELECT 
      sp2.paysett2_id,
      sp2.paysett_id,
      sp.paysett_name,
      sp2.paysett2_name,
      sp2.paysett2_startdate,
      sp2.paysett2_enddate,
      sp2.paysett2_value,

      -- Accurate cycle_start_date
      CASE 
        WHEN DAY(CURRENT_DATE()) < (
            SELECT MIN(CAST(paysett2_startdate AS UNSIGNED))
            FROM settings_payroll_2
            WHERE paysett2_value = 1
          )
        THEN
          CASE 
            WHEN CAST(sp2.paysett2_startdate AS UNSIGNED) > CAST(sp2.paysett2_enddate AS UNSIGNED) THEN
              STR_TO_DATE(
                CONCAT(
                  DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH), '%Y-%m-'),
                  LPAD(sp2.paysett2_startdate, 2, '0')
                ), '%Y-%m-%d')
            ELSE
              STR_TO_DATE(
                CONCAT(
                  DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), '%Y-%m-'),
                  LPAD(sp2.paysett2_startdate, 2, '0')
                ), '%Y-%m-%d')
          END
        ELSE
          CASE 
            WHEN CAST(sp2.paysett2_startdate AS UNSIGNED) > CAST(sp2.paysett2_enddate AS UNSIGNED) THEN
              STR_TO_DATE(
                CONCAT(
                  DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), '%Y-%m-'),
                  LPAD(sp2.paysett2_startdate, 2, '0')
                ), '%Y-%m-%d')
            ELSE
              STR_TO_DATE(
                CONCAT(
                  DATE_FORMAT(CURRENT_DATE(), '%Y-%m-'),
                  LPAD(sp2.paysett2_startdate, 2, '0')
                ), '%Y-%m-%d')
          END
      END AS cycle_start_date,

      -- Accurate cycle_end_date (fixed invalid 31, 30, 29)
      CASE
        WHEN DAY(CURRENT_DATE()) < (
            SELECT MIN(CAST(paysett2_startdate AS UNSIGNED))
            FROM settings_payroll_2
            WHERE paysett2_value = 1
          )
        THEN
          -- Previous month
          STR_TO_DATE(
            CONCAT(
              DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), '%Y-%m-'),
              LPAD(
                LEAST(
                  sp2.paysett2_enddate,
                  DAY(LAST_DAY(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)))
                ), 
                2, 
                '0'
              )
            ), '%Y-%m-%d')
        ELSE
          -- Current month
          STR_TO_DATE(
            CONCAT(
              DATE_FORMAT(CURRENT_DATE(), '%Y-%m-'),
              LPAD(
                LEAST(
                  sp2.paysett2_enddate,
                  DAY(LAST_DAY(CURRENT_DATE()))
                ),
                2,
                '0'
              )
            ), '%Y-%m-%d')
      END AS cycle_end_date

    FROM settings_payroll_2 sp2
    LEFT JOIN settings_payroll sp ON sp2.paysett_id = sp.paysett_id
    WHERE sp2.paysett2_value = 1;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// --- Backend (Node.js + Express) ---
// Add this route to your Express backend

app.get('/emp-loans', (req, res) => {
  const query = `
    SELECT emp_loans_id, emp_loans_date, emp_date_coverage, emp_loans_payroll_type, emp_loans_payroll_cycle
    FROM emp_loans
     
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching emp_loans:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json(result);
  });
});


app.listen(8800, () => {
  console.log("Connected in Backend!");
});
