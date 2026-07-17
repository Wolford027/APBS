import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.post("/emp-report", (req, res) => {
  const { date, details, employeeId, employeeName } = req.body;
  const sql = "INSERT INTO emp_report (date, details, emp_id, emp_name) VALUES (?, ?, ?, ?)";
  db.query(sql, [date, details, employeeId, employeeName], (err, data) => {
    if (err) return res.json(err);
    return res.json({ status: 1, message: "Employee Report Created" });
  });
});

//Send Payroll Report

router.post("/payroll-report", (req, res) => {
  const { date, details, employeeId, employeeName } = req.body;
  const sql = "INSERT INTO payroll_report (date, details, emp_id, emp_name) VALUES (?, ?, ?, ?)";
  db.query(sql, [date, details, employeeId, employeeName], (err, data) => {
    if (err) return res.json(err);
    return res.json({ status: 1, message: "Payroll Report Created" });
  });
});

//Fetch Emp Report

router.get("/fetch-payroll-report", (req, res) => {
  const sql = "SELECT * FROM payroll_report";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Fetch Emp Report

router.get("/fetch-emp-report", (req, res) => {
  const sql = "SELECT * FROM emp_report";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Fetch Employee For Report

router.get("/fetch-emp", (req, res) => {
  const sql = "SELECT * FROM emp_info WHERE is_archive = 0";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Fetch Department For Report

router.get("/fetch-department", (req, res) => {
  const sql = "SELECT * FROM emp_department";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Fetch Category Report

router.get("/fetch-category-report", (req, res) => {
  const sql = "SELECT * FROM emp_report_category";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Fetch Report

router.get("/report-data", (req, res) => {
  const sql = "SELECT * FROM emp_report_1";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// GET /report/:id — Used in frontend

router.get("/report/:id", (req, res) => {
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

export default router;
