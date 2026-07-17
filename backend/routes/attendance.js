import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.post('/upload-attendance', (req, res) => {
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


router.get("/attendance-module", (req, res) => {
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
    FROM emp_attendance ea
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

router.post("/save", (req, res) => {
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



router.get("/scan/:rfid", (req, res) => {
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
    employee.image = `${process.env.BACKEND_URL}/images/${employee.image}`; // Ensure it's a complete URL
    return res.json(employee); // Return the first match (assuming unique RFID)
  });
});

// Register RFID for employee

router.post("/register-rfid", (req, res) => {
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

router.get('/dept-attendance', (req, res) => {
  const sql = `
    SELECT
      UPPER(TRIM(ei.emp_dept)) AS emp_dept,
      CAST(SUM(COALESCE(pac.present_count, 0)) AS UNSIGNED) AS present_count,
      CAST(SUM(COALESCE(pac.absent_count, 0)) AS UNSIGNED) AS absent_count
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

router.post('/attendance-scan', (req, res) => {
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
      const totalHours = getHours(record.time_in, timeOutISO);
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
        return res.status(200).json({
          message: `Time-out recorded (${timeOutStatus}).`,
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

//Fetch EndDate

export default router;
