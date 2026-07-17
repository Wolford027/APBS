import express from 'express';
import { db, dbNew } from '../db.js';

const router = express.Router();

router.get("/payroll-summary", (req, res) => {
  const sql = "SELECT * FROM emp_payroll";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

router.post('/payroll-table', (req, res) => {
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


router.get('/ViewPayroll_Part1/:id/:payrollType/:cycle', async (req, res) => {
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

//Fetch Time for Report

router.get('/ViewPayroll_Part1', async (req, res) => {
  const sql = "SELECT * FROM emp_payroll_part_1";
  db.query(sql, (err, results) => {
    if (err) return res.json(err);
    return res.json(results);
  });
});


router.get('/ViewPayroll_Part2/:id/:payrollType/:cycle', async (req, res) => {
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



router.get('/emp-info/:id', async (req, res) => {
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

router.post('/ViewPayrollPart1', async (req, res) => {
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

router.post('/payroll', (req, res) => {
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


router.post('/payroll-part-1', async (req, res) => {
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
/*app.post('/payroll-part-2-1st', async (req, res) => {
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
});*/
/*app.post('/payroll-part-2-1st', async (req, res) => {
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
*/


router.post('/payroll-part-2-1st', async (req, res) => {
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
)
WITH EmployeeTotals AS (
    SELECT 
        emp_info.emp_id,
        CONCAT(emp_info.f_name, ' ', emp_info.l_name) AS full_name, 
        emp_info.emp_pos,
        emp_info.emp_rate,
        emp_payroll_part_1.payrollCycle,
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
        ei.emp_id,
        
        -- Monthly Allowances (apply only if settings_payroll enables it for this cycle)
        CASE 
            WHEN eabdm.allowance_type = 'Monthly' 
                 AND eabdm.status = 'Active'
                 AND sppdm.paysett_value = '0'
                 AND sppdm.paysett_name = ep1.payrollCycle
            THEN ROUND(COALESCE(eabdm.rice_allow, 0), 2) 
            ELSE 0.00 
        END AS rice_allow,
        
        CASE 
            WHEN eabdm.allowance_type = 'Monthly' 
                 AND eabdm.status = 'Active'
                 AND sppdm.paysett_value = '0'
                 AND sppdm.paysett_name = ep1.payrollCycle
            THEN ROUND(COALESCE(eabdm.clothing_allow, 0), 2) 
            ELSE 0.00 
        END AS clothing_allow,

        CASE 
            WHEN eabdm.allowance_type = 'Monthly' 
                 AND eabdm.status = 'Active'
                 AND sppdm.paysett_value = '0'
                 AND sppdm.paysett_name = ep1.payrollCycle
            THEN ROUND(COALESCE(eabdm.laundry_allow, 0), 2) 
            ELSE 0.00 
        END AS laundry_allow,

        CASE 
            WHEN eabdm.allowance_type = 'Monthly' 
                 AND eabdm.status = 'Active'
                 AND sppdm.paysett_value = '0'
                 AND sppdm.paysett_name = ep1.payrollCycle
            THEN ROUND(COALESCE(eabdm.medical_allow, 0), 2) 
            ELSE 0.00 
        END AS medical_allow,

        -- Allowance Excess Computations
        GREATEST(
            CASE 
                WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
                     AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                THEN ROUND(COALESCE(eabdm.rice_allow, 0), 2)
                ELSE 0 
            END - ROUND(COALESCE(ed.rice_allow, 0), 2), 0
        ) AS rice_allow_excess,

        GREATEST(
            CASE 
                WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
                     AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                THEN ROUND(COALESCE(eabdm.clothing_allow, 0), 2)
                ELSE 0 
            END - ROUND(COALESCE(ed.clothing_allow, 0), 2), 0
        ) AS clothing_allow_excess,

        GREATEST(
            CASE 
                WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
                     AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                THEN ROUND(COALESCE(eabdm.laundry_allow, 0), 2)
                ELSE 0 
            END - ROUND(COALESCE(ed.laundry_allow, 0), 2), 0
        ) AS laundry_allow_excess,

        GREATEST(
            CASE 
                WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
                     AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                THEN ROUND(COALESCE(eabdm.medical_allow, 0), 2)
                ELSE 0 
            END - ROUND(COALESCE(ed.medical_allow, 0), 2), 0
        ) AS medical_allow_excess,

        -- Total Allowance Excess (Monthly + Annual)
        GREATEST(
            CASE WHEN eabdm.status = 'Active' 
                      AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                 THEN ROUND(COALESCE(eabdm.rice_allow, 0), 2) ELSE 0 
            END - ROUND(COALESCE(ed.rice_allow, 0), 2), 0
        ) +
        GREATEST(
            CASE WHEN eabdm.status = 'Active' 
                      AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                 THEN ROUND(COALESCE(eabdm.clothing_allow, 0), 2) ELSE 0 
            END - ROUND(COALESCE(ed.clothing_allow, 0), 2), 0
        ) +
        GREATEST(
            CASE WHEN eabdm.status = 'Active' 
                      AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                 THEN ROUND(COALESCE(eabdm.laundry_allow, 0), 2) ELSE 0 
            END - ROUND(COALESCE(ed.laundry_allow, 0), 2), 0
        ) +
        GREATEST(
            CASE WHEN eabdm.status = 'Active' 
                      AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                 THEN ROUND(COALESCE(eabdm.medical_allow, 0), 2) ELSE 0 
            END - ROUND(COALESCE(ed.medical_allow, 0), 2), 0
        ) +
        GREATEST(
            CASE WHEN eabda.status = 'Active' THEN ROUND(COALESCE(eabda.achivement_allow, 0), 2) ELSE 0 
            END - ROUND(COALESCE(ed.achivement_allow, 0), 2), 0
        ) +
        GREATEST(
            CASE WHEN eabda.status = 'Active' THEN ROUND(COALESCE(eabda.actualmedical_assist, 0), 2) ELSE 0 
            END - ROUND(COALESCE(ed.actualmedical_assist, 0), 2), 0
        ) AS total_allow_excess

    FROM emp_info ei

    LEFT JOIN emp_payroll_part_1 ep1 ON ei.emp_id = ep1.emp_id
    LEFT JOIN emp_allowance_benefits_deminimis_monthly eabdm ON ei.emp_id = eabdm.emp_id
    LEFT JOIN emp_allowance_benefits_deminimis_annually eabda ON ei.emp_id = eabda.emp_id
    LEFT JOIN emp_deminimis ed ON eabdm.allowance_type = ed.allowance_type
    LEFT JOIN settings_payroll sppdm ON sppdm.paysett_name IN ('1stCycle', '2ndCycle')

    GROUP BY ei.emp_id
), 
Benefits AS (
    SELECT
        emp_info.emp_id,
        ROUND(SUM(
            CASE 
                WHEN emp_allowance_benefits.status = 'Active'  
                     AND emp_allowance_benefits.allowance_type = 'Monthly'  
                     AND et.payrollCycle IN ('2ndCycle', '2nd Cycle') 
                THEN COALESCE(emp_allowance_benefits.allowance_value, 0)
                ELSE 0  
            END  
        ), 2) AS total_allowance_benefit_m,

       
            COALESCE(de.rice_allow, 0) + COALESCE(de.clothing_allow, 0) + COALESCE(de.laundry_allow, 0) + COALESCE(de.medical_allow, 0)
             AS total_deminimis_allowance
        
    FROM emp_info
    
    LEFT JOIN emp_allowance_benefits 
        ON emp_info.emp_id = emp_allowance_benefits.emp_id

    LEFT JOIN Deminimis de
        ON emp_info.emp_id = de.emp_id

    LEFT JOIN EmployeeTotals et
        ON emp_info.emp_id = et.emp_id   

    GROUP BY emp_info.emp_id, et.payrollCycle
),
TotalComputation AS (
    SELECT
        ei.emp_id,
        
        et.total_worked_value + de.total_allow_excess + ben.total_allowance_benefit_m AS total_taxable_income,
        et.total_worked_value + ben.total_deminimis_allowance + ben.total_allowance_benefit_m AS total_gross_income,
        ben.total_deminimis_allowance - de.total_allow_excess AS non_taxable_deminimis,

        CASE 
            WHEN ep.payrollCycle = '1stCycle' THEN 
                et.total_worked_value + de.total_allow_excess + ben.total_allowance_benefit_m + ep.total_taxable_income
            ELSE 0
        END AS total_taxable_month

    FROM emp_info ei

    LEFT JOIN (
        SELECT emp_id, total_taxable_income, payrollCycle
        FROM emp_payroll_part_2
        WHERE payrollCycle = '1stCycle'
        AND (emp_id, payroll_date) IN (
            SELECT emp_id, MAX(payroll_date)
            FROM emp_payroll_part_2
            WHERE payrollCycle = '1stCycle'
            GROUP BY emp_id
        )
    ) ep ON ep.emp_id = ei.emp_id

    LEFT JOIN Deminimis de ON ei.emp_id = de.emp_id
    LEFT JOIN Benefits ben ON ei.emp_id = ben.emp_id  
    LEFT JOIN EmployeeTotals et ON ei.emp_id = et.emp_id   

    GROUP BY ei.emp_id
),
Loans AS (
    SELECT
        emp_info.emp_id,
        
    ROUND(
        CASE 
          WHEN gl.status = 'Active' THEN COALESCE(gl.loan_monthly_payment, 0)
          ELSE 0
        END, 2)
     AS gov_loan_amount,
     
     ROUND(
        CASE 
          WHEN cl.status = 'Active' THEN COALESCE(cl.loan_monthly_payment, 0)
          ELSE 0
        END, 2)
     AS com_loan_amount
         
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
    
	 
    -- Calculate the amount above the minimum income  -- Calculate the amount above the minimum income
  -- Tax Calculations (Controlled by settings_payroll)
   -- Tax Calculations (Controlled by settings_payroll)
   CASE 
    WHEN sptaxpc.paysett_value = '1' THEN 
		        CASE 
		            WHEN tc.total_taxable_income >= b.min_income THEN  
		                CASE 
		                    WHEN tc.total_taxable_income - b.min_income = tc.total_taxable_income THEN 0 
		                    ELSE tc.total_taxable_income - b.min_income
		                END 
		            ELSE 0
		        END 
		
		    WHEN sptax.paysett_value = '1' THEN 
		        CASE 
		            WHEN tc.total_taxable_income >= b2.min_income THEN  
		                CASE 
		                    WHEN tc.total_taxable_income - b2.min_income = tc.total_taxable_income THEN 0 
		                    ELSE tc.total_taxable_income - b2.min_income
		                END 
		            ELSE 0  
		        END 
		
		    ELSE 0
		END AS excess_tax,

    CASE 
        WHEN sptaxpc.paysett_value = '1' 
        THEN b.percentage_deduction_tax 
        WHEN sptax.paysett_value = '1' 
        THEN b2.percentage_deduction_tax 
        ELSE 0 
    END AS percentage_deduction_tax,

    -- Percentage Tax Calculation
   CASE 
	    WHEN sptaxpc.paysett_value = '1' THEN 
	        ROUND(
	            CASE 
	                WHEN tc.total_taxable_income > b.min_income 
	                THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
	                ELSE 0
	            END, 2
	        )
	
	    WHEN sptax.paysett_value = '1' THEN 
	        ROUND(
	            CASE 
	                WHEN tc.total_taxable_income > b2.min_income 
	                THEN GREATEST(tc.total_taxable_income - b2.min_income, 0) * b2.percentage_deduction_tax / 100
	                ELSE 0
	            END, 2
	        )
	
	    ELSE 0 
	END AS total_percentage_tax,


    -- Fixed Tax Calculation
    CASE 
        WHEN sptaxpc.paysett_value = '1' 
        THEN COALESCE(b.fixed_tax, 0) 
        WHEN sptax.paysett_value = '1' 
        THEN COALESCE(b2.fixed_tax, 0) 
        ELSE 0 
    END AS total_fixed_tax,

    -- Total Tax Calculation
    CASE 
        WHEN sptaxpc.paysett_value = '1' 
        THEN COALESCE(
            ROUND(
                CASE  
                    WHEN tc.total_taxable_income > b.min_income 
                    THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
                    ELSE 0 
                END, 2
            ) + COALESCE(b.fixed_tax, 0), 0
        ) 
        WHEN sptax.paysett_value = '1' 
        THEN COALESCE(
            ROUND(
                CASE  
                    WHEN tc.total_taxable_month > b2.min_income 
                    THEN GREATEST(tc.total_taxable_month - b2.min_income, 0) * b2.percentage_deduction_tax / 100
                    ELSE 0 
                END, 2
            ) + COALESCE(b2.fixed_tax, 0), 0
        ) 
        ELSE 0 
    END AS total_tax,

    -- Total Value After Tax Calculation
		CASE 
		    WHEN sptaxpc.paysett_value = '1' THEN ROUND(
		        tc.total_taxable_income - (
		            COALESCE(b.fixed_tax, 0) + 
		            CASE 
		                WHEN tc.total_taxable_income > b.min_income 
		                THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
		                ELSE 0
		            END
		        ), 2
		    )
		
		    WHEN sptax.paysett_value = '1' THEN ROUND(
		        tc.total_taxable_income - (
		            COALESCE(b2.fixed_tax, 0) + 
		            CASE 
		                WHEN tc.total_taxable_month > b2.min_income 
		                THEN GREATEST(tc.total_taxable_month - b2.min_income, 0) * b2.percentage_deduction_tax / 100
		                ELSE 0
		            END
		        ), 2
		    )
		    ELSE 0
		END AS total_value_after_tax,
    
    -- Determine the SSS bracket based on total taxable income
      sss.ee_share   AS employee_sss_share,
   	sss.er_share  AS employer_sss_share,
    	sss.ec AS employment_compensation_share,
    	sss.wisp_ee  AS wisp_employee_share,
      sss.wisp_er   AS wisp_employer_share,

    -- PhilHealth Deductions (Controlled by settings_payroll)
  -- TOTAL PhilHealth Contribution (full value across both employee and employer shares)
CASE 
    WHEN spph.paysett_value = '1' AND et.payrollCycle = '2ndCycle' 
    THEN ROUND(
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth), 2
    )

    WHEN spphpc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle')
    THEN ROUND(
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2
    )

    ELSE 0 
END AS total_philhealth,

-- EMPLOYEE PhilHealth Contribution (half of total)
CASE 
    WHEN spph.paysett_value = '1' AND et.payrollCycle = '2ndCycle'
    THEN ROUND(
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2
    )

    WHEN spphpc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle')
    THEN ROUND(
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 4, 2
    )

    ELSE 0
	END AS employee_philhealth,

		
		-- EMPLOYER PhilHealth Contribution
	CASE 
    WHEN spph.paysett_value = '1' AND et.payrollCycle = '2ndCycle'
    THEN ROUND(
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2
    )

    WHEN spphpc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle')
    THEN ROUND(
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 4, 2
    )

    ELSE 0
	END AS employer_philhealth,


    -- Calculate HDMF contributions
    -- Calculate HDMF contributions
    --- EMPLOYEE HDMF (Pag-IBIG) Contribution
CASE 
    WHEN sphdmf.paysett_value = '1' AND et.payrollCycle = '2ndCycle'
    THEN ROUND(
        CASE 
            WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
                CASE 
                    WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                        COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100
                    ELSE
                        tc.total_gross_income * hb.hdmf_value_er / 100
                END
            ELSE 0
        END, 2
    )

    WHEN sphdmfpc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle')
    THEN ROUND(
        CASE 
            WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
                CASE 
                    WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                        COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100 / 2
                    ELSE
                        tc.total_gross_income * hb.hdmf_value_er / 100 / 2
                END
            ELSE 0
        END, 2
    )

    ELSE 0
END AS employee_hdmf,

-- EMPLOYER HDMF Contribution (same logic)
CASE 
    WHEN sphdmf.paysett_value = '1' AND et.payrollCycle = '2ndCycle'
    THEN ROUND(
        CASE 
            WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
                CASE 
                    WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                        COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100
                    ELSE
                        tc.total_gross_income * hb.hdmf_value_er / 100
                END
            ELSE 0
        END, 2
    )

    WHEN sphdmfpc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle')
    THEN ROUND(
        CASE 
            WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
                CASE 
                    WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                        COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100 / 2
                    ELSE
                        tc.total_gross_income * hb.hdmf_value_er / 100 / 2
                END
            ELSE 0
        END, 2
    )

    ELSE 0
END AS employer_hdmf,


  -- TOTAL CONTRIBUTION DEDUCTION
COALESCE(
  CASE 
    WHEN spsss.paysett_value = '1' AND et.payrollCycle = '2ndCycle' THEN sss.ee_share
    WHEN spssspc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle') THEN sss.ee_share / 2
    ELSE 0
  END, 0
) + 

COALESCE(
  CASE 
    WHEN spsss.paysett_value = '1' AND et.payrollCycle = '2ndCycle' THEN sss.wisp_ee
    WHEN spssspc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle') THEN sss.wisp_ee / 2
    ELSE 0
  END, 0
) +

ROUND(
  COALESCE(
    CASE 
      WHEN spph.paysett_value = '1' AND et.payrollCycle = '2ndCycle' THEN 
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2
      WHEN spphpc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle') THEN 
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 4
      ELSE 0
    END, 0
  ), 2
) +

ROUND(
  COALESCE(
    CASE 
      WHEN sphdmf.paysett_value = '1' AND et.payrollCycle = '2ndCycle' THEN 
        CASE 
          WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
            LEAST(COALESCE(hb.limit, tc.total_gross_income), tc.total_gross_income) * hb.hdmf_value_er / 100
          ELSE 0
        END

      WHEN sphdmfpc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle') THEN 
        CASE 
          WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
            LEAST(COALESCE(hb.limit, tc.total_gross_income), tc.total_gross_income) * hb.hdmf_value_er / 100 / 2
          ELSE 0
        END

      ELSE 0
    END, 0
  ), 2
) AS total_contribution_deduction,

-- TOTAL GOV DEDUCTIONS
COALESCE(
  CASE 
    WHEN sptaxpc.paysett_value = '1' THEN 
      ROUND(
        CASE  
          WHEN tc.total_taxable_income > b.min_income THEN 
            GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
          ELSE 0
        END, 2
      ) + COALESCE(b.fixed_tax, 0)

    WHEN sptax.paysett_value = '1' THEN 
      ROUND(
        CASE  
          WHEN tc.total_taxable_month > b2.min_income THEN 
            GREATEST(tc.total_taxable_month - b2.min_income, 0) * b2.percentage_deduction_tax / 100
          ELSE 0
        END, 2
      ) + COALESCE(b2.fixed_tax, 0)

    ELSE 0
  END, 0
) +

-- SSS
COALESCE(
  CASE 
    WHEN spsss.paysett_value = '1' AND et.payrollCycle = '2ndCycle' THEN sss.ee_share
    WHEN spssspc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle') THEN sss.ee_share / 2
    ELSE 0
  END, 0
) + 

COALESCE(
  CASE 
    WHEN spsss.paysett_value = '1' AND et.payrollCycle = '2ndCycle' THEN sss.wisp_ee
    WHEN spssspc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle') THEN sss.wisp_ee / 2
    ELSE 0
  END, 0
) +

-- PhilHealth
ROUND(
  COALESCE(
    CASE 
      WHEN spph.paysett_value = '1' AND et.payrollCycle = '2ndCycle' THEN 
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2
      WHEN spphpc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle') THEN 
        LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 4
      ELSE 0
    END, 0
  ), 2
) +

-- HDMF
ROUND(
  COALESCE(
    CASE 
      WHEN sphdmf.paysett_value = '1' AND et.payrollCycle = '2ndCycle' THEN 
        CASE 
          WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
            LEAST(COALESCE(hb.limit, tc.total_gross_income), tc.total_gross_income) * hb.hdmf_value_er / 100
          ELSE 0
        END

      WHEN sphdmfpc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle') THEN 
        CASE 
          WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
            LEAST(COALESCE(hb.limit, tc.total_gross_income), tc.total_gross_income) * hb.hdmf_value_er / 100 / 2
          ELSE 0
        END

      ELSE 0
    END, 0
  ), 2
) AS total_gov_deduction,

-- LOANS
COALESCE(ls.gov_loan_amount, 0) + COALESCE(ls.com_loan_amount, 0) AS total_loan_amount,

-- NET PAY
ROUND(
  COALESCE(tc.total_gross_income, 0)

  -- Loans
  - COALESCE(ls.gov_loan_amount, 0)
  - COALESCE(ls.com_loan_amount, 0)

  -- Taxes
  - COALESCE(
      CASE 
        WHEN sptaxpc.paysett_value = '1' THEN 
          ROUND(
            CASE 
              WHEN tc.total_taxable_income > b.min_income THEN 
                GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
              ELSE 0
            END, 2
          )
        WHEN sptax.paysett_value = '1' THEN 
          ROUND(
            CASE 
              WHEN tc.total_taxable_income > b2.min_income THEN 
                GREATEST(tc.total_taxable_income - b2.min_income, 0) * b2.percentage_deduction_tax / 100
              ELSE 0
            END, 2
          )
        ELSE 0
      END, 0
    )

  -- Fixed Tax
  - CASE 
      WHEN sptaxpc.paysett_value = '1' THEN COALESCE(b.fixed_tax, 0)
      WHEN sptax.paysett_value = '1' THEN COALESCE(b2.fixed_tax, 0)
      ELSE 0
    END

  -- SSS
  - COALESCE(
      CASE 
        WHEN spsss.paysett_value = '1' AND et.payrollCycle = '2ndCycle' THEN sss.ee_share
        WHEN spssspc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle') THEN sss.ee_share / 2
        ELSE 0
      END, 0
    )
  - COALESCE(
      CASE 
        WHEN spsss.paysett_value = '1' AND et.payrollCycle = '2ndCycle' THEN sss.wisp_ee
        WHEN spssspc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle') THEN sss.wisp_ee / 2
        ELSE 0
      END, 0
    )

  -- PhilHealth
  - ROUND(
      COALESCE(
        CASE 
          WHEN spph.paysett_value = '1' AND et.payrollCycle = '2ndCycle' THEN 
            LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2
          WHEN spphpc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle') THEN 
            LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 4
          ELSE 0
        END, 0
      ), 2
    )

  -- Lates & Absences
  - COALESCE(et.total_late_value, 0)
  - COALESCE(et.total_absent_value, 0)

  -- HDMF
  - ROUND(
      COALESCE(
        CASE 
          WHEN sphdmf.paysett_value = '1' AND et.payrollCycle = '2ndCycle' THEN 
            CASE 
              WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
                LEAST(COALESCE(hb.limit, tc.total_gross_income), tc.total_gross_income) * hb.hdmf_value_er / 100
              ELSE 0
            END

          WHEN sphdmfpc.paysett_value = '1' AND et.payrollCycle IN ('1stCycle', '2ndCycle') THEN 
            CASE 
              WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
                LEAST(COALESCE(hb.limit, tc.total_gross_income), tc.total_gross_income) * hb.hdmf_value_er / 100 / 2
              ELSE 0
            END

          ELSE 0
        END, 0
      ), 2
    )

, 2) AS total_net_pay





FROM EmployeeTotals et

JOIN settings_payroll spsss ON spsss.paysett_name = 'SSS'
JOIN settings_payroll spph ON spph.paysett_name = 'Philhealth'
JOIN settings_payroll sphdmf ON sphdmf.paysett_name = 'HDMF'
JOIN settings_payroll sptax ON sptax.paysett_name = 'Tax'

JOIN settings_payroll spssspc ON spssspc.paysett_name = 'SSS-Per-Cycle'
JOIN settings_payroll spphpc ON spphpc.paysett_name = 'Philhealth-Per-Cycle'
JOIN settings_payroll sphdmfpc ON sphdmfpc.paysett_name = 'HDMF-Per-Cycle'
JOIN settings_payroll sptaxpc ON sptaxpc.paysett_name = 'Tax-Per-Cycle'

LEFT JOIN emp_goverment_loans gl
    ON et.emp_id = gl.emp_id
    AND (CURRENT_DATE BETWEEN gl.startDate AND gl.endDate OR CURRENT_DATE = gl.endDate)

LEFT JOIN emp_company_loans cl
    ON et.emp_id = cl.emp_id
    AND (CURRENT_DATE BETWEEN cl.startDate AND cl.endDate OR CURRENT_DATE = cl.endDate)
    
    
LEFT JOIN TotalComputation tc
    ON et.emp_id = tc.emp_id 
LEFT JOIN tax_brackets_semi_monthly b ON 
   	(
        CASE 
            WHEN spssspc.paysett_value = '1'
				THEN tc.total_taxable_income BETWEEN b.min_income AND COALESCE(b.max_income, tc.total_taxable_income)
            ELSE 0
        END
   	 )  
LEFT JOIN tax_brackets_monthly b2 ON 
 		(
        CASE 
            WHEN spsss.paysett_value = '1'
				THEN  tc.total_taxable_month BETWEEN b2.min_income AND COALESCE(b2.max_income, tc.total_taxable_month)
            ELSE 0
        END
   	 )  
LEFT JOIN philhealth_bracket pb ON pb.phb_id = 1 
LEFT JOIN hdmf_bracket hb ON 
    tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income)
LEFT JOIN sss_bracket sss ON 
(
  (
    spsss.paysett_value = '1' 
    AND et.payrollCycle = '2ndCycle' 
    AND tc.total_taxable_month BETWEEN sss.sss_min AND COALESCE(sss.sss_max, tc.total_taxable_month)
  )
  OR 
  (
    spssspc.paysett_value = '1' 
    AND et.payrollCycle IN ('1stCycle', '2ndCycle')
    AND tc.total_gross_income BETWEEN sss.sss_min AND COALESCE(sss.sss_max, tc.total_gross_income)
  )
)

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
    // Step 1: Insert loan metadata
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
        return res.status(500).send('Payroll saved, but error saving loan metadata');
      }

      console.log('Loan summary metadata inserted successfully');

      const insertDeductionsQuery = `
          INSERT INTO emp_loan_summary (
            emp_id,
            loan_ID,
            emp_loans_date,
            payroll_cycle,
            loan_amount,
            penalty,
            penalty_option,
            loan_type_name,
            payment_terms,
            total_loan,
            total_loan_remaining,
            loan_source,
            emp_date_coverage,
            emp_loans_payroll_type
          )
          SELECT 
            emp_id,
            loan_ID,
            ? AS emp_loans_date,
            ? AS payroll_cycle,
            computed_deduction,
            penalty,
            penalty_option,
            loan_type_name,
            payment_terms,
            total_loan,
            (total_loan - computed_deduction) AS total_loan_remaining,
            loan_type,
            ? AS emp_date_coverage,
            ? AS emp_loans_payroll_type
          FROM (
            -- Government Loans
            SELECT
              ei.emp_id,
              gl.emp_goverment_loans_id AS loan_ID,
              gl.loan_type_name,
              gl.loan_monthly_payment,
              gl.penalty,
              gl.penalty_option,
              gl.payment_terms,
              gl.period_of_deduction,
              pp.payrollCycle,
              'Government' AS loan_type,
              ROUND(
                CASE
                  WHEN gl.period_of_deduction IN ('1stCycle', '1st Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle') THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
                      WHEN gl.penalty_option = 'Add in 1st Payment' THEN COALESCE(gl.loan_monthly_payment, 0) + COALESCE(gl.penalty, 0)
                      WHEN gl.penalty_option = 'Add Payment Terms' THEN COALESCE(gl.loan_monthly_payment, 0)
                      ELSE COALESCE(gl.loan_monthly_payment, 0)
                    END
                  WHEN gl.period_of_deduction IN ('2ndCycle', '2nd Cycle') AND pp.payrollCycle IN ('2ndCycle', '2nd Cycle') THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
                      ELSE COALESCE(gl.loan_monthly_payment, 0)
                    END
                  WHEN gl.period_of_deduction IN ('BothCycle', 'Both Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle', '2ndCycle', '2nd Cycle') THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
                      ELSE COALESCE(gl.loan_monthly_payment, 0)
                    END
                  WHEN gl.period_of_deduction = 'Monthly' AND pp.payrollCycle = 'Monthly' THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
                      WHEN gl.penalty_option = 'Add in 1st Payment' THEN COALESCE(gl.loan_monthly_payment, 0) + COALESCE(gl.penalty, 0)
                      ELSE COALESCE(gl.loan_monthly_payment, 0)
                    END
                  WHEN gl.period_of_deduction = 'Double' AND pp.payrollCycle = 'Monthly' THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN (COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))) * 2
                      WHEN gl.penalty_option = 'Add in 1st Payment' THEN (COALESCE(gl.loan_monthly_payment, 0) + COALESCE(gl.penalty, 0)) * 2
                      WHEN gl.penalty_option = 'Add Payment Terms' THEN COALESCE(gl.loan_monthly_payment, 0) * 2
                      ELSE COALESCE(gl.loan_monthly_payment, 0) * 2
                    END
                  ELSE 0
                END, 2
              ) AS computed_deduction,
              (
                COALESCE(gl.loan_monthly_payment, 0) * gl.payment_terms 
                + CASE 
                    WHEN gl.penalty_option = 'Add in 1st Payment' THEN COALESCE(gl.penalty, 0)
                    ELSE 0
                  END
              ) AS total_loan
            FROM emp_info ei
            LEFT JOIN emp_payroll_part_1 pp ON ei.emp_id = pp.emp_id
            INNER JOIN emp_goverment_loans gl ON ei.emp_id = gl.emp_id

            UNION ALL

            -- Company Loans
            SELECT
              ei.emp_id,
              cl.emp_company_loans_id AS loan_ID,
              cl.loan_type AS loan_type_name,
              cl.loan_monthly_payment,
              cl.penalty,
              cl.penalty_option,
              cl.payment_terms,
              cl.period_of_deduction,
              pp.payrollCycle,
              'Company' AS loan_type,
              ROUND(
                CASE
                  WHEN cl.period_of_deduction IN ('1stCycle', '1st Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle') THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
                      WHEN cl.penalty_option = 'Add in 1st Payment' THEN COALESCE(cl.loan_monthly_payment, 0) + COALESCE(cl.penalty, 0)
                      WHEN cl.penalty_option = 'Add Payment Terms' THEN COALESCE(cl.loan_monthly_payment, 0)
                      ELSE COALESCE(cl.loan_monthly_payment, 0)
                    END
                  WHEN cl.period_of_deduction IN ('2ndCycle', '2nd Cycle') AND pp.payrollCycle IN ('2ndCycle', '2nd Cycle') THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
                      ELSE COALESCE(cl.loan_monthly_payment, 0)
                    END
                  WHEN cl.period_of_deduction IN ('BothCycle', 'Both Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle', '2ndCycle', '2nd Cycle') THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
                      ELSE COALESCE(cl.loan_monthly_payment, 0)
                    END
                  WHEN cl.period_of_deduction = 'Monthly' AND pp.payrollCycle = 'Monthly' THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
                      WHEN cl.penalty_option = 'Add in 1st Payment' THEN COALESCE(cl.loan_monthly_payment, 0) + COALESCE(cl.penalty, 0)
                      ELSE COALESCE(cl.loan_monthly_payment, 0)
                    END
                  WHEN cl.period_of_deduction = 'Double' AND pp.payrollCycle = 'Monthly' THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN (COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))) * 2
                      WHEN cl.penalty_option = 'Add in 1st Payment' THEN (COALESCE(cl.loan_monthly_payment, 0) + COALESCE(cl.penalty, 0)) * 2
                      WHEN cl.penalty_option = 'Add Payment Terms' THEN COALESCE(cl.loan_monthly_payment, 0) * 2
                      ELSE COALESCE(cl.loan_monthly_payment, 0) * 2
                    END
                  ELSE 0
                END, 2
              ) AS computed_deduction,
              (
                COALESCE(cl.loan_monthly_payment, 0) * cl.payment_terms 
                + CASE 
                    WHEN cl.penalty_option = 'Add in 1st Payment' THEN COALESCE(cl.penalty, 0)
                    ELSE 0
                  END
              ) AS total_loan
            FROM emp_info ei
            LEFT JOIN emp_payroll_part_1 pp ON ei.emp_id = pp.emp_id
            INNER JOIN emp_company_loans cl ON ei.emp_id = cl.emp_id
          ) AS LoansDetailed;
        `;

      db.query(
        insertDeductionsQuery,
        [emp_loans_date, payrollCycle, emp_date_coverage, payrollType],
        (err3) => {
          if (err3) {
            console.error('Error inserting deductions:', err3);
            return res.status(500).send('Error computing and inserting loan deductions');
          }
          console.log('Loan deductions inserted successfully');
        }
      );


      console.log('Loan deductions inserted');
// Step 3a: Update government loan statuses
      const updateGovStatusQuery = `
        UPDATE emp_goverment_loans gl
        JOIN emp_loan_summary els ON gl.emp_goverment_loans_id = els.loan_ID
        SET gl.status = 'Inactive'
        WHERE els.loan_source = 'Government'
          AND (els.total_loan - els.loan_amount) <= 0
          OR els.payment_terms <= 1;
      `;

      db.query(updateGovStatusQuery, (err4) => {
        if (err4) {
          console.error('Error updating government loan statuses:', err4);
          return res.status(500).send('Loan data saved, but failed to update government loan statuses');
        }

        // Step 3b: Update company loan statuses
        const updateCompanyStatusQuery = `
          UPDATE emp_company_loans cl
          JOIN emp_loan_summary els ON cl.emp_company_loans_id = els.loan_ID
          SET cl.status = 'Inactive'
          WHERE els.loan_source = 'Company'
            AND (els.total_loan - els.loan_amount) <= 0
            OR els.payment_terms <= 1;
        `;

        db.query(updateCompanyStatusQuery, (err5) => {
          if (err5) {
            console.error('Error updating company loan statuses:', err5);
            return res.status(500).send('Loan data saved, but failed to update company loan statuses');
          }

          console.log('Loan statuses updated successfully');
          return res.status(200).send('Loan data and statuses updated');
        });
      });

    });
  });
});

router.post('/payroll-part-2-2nd', async (req, res) => {
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
)
WITH EmployeeTotals AS (
    SELECT 
        emp_info.emp_id,
        CONCAT(emp_info.f_name, ' ', emp_info.l_name) AS full_name, 
        emp_info.emp_pos,
        emp_info.emp_rate,
        emp_payroll_part_1.payrollCycle,
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
        ei.emp_id,
        
        -- Monthly Allowances (apply only if settings_payroll enables it for this cycle)
        CASE 
            WHEN eabdm.allowance_type = 'Monthly' 
                 AND eabdm.status = 'Active'
                 AND sppdm.paysett_value = '0'
                 AND sppdm.paysett_name = ep1.payrollCycle
            THEN ROUND(COALESCE(eabdm.rice_allow, 0), 2) 
            ELSE 0.00 
        END AS rice_allow,
        
        CASE 
            WHEN eabdm.allowance_type = 'Monthly' 
                 AND eabdm.status = 'Active'
                 AND sppdm.paysett_value = '0'
                 AND sppdm.paysett_name = ep1.payrollCycle
            THEN ROUND(COALESCE(eabdm.clothing_allow, 0), 2) 
            ELSE 0.00 
        END AS clothing_allow,

        CASE 
            WHEN eabdm.allowance_type = 'Monthly' 
                 AND eabdm.status = 'Active'
                 AND sppdm.paysett_value = '0'
                 AND sppdm.paysett_name = ep1.payrollCycle
            THEN ROUND(COALESCE(eabdm.laundry_allow, 0), 2) 
            ELSE 0.00 
        END AS laundry_allow,

        CASE 
            WHEN eabdm.allowance_type = 'Monthly' 
                 AND eabdm.status = 'Active'
                 AND sppdm.paysett_value = '0'
                 AND sppdm.paysett_name = ep1.payrollCycle
            THEN ROUND(COALESCE(eabdm.medical_allow, 0), 2) 
            ELSE 0.00 
        END AS medical_allow,

        -- Allowance Excess Computations
        GREATEST(
            CASE 
                WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
                     AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                THEN ROUND(COALESCE(eabdm.rice_allow, 0), 2)
                ELSE 0 
            END - ROUND(COALESCE(ed.rice_allow, 0), 2), 0
        ) AS rice_allow_excess,

        GREATEST(
            CASE 
                WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
                     AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                THEN ROUND(COALESCE(eabdm.clothing_allow, 0), 2)
                ELSE 0 
            END - ROUND(COALESCE(ed.clothing_allow, 0), 2), 0
        ) AS clothing_allow_excess,

        GREATEST(
            CASE 
                WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
                     AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                THEN ROUND(COALESCE(eabdm.laundry_allow, 0), 2)
                ELSE 0 
            END - ROUND(COALESCE(ed.laundry_allow, 0), 2), 0
        ) AS laundry_allow_excess,

        GREATEST(
            CASE 
                WHEN eabdm.allowance_type = 'Monthly' AND eabdm.status = 'Active' 
                     AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                THEN ROUND(COALESCE(eabdm.medical_allow, 0), 2)
                ELSE 0 
            END - ROUND(COALESCE(ed.medical_allow, 0), 2), 0
        ) AS medical_allow_excess,

        -- Total Allowance Excess (Monthly + Annual)
        GREATEST(
            CASE WHEN eabdm.status = 'Active' 
                      AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                 THEN ROUND(COALESCE(eabdm.rice_allow, 0), 2) ELSE 0 
            END - ROUND(COALESCE(ed.rice_allow, 0), 2), 0
        ) +
        GREATEST(
            CASE WHEN eabdm.status = 'Active' 
                      AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                 THEN ROUND(COALESCE(eabdm.clothing_allow, 0), 2) ELSE 0 
            END - ROUND(COALESCE(ed.clothing_allow, 0), 2), 0
        ) +
        GREATEST(
            CASE WHEN eabdm.status = 'Active' 
                      AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                 THEN ROUND(COALESCE(eabdm.laundry_allow, 0), 2) ELSE 0 
            END - ROUND(COALESCE(ed.laundry_allow, 0), 2), 0
        ) +
        GREATEST(
            CASE WHEN eabdm.status = 'Active' 
                      AND sppdm.paysett_value = '0' AND sppdm.paysett_name = ep1.payrollCycle
                 THEN ROUND(COALESCE(eabdm.medical_allow, 0), 2) ELSE 0 
            END - ROUND(COALESCE(ed.medical_allow, 0), 2), 0
        ) +
        GREATEST(
            CASE WHEN eabda.status = 'Active' THEN ROUND(COALESCE(eabda.achivement_allow, 0), 2) ELSE 0 
            END - ROUND(COALESCE(ed.achivement_allow, 0), 2), 0
        ) +
        GREATEST(
            CASE WHEN eabda.status = 'Active' THEN ROUND(COALESCE(eabda.actualmedical_assist, 0), 2) ELSE 0 
            END - ROUND(COALESCE(ed.actualmedical_assist, 0), 2), 0
        ) AS total_allow_excess

    FROM emp_info ei

    LEFT JOIN emp_payroll_part_1 ep1 ON ei.emp_id = ep1.emp_id
    LEFT JOIN emp_allowance_benefits_deminimis_monthly eabdm ON ei.emp_id = eabdm.emp_id
    LEFT JOIN emp_allowance_benefits_deminimis_annually eabda ON ei.emp_id = eabda.emp_id
    LEFT JOIN emp_deminimis ed ON eabdm.allowance_type = ed.allowance_type
    LEFT JOIN settings_payroll sppdm ON sppdm.paysett_name IN ('1stCycle', '2ndCycle')

    GROUP BY ei.emp_id
), 
Benefits AS (
    SELECT
        emp_info.emp_id,
        ROUND(SUM(
            CASE 
                WHEN emp_allowance_benefits.status = 'Active'  
                     AND emp_allowance_benefits.allowance_type = 'Monthly'  
                     AND et.payrollCycle IN ('2ndCycle', '2nd Cycle') 
                THEN COALESCE(emp_allowance_benefits.allowance_value, 0)
                ELSE 0  
            END  
        ), 2) AS total_allowance_benefit_m,

       
            COALESCE(de.rice_allow, 0) + COALESCE(de.clothing_allow, 0) + COALESCE(de.laundry_allow, 0) + COALESCE(de.medical_allow, 0)
             AS total_deminimis_allowance
        
    FROM emp_info
    
    LEFT JOIN emp_allowance_benefits 
        ON emp_info.emp_id = emp_allowance_benefits.emp_id

    LEFT JOIN Deminimis de
        ON emp_info.emp_id = de.emp_id

    LEFT JOIN EmployeeTotals et
        ON emp_info.emp_id = et.emp_id   

    GROUP BY emp_info.emp_id, et.payrollCycle
),
TotalComputation AS (
    SELECT
        ei.emp_id,
        
        et.total_worked_value + de.total_allow_excess + ben.total_allowance_benefit_m AS total_taxable_income,
        et.total_worked_value + ben.total_deminimis_allowance + ben.total_allowance_benefit_m AS total_gross_income,
        ben.total_deminimis_allowance - de.total_allow_excess AS non_taxable_deminimis,

        CASE 
            WHEN ep.payrollCycle = '1stCycle' THEN 
                et.total_worked_value + de.total_allow_excess + ben.total_allowance_benefit_m + ep.total_taxable_income
            ELSE 0
        END AS total_taxable_month

    FROM emp_info ei

    LEFT JOIN (
        SELECT emp_id, total_taxable_income, payrollCycle
        FROM emp_payroll_part_2
        WHERE payrollCycle = '1stCycle'
        AND (emp_id, payroll_date) IN (
            SELECT emp_id, MAX(payroll_date)
            FROM emp_payroll_part_2
            WHERE payrollCycle = '1stCycle'
            GROUP BY emp_id
        )
    ) ep ON ep.emp_id = ei.emp_id

    LEFT JOIN Deminimis de ON ei.emp_id = de.emp_id
    LEFT JOIN Benefits ben ON ei.emp_id = ben.emp_id  
    LEFT JOIN EmployeeTotals et ON ei.emp_id = et.emp_id   

    GROUP BY ei.emp_id
),
Loans AS (
    SELECT
        emp_info.emp_id,
        
    ROUND(
        CASE 
          WHEN gl.status = 'Active' THEN COALESCE(gl.loan_monthly_payment, 0)
          ELSE 0
        END, 2)
     AS gov_loan_amount,
     
     ROUND(
        CASE 
          WHEN cl.status = 'Active' THEN COALESCE(cl.loan_monthly_payment, 0)
          ELSE 0
        END, 2)
     AS com_loan_amount
         
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
    
	 
    -- Calculate the amount above the minimum income  -- Calculate the amount above the minimum income
  -- Tax Calculations (Controlled by settings_payroll)
   -- Tax Calculations (Controlled by settings_payroll)
    CASE 
    WHEN sptaxpc.paysett_value = '1' THEN 
		        CASE 
		            WHEN tc.total_taxable_income >= b.min_income THEN  
		                CASE 
		                    WHEN tc.total_taxable_income - b.min_income = tc.total_taxable_income THEN 0 
		                    ELSE tc.total_taxable_income - b.min_income
		                END 
		            ELSE 0
		        END 
		
		    WHEN sptax.paysett_value = '1' THEN 
		        CASE 
		            WHEN tc.total_taxable_income >= b2.min_income THEN  
		                CASE 
		                    WHEN tc.total_taxable_income - b2.min_income = tc.total_taxable_income THEN 0 
		                    ELSE tc.total_taxable_income - b2.min_income
		                END 
		            ELSE 0  
		        END 
		
		    ELSE 0
		END AS excess_tax,

    CASE 
        WHEN sptaxpc.paysett_value = '1' 
        THEN b.percentage_deduction_tax 
        WHEN sptax.paysett_value = '1' 
        THEN b2.percentage_deduction_tax 
        ELSE 0 
    END AS percentage_deduction_tax,

    -- Percentage Tax Calculation
   CASE 
	    WHEN sptaxpc.paysett_value = '1' THEN 
	        ROUND(
	            CASE 
	                WHEN tc.total_taxable_income > b.min_income 
	                THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
	                ELSE 0
	            END, 2
	        )
	
	    WHEN sptax.paysett_value = '1' THEN 
	        ROUND(
	            CASE 
	                WHEN tc.total_taxable_income > b2.min_income 
	                THEN GREATEST(tc.total_taxable_income - b2.min_income, 0) * b2.percentage_deduction_tax / 100
	                ELSE 0
	            END, 2
	        )
	
	    ELSE 0 
	END AS total_percentage_tax,


    -- Fixed Tax Calculation
    CASE 
        WHEN sptaxpc.paysett_value = '1' 
        THEN COALESCE(b.fixed_tax, 0) 
        WHEN sptax.paysett_value = '1' 
        THEN COALESCE(b2.fixed_tax, 0) 
        ELSE 0 
    END AS total_fixed_tax,

    -- Total Tax Calculation
    CASE 
        WHEN sptaxpc.paysett_value = '1' 
        THEN COALESCE(
            ROUND(
                CASE  
                    WHEN tc.total_taxable_income > b.min_income 
                    THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
                    ELSE 0 
                END, 2
            ) + COALESCE(b.fixed_tax, 0), 0
        ) 
        WHEN sptax.paysett_value = '1' 
        THEN COALESCE(
            ROUND(
                CASE  
                    WHEN tc.total_taxable_month > b2.min_income 
                    THEN GREATEST(tc.total_taxable_month - b2.min_income, 0) * b2.percentage_deduction_tax / 100
                    ELSE 0 
                END, 2
            ) + COALESCE(b2.fixed_tax, 0), 0
        ) 
        ELSE 0 
    END AS total_tax,

    -- Total Value After Tax Calculation
		CASE 
		    WHEN sptaxpc.paysett_value = '1' THEN ROUND(
		        tc.total_taxable_income - (
		            COALESCE(b.fixed_tax, 0) + 
		            CASE 
		                WHEN tc.total_taxable_income > b.min_income 
		                THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
		                ELSE 0
		            END
		        ), 2
		    )
		
		    WHEN sptax.paysett_value = '1' THEN ROUND(
		        tc.total_taxable_income - (
		            COALESCE(b2.fixed_tax, 0) + 
		            CASE 
		                WHEN tc.total_taxable_month > b2.min_income 
		                THEN GREATEST(tc.total_taxable_month - b2.min_income, 0) * b2.percentage_deduction_tax / 100
		                ELSE 0
		            END
		        ), 2
		    )
		    ELSE 0
		END AS total_value_after_tax,
    
    -- Determine the SSS bracket based on total taxable income
      sss.ee_share   AS employee_sss_share,
   	sss.er_share  AS employer_sss_share,
    	sss.ec AS employment_compensation_share,
    	sss.wisp_ee  AS wisp_employee_share,
      sss.wisp_er   AS wisp_employer_share,

    -- PhilHealth Deductions (Controlled by settings_payroll)
   CASE 
        WHEN spph.paysett_value = '1' 
        THEN ROUND(LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth), 2)
        WHEN spphpc.paysett_value = '1' 
        THEN ROUND(LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2 , 2)
        ELSE 0 
    END AS total_philhealth,

		-- EMPLOYEE PhilHealth Contribution
		CASE 
		  WHEN spph.paysett_value = '1' 
		  THEN ROUND(
		      LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2
		  )
		  WHEN spphpc.paysett_value = '1' 
		  THEN ROUND(
		      LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 4, 2
		  )
		  ELSE 0
		  
		END AS employee_philhealth,
		
		-- EMPLOYER PhilHealth Contribution
		CASE 
		  WHEN spph.paysett_value = '1' 
		  THEN ROUND(
		      LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2
		  )
		  WHEN spphpc.paysett_value = '1' 
		  THEN ROUND(
		      LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 4, 2
		  )
		  ELSE 0
		  
		END AS employer_philhealth,


    -- Calculate HDMF contributions
    -- Calculate HDMF contributions
    -- HDMF (Pag-IBIG) Deductions (Controlled by settings_payroll)
      CASE WHEN sphdmfpc.paysett_value = '1' 
	    THEN ROUND(
	        CASE 
	            WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
	                CASE 
	                    WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
	                        COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100 / 2
	                    ELSE
	                        tc.total_gross_income * hb.hdmf_value_er / 100 / 2
	                END
	            ELSE 0
	        END, 2
	    )
	    
	    WHEN sphdmf.paysett_value = '1'
	    THEN ROUND(
	        CASE 
	            WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
	                CASE 
	                    WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
	                        COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100
	                    ELSE
	                        tc.total_gross_income * hb.hdmf_value_er / 100
	                END
	            ELSE 0
	        END, 2
	    )
	
	    ELSE 0
	END AS employee_hdmf,
		
		 CASE WHEN sphdmfpc.paysett_value = '1' 
	    THEN ROUND(
	        CASE 
	            WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
	                CASE 
	                    WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
	                        COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100 / 2
	                    ELSE
	                        tc.total_gross_income * hb.hdmf_value_er / 100 / 2
	                END
	            ELSE 0
	        END, 2
	    )
	    
	    WHEN sphdmf.paysett_value = '1'
	    THEN ROUND(
	        CASE 
	            WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
	                CASE 
	                    WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
	                        COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100
	                    ELSE
	                        tc.total_gross_income * hb.hdmf_value_er / 100
	                END
	            ELSE 0
	        END, 2
	    )
	
	    ELSE 0
	END AS employer_hdmf,

  
			-- Total Contribution Deduction (Conditional on settings_payroll)
COALESCE(sss.ee_share, 0) 
+ COALESCE(sss.wisp_ee, 0)
+ ROUND(
    COALESCE(
        CASE 
            WHEN spph.paysett_value = '1' THEN 
                ROUND(LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2)
            WHEN spphpc.paysett_value = '1' THEN 
                ROUND(LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 4, 2)
            ELSE 0
        END, 
    0), 2
)
+ ROUND(
    COALESCE(
        CASE 
            WHEN sphdmfpc.paysett_value = '1' THEN 
                ROUND(
                    CASE 
                        WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
                            CASE 
                                WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                                    COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100 / 2
                                ELSE
                                    tc.total_gross_income * hb.hdmf_value_er / 100 / 2
                            END
                        ELSE 0
                    END, 
                2)

            WHEN sphdmf.paysett_value = '1' THEN 
                ROUND(
                    CASE 
                        WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
                            CASE 
                                WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                                    COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100
                                ELSE
                                    tc.total_gross_income * hb.hdmf_value_er / 100
                            END
                        ELSE 0
                    END, 
                2)
            ELSE 0
        END,
    0), 2
) AS total_contribution_deduction,


					 -- Total Government Deductions (Only if enabled in settings_payroll)
		    COALESCE(CASE 
	        WHEN sptaxpc.paysett_value = '1' 
	        THEN COALESCE( ROUND(
	                CASE  
	                    WHEN tc.total_taxable_income > b.min_income 
	                    THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
	                    ELSE 0   END, 2 ) + COALESCE(b.fixed_tax, 0), 0 ) 
	        WHEN sptax.paysett_value = '1' 
	        THEN COALESCE(
	            ROUND(
	                CASE  
	                    WHEN tc.total_taxable_month > b2.min_income 
	                    THEN GREATEST(tc.total_taxable_month - b2.min_income, 0) * b2.percentage_deduction_tax / 100
	                    ELSE 0   END, 2 ) + COALESCE(b2.fixed_tax, 0), 0 )  ELSE 0  END, 2 ) +  
			  COALESCE(    sss.ee_share , 0) + COALESCE( sss.wisp_ee , 0 ) + 
		    ROUND(  
			 COALESCE(  CASE 
			  WHEN spph.paysett_value = '1' 
			  THEN ROUND(
			      LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2
			  ) WHEN spphpc.paysett_value = '1' 
			  THEN ROUND( LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 4, 2
			  ) ELSE 0 END, 0  ), 2 ) 
			 + ROUND(
    COALESCE(
        CASE 
            WHEN sphdmfpc.paysett_value = '1' THEN 
                ROUND(
                    CASE 
                        WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
                            CASE 
                                WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                                    COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100 / 2
                                ELSE
                                    tc.total_gross_income * hb.hdmf_value_er / 100 / 2
                            END
                        ELSE 0
                    END, 
                2)

            WHEN sphdmf.paysett_value = '1' THEN 
                ROUND(
                    CASE 
                        WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
                            CASE 
                                WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                                    COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100
                                ELSE
                                    tc.total_gross_income * hb.hdmf_value_er / 100
                            END
                        ELSE 0
                    END, 
                2)
            ELSE 0
        END,
    0), 2
) AS total_gov_deduction,

		COALESCE(ls.gov_loan_amount, 0) + COALESCE(ls.com_loan_amount, 0) AS total_loan_amount,

-- Total Net Pay Calculation
-- Total Net Pay Calculation
ROUND(
  COALESCE(tc.total_gross_income, 0)

  -- Deduct Government Loan
  - COALESCE(ls.gov_loan_amount, 0) + COALESCE(ls.com_loan_amount, 0)  

  -- Deduct Tax (Percentage Based)
  - COALESCE(
      CASE 
        WHEN sptaxpc.paysett_value = '1' THEN 
          ROUND(
            CASE 
              WHEN tc.total_taxable_income > b.min_income THEN 
                GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
              ELSE 0
            END, 2
          )
        WHEN sptax.paysett_value = '1' THEN 
          ROUND(
            CASE 
              WHEN tc.total_taxable_income > b2.min_income THEN 
                GREATEST(tc.total_taxable_income - b2.min_income, 0) * b2.percentage_deduction_tax / 100
              ELSE 0
            END, 2
          )
        ELSE 0
      END, 0
    )

  -- Deduct Tax (Fixed Amount)
  - CASE 
      WHEN sptaxpc.paysett_value = '1' THEN COALESCE(b.fixed_tax, 0)
      WHEN sptax.paysett_value = '1' THEN COALESCE(b2.fixed_tax, 0)
      ELSE 0
    END

  -- Deduct SSS Contributions
  - COALESCE(sss.ee_share, 0)
  - COALESCE(sss.wisp_ee, 0)

  -- Deduct PhilHealth
  - ROUND(
      COALESCE(
        CASE 
          WHEN spph.paysett_value = '1' THEN 
            LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2
          WHEN spphpc.paysett_value = '1' THEN 
            LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 4
          ELSE 0
        END, 0
      ), 2
    )

  -- Deduct Late and Absent
  - COALESCE(et.total_late_value, 0)
  - COALESCE(et.total_absent_value, 0)

  -- Deduct HDMF
  - ROUND(
      COALESCE(
        CASE 
          WHEN sphdmfpc.paysett_value = '1' THEN 
            CASE 
              WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
                CASE 
                  WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                    COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100 / 2
                  ELSE
                    tc.total_gross_income * hb.hdmf_value_er / 100 / 2
                END
              ELSE 0
            END
          WHEN sphdmf.paysett_value = '1' THEN 
            CASE 
              WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
                CASE 
                  WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
                    COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100
                  ELSE
                    tc.total_gross_income * hb.hdmf_value_er / 100
                END
              ELSE 0
            END
          ELSE 0
        END, 0
      ), 2
    )

, 2) AS total_net_pay




FROM EmployeeTotals et

JOIN settings_payroll spsss ON spsss.paysett_name = 'SSS'
JOIN settings_payroll spph ON spph.paysett_name = 'Philhealth'
JOIN settings_payroll sphdmf ON sphdmf.paysett_name = 'HDMF'
JOIN settings_payroll sptax ON sptax.paysett_name = 'Tax'

JOIN settings_payroll spssspc ON spssspc.paysett_name = 'SSS-Per-Cycle'
JOIN settings_payroll spphpc ON spphpc.paysett_name = 'Philhealth-Per-Cycle'
JOIN settings_payroll sphdmfpc ON sphdmfpc.paysett_name = 'HDMF-Per-Cycle'
JOIN settings_payroll sptaxpc ON sptaxpc.paysett_name = 'Tax-Per-Cycle'

LEFT JOIN emp_goverment_loans gl
    ON et.emp_id = gl.emp_id
    AND (CURRENT_DATE BETWEEN gl.startDate AND gl.endDate OR CURRENT_DATE = gl.endDate)

LEFT JOIN emp_company_loans cl
    ON et.emp_id = cl.emp_id
    AND (CURRENT_DATE BETWEEN cl.startDate AND cl.endDate OR CURRENT_DATE = cl.endDate)
    
    
LEFT JOIN TotalComputation tc
    ON et.emp_id = tc.emp_id 
LEFT JOIN tax_brackets_semi_monthly b ON 
   	(
        CASE 
            WHEN spssspc.paysett_value = '1'
				THEN tc.total_taxable_income BETWEEN b.min_income AND COALESCE(b.max_income, tc.total_taxable_income)
            ELSE 0
        END
   	 )  
LEFT JOIN tax_brackets_monthly b2 ON 
 		(
        CASE 
            WHEN spsss.paysett_value = '1'
				THEN  tc.total_taxable_month BETWEEN b2.min_income AND COALESCE(b2.max_income, tc.total_taxable_month)
            ELSE 0
        END
   	 )  
LEFT JOIN philhealth_bracket pb ON pb.phb_id = 1 
LEFT JOIN hdmf_bracket hb ON 
    tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income)
LEFT JOIN sss_bracket sss ON 
    (
        CASE 
            WHEN spssspc.paysett_value = '1'
				THEN tc.total_gross_income BETWEEN sss.sss_min AND COALESCE(sss.sss_max, tc.total_gross_income)
				 WHEN spsss.paysett_value = '1'
				THEN tc.total_taxable_month BETWEEN sss.sss_min AND COALESCE(sss.sss_max, tc.total_taxable_month)
            ELSE 0
        END
    )  
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
    // Step 1: Insert loan metadata
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
        return res.status(500).send('Payroll saved, but error saving loan metadata');
      }

      console.log('Loan summary metadata inserted successfully');

      const insertDeductionsQuery = `
          INSERT INTO emp_loan_summary (
            emp_id,
            loan_ID,
            emp_loans_date,
            payroll_cycle,
            loan_amount,
            penalty,
            penalty_option,
            loan_type_name,
            payment_terms,
            total_loan,
            total_loan_remaining,
            loan_source,
            emp_date_coverage,
            emp_loans_payroll_type
          )
          SELECT 
            emp_id,
            loan_ID,
            ? AS emp_loans_date,
            ? AS payroll_cycle,
            computed_deduction,
            penalty,
            penalty_option,
            loan_type_name,
            payment_terms,
            total_loan,
            (total_loan - computed_deduction) AS total_loan_remaining,
            loan_type,
            ? AS emp_date_coverage,
            ? AS emp_loans_payroll_type
          FROM (
            -- Government Loans
            SELECT
              ei.emp_id,
              gl.emp_goverment_loans_id AS loan_ID,
              gl.loan_type_name,
              gl.loan_monthly_payment,
              gl.penalty,
              gl.penalty_option,
              gl.payment_terms,
              gl.period_of_deduction,
              pp.payrollCycle,
              'Government' AS loan_type,
              ROUND(
                CASE
                  WHEN gl.period_of_deduction IN ('1stCycle', '1st Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle') THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
                      WHEN gl.penalty_option = 'Add in 1st Payment' THEN COALESCE(gl.loan_monthly_payment, 0) + COALESCE(gl.penalty, 0)
                      WHEN gl.penalty_option = 'Add Payment Terms' THEN COALESCE(gl.loan_monthly_payment, 0)
                      ELSE COALESCE(gl.loan_monthly_payment, 0)
                    END
                  WHEN gl.period_of_deduction IN ('2ndCycle', '2nd Cycle') AND pp.payrollCycle IN ('2ndCycle', '2nd Cycle') THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
                      ELSE COALESCE(gl.loan_monthly_payment, 0)
                    END
                  WHEN gl.period_of_deduction IN ('BothCycle', 'Both Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle', '2ndCycle', '2nd Cycle') THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
                      ELSE COALESCE(gl.loan_monthly_payment, 0)
                    END
                  WHEN gl.period_of_deduction = 'Monthly' AND pp.payrollCycle = 'Monthly' THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
                      WHEN gl.penalty_option = 'Add in 1st Payment' THEN COALESCE(gl.loan_monthly_payment, 0) + COALESCE(gl.penalty, 0)
                      ELSE COALESCE(gl.loan_monthly_payment, 0)
                    END
                  WHEN gl.period_of_deduction = 'Double' AND pp.payrollCycle = 'Monthly' THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN (COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))) * 2
                      WHEN gl.penalty_option = 'Add in 1st Payment' THEN (COALESCE(gl.loan_monthly_payment, 0) + COALESCE(gl.penalty, 0)) * 2
                      WHEN gl.penalty_option = 'Add Payment Terms' THEN COALESCE(gl.loan_monthly_payment, 0) * 2
                      ELSE COALESCE(gl.loan_monthly_payment, 0) * 2
                    END
                  ELSE 0
                END, 2
              ) AS computed_deduction,
              (
                COALESCE(gl.loan_monthly_payment, 0) * gl.payment_terms 
                + CASE 
                    WHEN gl.penalty_option = 'Add in 1st Payment' THEN COALESCE(gl.penalty, 0)
                    ELSE 0
                  END
              ) AS total_loan
            FROM emp_info ei
            LEFT JOIN emp_payroll_part_1 pp ON ei.emp_id = pp.emp_id
            INNER JOIN emp_goverment_loans gl ON ei.emp_id = gl.emp_id

            UNION ALL

            -- Company Loans
            SELECT
              ei.emp_id,
              cl.emp_company_loans_id AS loan_ID,
              cl.loan_type AS loan_type_name,
              cl.loan_monthly_payment,
              cl.penalty,
              cl.penalty_option,
              cl.payment_terms,
              cl.period_of_deduction,
              pp.payrollCycle,
              'Company' AS loan_type,
              ROUND(
                CASE
                  WHEN cl.period_of_deduction IN ('1stCycle', '1st Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle') THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
                      WHEN cl.penalty_option = 'Add in 1st Payment' THEN COALESCE(cl.loan_monthly_payment, 0) + COALESCE(cl.penalty, 0)
                      WHEN cl.penalty_option = 'Add Payment Terms' THEN COALESCE(cl.loan_monthly_payment, 0)
                      ELSE COALESCE(cl.loan_monthly_payment, 0)
                    END
                  WHEN cl.period_of_deduction IN ('2ndCycle', '2nd Cycle') AND pp.payrollCycle IN ('2ndCycle', '2nd Cycle') THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
                      ELSE COALESCE(cl.loan_monthly_payment, 0)
                    END
                  WHEN cl.period_of_deduction IN ('BothCycle', 'Both Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle', '2ndCycle', '2nd Cycle') THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
                      ELSE COALESCE(cl.loan_monthly_payment, 0)
                    END
                  WHEN cl.period_of_deduction = 'Monthly' AND pp.payrollCycle = 'Monthly' THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
                      WHEN cl.penalty_option = 'Add in 1st Payment' THEN COALESCE(cl.loan_monthly_payment, 0) + COALESCE(cl.penalty, 0)
                      ELSE COALESCE(cl.loan_monthly_payment, 0)
                    END
                  WHEN cl.period_of_deduction = 'Double' AND pp.payrollCycle = 'Monthly' THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN (COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))) * 2
                      WHEN cl.penalty_option = 'Add in 1st Payment' THEN (COALESCE(cl.loan_monthly_payment, 0) + COALESCE(cl.penalty, 0)) * 2
                      WHEN cl.penalty_option = 'Add Payment Terms' THEN COALESCE(cl.loan_monthly_payment, 0) * 2
                      ELSE COALESCE(cl.loan_monthly_payment, 0) * 2
                    END
                  ELSE 0
                END, 2
              ) AS computed_deduction,
              (
                COALESCE(cl.loan_monthly_payment, 0) * cl.payment_terms 
                + CASE 
                    WHEN cl.penalty_option = 'Add in 1st Payment' THEN COALESCE(cl.penalty, 0)
                    ELSE 0
                  END
              ) AS total_loan
            FROM emp_info ei
            LEFT JOIN emp_payroll_part_1 pp ON ei.emp_id = pp.emp_id
            INNER JOIN emp_company_loans cl ON ei.emp_id = cl.emp_id
          ) AS LoansDetailed;
        `;

      db.query(
        insertDeductionsQuery,
        [emp_loans_date, payrollCycle, emp_date_coverage, payrollType],
        (err3) => {
          if (err3) {
            console.error('Error inserting deductions:', err3);
            return res.status(500).send('Error computing and inserting loan deductions');
          }
          console.log('Loan deductions inserted successfully');
        }
      );


      console.log('Loan deductions inserted');
// Step 3a: Update government loan statuses
      const updateGovStatusQuery = `
        UPDATE emp_goverment_loans gl
        JOIN emp_loan_summary els ON gl.emp_goverment_loans_id = els.loan_ID
        SET gl.status = 'Inactive'
        WHERE els.loan_source = 'Government'
          AND (els.total_loan - els.loan_amount) <= 0
          OR els.payment_terms <= 1;
      `;

      db.query(updateGovStatusQuery, (err4) => {
        if (err4) {
          console.error('Error updating government loan statuses:', err4);
          return res.status(500).send('Loan data saved, but failed to update government loan statuses');
        }

        // Step 3b: Update company loan statuses
        const updateCompanyStatusQuery = `
          UPDATE emp_company_loans cl
          JOIN emp_loan_summary els ON cl.emp_company_loans_id = els.loan_ID
          SET cl.status = 'Inactive'
          WHERE els.loan_source = 'Company'
            AND (els.total_loan - els.loan_amount) <= 0
            OR els.payment_terms <= 1;
        `;

        db.query(updateCompanyStatusQuery, (err5) => {
          if (err5) {
            console.error('Error updating company loan statuses:', err5);
            return res.status(500).send('Loan data saved, but failed to update company loan statuses');
          }

          console.log('Loan statuses updated successfully');
          return res.status(200).send('Loan data and statuses updated');
        });
      });

    });
  });
});
/*

router.post('/payroll-part-2-2nd', async (req, res) => {
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
)
WITH EmployeeTotals AS (
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
        ei.emp_id,
        
        et.total_worked_value + de.total_allow_excess + ben.total_allowance_benefit_m AS total_taxable_income,
        et.total_worked_value + ben.total_deminimis_allowance + ben.total_allowance_benefit_m AS total_gross_income,
        ben.total_deminimis_allowance - de.total_allow_excess AS non_taxable_deminimis,

        CASE 
            WHEN ep.payrollCycle = '1stCycle' THEN 
                et.total_worked_value + de.total_allow_excess + ben.total_allowance_benefit_m + ep.total_taxable_income
            ELSE 0
        END AS total_taxable_month

    FROM emp_info ei

    LEFT JOIN (
        SELECT emp_id, total_taxable_income, payrollCycle
        FROM emp_payroll_part_2
        WHERE payrollCycle = '1stCycle'
        AND (emp_id, payroll_date) IN (
            SELECT emp_id, MAX(payroll_date)
            FROM emp_payroll_part_2
            WHERE payrollCycle = '1stCycle'
            GROUP BY emp_id
        )
    ) ep ON ep.emp_id = ei.emp_id

    LEFT JOIN Deminimis de ON ei.emp_id = de.emp_id
    LEFT JOIN Benefits ben ON ei.emp_id = ben.emp_id  
    LEFT JOIN EmployeeTotals et ON ei.emp_id = et.emp_id   

    GROUP BY ei.emp_id
),
Loans AS (
  SELECT
    emp_info.emp_id,

    -- Government loan total
    SUM(ROUND(
      CASE
        WHEN gl.period_of_deduction IN ('1stCycle', '1st Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle') THEN
          CASE 
            WHEN gl.penalty_option = 'Distributed' THEN 
              COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
            WHEN gl.penalty_option = 'Add in 1st Payment' THEN 
              COALESCE(gl.loan_monthly_payment, 0) + COALESCE(gl.penalty, 0)
            WHEN gl.penalty_option = 'Add Payment Terms' THEN 
              COALESCE(gl.loan_monthly_payment, 0)
            ELSE 
              COALESCE(gl.loan_monthly_payment, 0)
          END
        WHEN gl.period_of_deduction IN ('2ndCycle', '2nd Cycle') AND pp.payrollCycle IN ('2ndCycle', '2nd Cycle') THEN
          CASE 
            WHEN gl.penalty_option = 'Distributed' THEN 
              COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
            ELSE 
              COALESCE(gl.loan_monthly_payment, 0)
          END
        WHEN gl.period_of_deduction IN ('BothCycle', 'Both Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle', '2ndCycle', '2nd Cycle') THEN
          CASE 
            WHEN gl.penalty_option = 'Distributed' THEN 
              COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
            ELSE 
              COALESCE(gl.loan_monthly_payment, 0)
          END
        WHEN gl.period_of_deduction = 'Monthly' AND pp.payrollCycle = 'Monthly' THEN
          CASE 
            WHEN gl.penalty_option = 'Distributed' THEN 
              COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
            WHEN gl.penalty_option = 'Add in 1st Payment' THEN 
              COALESCE(gl.loan_monthly_payment, 0) + COALESCE(gl.penalty, 0)
            ELSE 
              COALESCE(gl.loan_monthly_payment, 0)
          END
        WHEN gl.period_of_deduction = 'Double' AND pp.payrollCycle = 'Monthly' THEN
          CASE 
            WHEN gl.penalty_option = 'Distributed' THEN 
              (COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))) * 2
            WHEN gl.penalty_option = 'Add in 1st Payment' THEN 
              (COALESCE(gl.loan_monthly_payment, 0) + COALESCE(gl.penalty, 0)) * 2
            WHEN gl.penalty_option = 'Add Payment Terms' THEN 
              COALESCE(gl.loan_monthly_payment, 0) * 2
            ELSE 
              COALESCE(gl.loan_monthly_payment, 0) * 2
          END
        ELSE 0
      END, 2)
    ) AS gov_loan_amount,

    -- Company loan total
    SUM(ROUND(
      CASE
        WHEN cl.period_of_deduction IN ('1stCycle', '1st Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle') THEN
          CASE 
            WHEN cl.penalty_option = 'Distributed' THEN 
              COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
            WHEN cl.penalty_option = 'Add in 1st Payment' THEN 
              COALESCE(cl.loan_monthly_payment, 0) + COALESCE(cl.penalty, 0)
            WHEN cl.penalty_option = 'Add Payment Terms' THEN 
              COALESCE(cl.loan_monthly_payment, 0)
            ELSE 
              COALESCE(cl.loan_monthly_payment, 0)
          END
        WHEN cl.period_of_deduction IN ('2ndCycle', '2nd Cycle') AND pp.payrollCycle IN ('2ndCycle', '2nd Cycle') THEN
          CASE 
            WHEN cl.penalty_option = 'Distributed' THEN 
              COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
            ELSE 
              COALESCE(cl.loan_monthly_payment, 0)
          END
        WHEN cl.period_of_deduction IN ('BothCycle', 'Both Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle', '2ndCycle', '2nd Cycle') THEN
          CASE 
            WHEN cl.penalty_option = 'Distributed' THEN 
              COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
            ELSE 
              COALESCE(cl.loan_monthly_payment, 0)
          END
        WHEN cl.period_of_deduction = 'Monthly' AND pp.payrollCycle = 'Monthly' THEN
          CASE 
            WHEN cl.penalty_option = 'Distributed' THEN 
              COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
            WHEN cl.penalty_option = 'Add in 1st Payment' THEN 
              COALESCE(cl.loan_monthly_payment, 0) + COALESCE(cl.penalty, 0)
            ELSE 
              COALESCE(cl.loan_monthly_payment, 0)
          END
        WHEN cl.period_of_deduction = 'Double' AND pp.payrollCycle = 'Monthly' THEN
          CASE 
            WHEN cl.penalty_option = 'Distributed' THEN 
              (COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))) * 2
            WHEN cl.penalty_option = 'Add in 1st Payment' THEN 
              (COALESCE(cl.loan_monthly_payment, 0) + COALESCE(cl.penalty, 0)) * 2
            WHEN cl.penalty_option = 'Add Payment Terms' THEN 
              COALESCE(cl.loan_monthly_payment, 0) * 2
            ELSE 
              COALESCE(cl.loan_monthly_payment, 0) * 2
          END
        ELSE 0
      END, 2)
    ) AS com_loan_amount

  FROM emp_info
  LEFT JOIN emp_payroll_part_1 pp ON emp_info.emp_id = pp.emp_id
  LEFT JOIN emp_goverment_loans gl ON emp_info.emp_id = gl.emp_id
  LEFT JOIN emp_company_loans cl ON emp_info.emp_id = cl.emp_id
  LEFT JOIN Deminimis de ON emp_info.emp_id = de.emp_id
  LEFT JOIN Benefits ben ON emp_info.emp_id = ben.emp_id  
  LEFT JOIN EmployeeTotals et ON emp_info.emp_id = et.emp_id   

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
    
	 
    -- Calculate the amount above the minimum income  -- Calculate the amount above the minimum income
  -- Tax Calculations (Controlled by settings_payroll)
      CASE 
        WHEN sptax.paysett_value = '1' 
        THEN CASE 
            WHEN tc.total_taxable_income >= b.min_income THEN  
                CASE 
                    WHEN tc.total_taxable_income - b.min_income = tc.total_taxable_income THEN 0 
                    ELSE tc.total_taxable_income - b.min_income 
                END 
            ELSE 0  
        END 
        ELSE 0 
    END AS excess_tax,

    CASE 
        WHEN sptaxpc.paysett_value = '1' 
        THEN b.percentage_deduction_tax 
        WHEN sptax.paysett_value = '1' 
        THEN b2.percentage_deduction_tax 
        ELSE 0 
    END AS percentage_deduction_tax,

    -- Percentage Tax Calculation
    CASE 
        WHEN sptax.paysett_value = '1' 
        THEN ROUND(
            CASE 
                WHEN tc.total_taxable_income > b.min_income 
                THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
                ELSE 0
            END, 2
        )
        ELSE 0 
    END AS total_percentage_tax,

    -- Fixed Tax Calculation
    CASE 
        WHEN sptaxpc.paysett_value = '1' 
        THEN COALESCE(b.fixed_tax, 0) 
        WHEN sptax.paysett_value = '1' 
        THEN COALESCE(b2.fixed_tax, 0) 
        ELSE 0 
    END AS total_fixed_tax,

    -- Total Tax Calculation
    CASE 
        WHEN sptaxpc.paysett_value = '1' 
        THEN COALESCE(
            ROUND(
                CASE  
                    WHEN tc.total_taxable_income > b.min_income 
                    THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
                    ELSE 0 
                END, 2
            ) + COALESCE(b.fixed_tax, 0), 0
        ) 
        WHEN sptax.paysett_value = '1' 
        THEN COALESCE(
            ROUND(
                CASE  
                    WHEN tc.total_taxable_month > b2.min_income 
                    THEN GREATEST(tc.total_taxable_month - b2.min_income, 0) * b2.percentage_deduction_tax / 100
                    ELSE 0 
                END, 2
            ) + COALESCE(b2.fixed_tax, 0), 0
        ) 
        ELSE 0 
    END AS total_tax,

    -- Total Value After Tax Calculation
		CASE 
		    WHEN sptaxpc.paysett_value = '1' THEN ROUND(
		        tc.total_taxable_income - (
		            COALESCE(b.fixed_tax, 0) + 
		            CASE 
		                WHEN tc.total_taxable_income > b.min_income 
		                THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
		                ELSE 0
		            END
		        ), 2
		    )
		
		    WHEN sptax.paysett_value = '1' THEN ROUND(
		        tc.total_taxable_income - (
		            COALESCE(b2.fixed_tax, 0) + 
		            CASE 
		                WHEN tc.total_taxable_month > b2.min_income 
		                THEN GREATEST(tc.total_taxable_month - b2.min_income, 0) * b2.percentage_deduction_tax / 100
		                ELSE 0
		            END
		        ), 2
		    )
		    ELSE 0
		END AS total_value_after_tax,
    
    -- Determine the SSS bracket based on total taxable income
      sss.ee_share   AS employee_sss_share,
   	sss.er_share  AS employer_sss_share,
    	sss.ec AS employment_compensation_share,
    	sss.wisp_ee  AS wisp_employee_share,
      sss.wisp_er   AS wisp_employer_share,

    -- PhilHealth Deductions (Controlled by settings_payroll)
   CASE 
        WHEN spph.paysett_value = '1' 
        THEN ROUND(LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth), 2)
        WHEN spphpc.paysett_value = '1' 
        THEN ROUND(LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2 , 2)
        ELSE 0 
    END AS total_philhealth,

		-- EMPLOYEE PhilHealth Contribution
		CASE 
		  WHEN spph.paysett_value = '1' 
		  THEN ROUND(
		      LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2
		  )
		  WHEN spphpc.paysett_value = '1' 
		  THEN ROUND(
		      LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 4, 2
		  )
		  ELSE 0
		  
		END AS employee_philhealth,
		
		-- EMPLOYER PhilHealth Contribution
		CASE 
		  WHEN spph.paysett_value = '1' 
		  THEN ROUND(
		      LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2
		  )
		  WHEN spphpc.paysett_value = '1' 
		  THEN ROUND(
		      LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 4, 2
		  )
		  ELSE 0
		  
		END AS employer_philhealth,


    -- Calculate HDMF contributions
    -- Calculate HDMF contributions
    -- HDMF (Pag-IBIG) Deductions (Controlled by settings_payroll)
     CASE 
		  WHEN sphdmf.paysett_value = '1' THEN 
		    ROUND(
		      CASE 
		        WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
		          CASE 
		            WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
		              CASE 
		                WHEN sphdmfpc.paysett_value = '1' THEN (COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100) / 2
		                ELSE COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100
		              END
		            ELSE
		              CASE 
		                WHEN sphdmfpc.paysett_value = '1' THEN (tc.total_gross_income * hb.hdmf_value_er / 100) / 2
		                ELSE tc.total_gross_income * hb.hdmf_value_er / 100
		              END
		          END
		        ELSE 0
		      END, 2
		    )
		  ELSE 0
		END  AS employee_hdmf,

    CASE 
		  WHEN sphdmf.paysett_value = '1' THEN 
		    ROUND(
		      CASE 
		        WHEN tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) THEN
		          CASE 
		            WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income) THEN
		              CASE 
		                WHEN sphdmfpc.paysett_value = '1' THEN (COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100) / 2
		                ELSE COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_er / 100
		              END
		            ELSE
		              CASE 
		                WHEN sphdmfpc.paysett_value = '1' THEN (tc.total_gross_income * hb.hdmf_value_er / 100) / 2
		                ELSE tc.total_gross_income * hb.hdmf_value_er / 100
		              END
		          END
		        ELSE 0
		      END, 2
		    )
		  ELSE 0
		END AS employer_hdmf,

    

  
				 -- Total Contribution Deduction (Conditional on settings_payroll)
		    COALESCE(  CASE WHEN spsss.paysett_value = '1' THEN sss.ee_share ELSE 0 END, 0  ) +  COALESCE( CASE WHEN spsss.paysett_value = '1' THEN sss.wisp_ee ELSE 0 END, 0  ) + 
		    ROUND(  COALESCE(  CASE WHEN spph.paysett_value = '1'   THEN LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2 
		    ELSE 0  END, 0  ), 2 ) +  ROUND( COALESCE( CASE  WHEN sphdmf.paysett_value = '1' AND  tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) 
		    THEN  CASE  WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income)  THEN COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_ee / 100
		    ELSE tc.total_gross_income * hb.hdmf_value_ee / 100  END   ELSE 0  END, 0 ), 2 ) AS total_contribution_deduction,

					 -- Total Government Deductions (Only if enabled in settings_payroll)
		    COALESCE(  CASE WHEN sptax.paysett_value = '1'   THEN ROUND(  CASE   WHEN tc.total_taxable_income > b.min_income    THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100
		    ELSE 0   END, 2 ) + COALESCE(b.fixed_tax, 0)   ELSE 0   END, 0  ) +   COALESCE(CASE WHEN spsss.paysett_value = '1' THEN sss.ee_share ELSE 0 END, 0) +
		    COALESCE(CASE WHEN spsss.paysett_value = '1' THEN sss.wisp_ee ELSE 0 END, 0) +  ROUND(  COALESCE( CASE WHEN spph.paysett_value = '1' 
		    THEN LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2  ELSE 0   END, 0  ), 2  ) +
		    ROUND(  COALESCE(  CASE  WHEN sphdmf.paysett_value = '1' AND    tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income) 
		    THEN  CASE   WHEN tc.total_gross_income > COALESCE(hb.limit, tc.total_gross_income)    THEN COALESCE(hb.limit, tc.total_gross_income) * hb.hdmf_value_ee / 100
		    ELSE tc.total_gross_income * hb.hdmf_value_ee / 100  END    ELSE 0   END, 0  ), 2  ) AS total_gov_deduction,

		COALESCE(ls.gov_loan_amount, 0) + COALESCE(ls.com_loan_amount, 0) AS total_loan_amount,

					
			  -- Total Net Pay Calculation (Only Deducting Enabled Deductions)
   COALESCE(
    ROUND(
        tc.total_taxable_income 
        - CASE 
            WHEN gl.status = 'Active' 
                 AND (CURRENT_DATE BETWEEN gl.startDate AND gl.endDate OR CURRENT_DATE = gl.endDate)
            THEN COALESCE(ls.gov_loan_amount, 0)
            ELSE 0
          END
        - CASE 
            WHEN cl.status = 'Active' 
                 AND (CURRENT_DATE BETWEEN cl.startDate AND cl.endDate OR CURRENT_DATE = cl.endDate)
            THEN COALESCE(ls.com_loan_amount, 0)
            ELSE 0
          END
        -- TAX and other deductions (same as your logic)...
        - (
            CASE 
                WHEN sptax.paysett_value = '1' 
                THEN COALESCE(b.fixed_tax, 0) +  
                    CASE  
                        WHEN tc.total_taxable_income > b.min_income 
                        THEN GREATEST(tc.total_taxable_income - b.min_income, 0) * b.percentage_deduction_tax / 100 
                        ELSE 0 
                    END 
                ELSE 0
            END
        )
        - CASE WHEN spsss.paysett_value = '1' THEN COALESCE(sss.wisp_ee, 0) ELSE 0 END
        - CASE WHEN spsss.paysett_value = '1' THEN COALESCE(sss.ee_share, 0) ELSE 0 END
        - CASE WHEN spph.paysett_value = '1' 
            THEN ROUND(LEAST(GREATEST(et.regular_value * pb.phb_value / 100, pb.phb_min_philhealth), pb.phb_max_philhealth) / 2, 2)
            ELSE 0 
          END
        - COALESCE(et.total_late_value, 0) * -1 
        - COALESCE(et.total_absent_value, 0) * -1
        - CASE 
            WHEN sphdmf.paysett_value = '1' 
            THEN ROUND(
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
            )
            ELSE 0 
          END
        + COALESCE(non_taxable_deminimis, 0)
    , 2),
    0
) AS total_net_pay


FROM EmployeeTotals et

JOIN settings_payroll spsss ON spsss.paysett_name = 'SSS'
JOIN settings_payroll spph ON spph.paysett_name = 'Philhealth'
JOIN settings_payroll sphdmf ON sphdmf.paysett_name = 'HDMF'
JOIN settings_payroll sptax ON sptax.paysett_name = 'Tax'

JOIN settings_payroll spssspc ON spssspc.paysett_name = 'SSS-Per-Cycle'
JOIN settings_payroll spphpc ON spphpc.paysett_name = 'Philhealth-Per-Cycle'
JOIN settings_payroll sphdmfpc ON sphdmfpc.paysett_name = 'HDMF-Per-Cycle'
JOIN settings_payroll sptaxpc ON sptaxpc.paysett_name = 'Tax-Per-Cycle'

LEFT JOIN emp_goverment_loans gl
    ON et.emp_id = gl.emp_id
    AND (CURRENT_DATE BETWEEN gl.startDate AND gl.endDate OR CURRENT_DATE = gl.endDate)

LEFT JOIN emp_company_loans cl
    ON et.emp_id = cl.emp_id
    AND (CURRENT_DATE BETWEEN cl.startDate AND cl.endDate OR CURRENT_DATE = cl.endDate)
    
    
LEFT JOIN TotalComputation tc
    ON et.emp_id = tc.emp_id 
LEFT JOIN tax_brackets_semi_monthly b ON 
   	(
        CASE 
            WHEN spssspc.paysett_value = '1'
				THEN tc.total_taxable_income BETWEEN b.min_income AND COALESCE(b.max_income, tc.total_taxable_income)
            ELSE 0
        END
   	 )  
LEFT JOIN tax_brackets_monthly b2 ON 
 		(
        CASE 
            WHEN spsss.paysett_value = '1'
				THEN  tc.total_taxable_month BETWEEN b2.min_income AND COALESCE(b2.max_income, tc.total_taxable_month)
            ELSE 0
        END
   	 )  
LEFT JOIN philhealth_bracket pb ON pb.phb_id = 1 
LEFT JOIN hdmf_bracket hb ON 
    tc.total_gross_income BETWEEN hb.hdmf_min AND COALESCE(hb.hdmf_max, tc.total_gross_income)
LEFT JOIN sss_bracket sss ON 
    (
        CASE 
            WHEN spssspc.paysett_value = '1'
				THEN tc.total_gross_income BETWEEN sss.sss_min AND COALESCE(sss.sss_max, tc.total_gross_income)
				 WHEN spsss.paysett_value = '1'
				THEN tc.total_taxable_month BETWEEN sss.sss_min AND COALESCE(sss.sss_max, tc.total_taxable_month)
            ELSE 0
        END
    )  
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
    // Step 1: Insert loan metadata
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
        return res.status(500).send('Payroll saved, but error saving loan metadata');
      }

      console.log('Loan summary metadata inserted successfully');

      const insertDeductionsQuery = `
          INSERT INTO emp_loan_summary (
            emp_id,
            loan_ID,
            emp_loans_date,
            payroll_cycle,
            loan_amount,
            penalty,
            penalty_option,
            loan_type_name,
            payment_terms,
            total_loan,
            total_loan_remaining,
            loan_source,
            emp_date_coverage,
            emp_loans_payroll_type
          )
          SELECT 
            emp_id,
            loan_ID,
            ? AS emp_loans_date,
            ? AS payroll_cycle,
            computed_deduction,
            penalty,
            penalty_option,
            loan_type_name,
            payment_terms,
            total_loan,
            (total_loan - computed_deduction) AS total_loan_remaining,
            loan_type,
            ? AS emp_date_coverage,
            ? AS emp_loans_payroll_type
          FROM (
            -- Government Loans
            SELECT
              ei.emp_id,
              gl.emp_goverment_loans_id AS loan_ID,
              gl.loan_type_name,
              gl.loan_monthly_payment,
              gl.penalty,
              gl.penalty_option,
              gl.payment_terms,
              gl.period_of_deduction,
              pp.payrollCycle,
              'Government' AS loan_type,
              ROUND(
                CASE
                  WHEN gl.period_of_deduction IN ('1stCycle', '1st Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle') THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
                      WHEN gl.penalty_option = 'Add in 1st Payment' THEN COALESCE(gl.loan_monthly_payment, 0) + COALESCE(gl.penalty, 0)
                      WHEN gl.penalty_option = 'Add Payment Terms' THEN COALESCE(gl.loan_monthly_payment, 0)
                      ELSE COALESCE(gl.loan_monthly_payment, 0)
                    END
                  WHEN gl.period_of_deduction IN ('2ndCycle', '2nd Cycle') AND pp.payrollCycle IN ('2ndCycle', '2nd Cycle') THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
                      ELSE COALESCE(gl.loan_monthly_payment, 0)
                    END
                  WHEN gl.period_of_deduction IN ('BothCycle', 'Both Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle', '2ndCycle', '2nd Cycle') THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
                      ELSE COALESCE(gl.loan_monthly_payment, 0)
                    END
                  WHEN gl.period_of_deduction = 'Monthly' AND pp.payrollCycle = 'Monthly' THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))
                      WHEN gl.penalty_option = 'Add in 1st Payment' THEN COALESCE(gl.loan_monthly_payment, 0) + COALESCE(gl.penalty, 0)
                      ELSE COALESCE(gl.loan_monthly_payment, 0)
                    END
                  WHEN gl.period_of_deduction = 'Double' AND pp.payrollCycle = 'Monthly' THEN
                    CASE 
                      WHEN gl.penalty_option = 'Distributed' THEN (COALESCE(gl.loan_monthly_payment, 0) + (COALESCE(gl.penalty, 0) / NULLIF(gl.payment_terms, 0))) * 2
                      WHEN gl.penalty_option = 'Add in 1st Payment' THEN (COALESCE(gl.loan_monthly_payment, 0) + COALESCE(gl.penalty, 0)) * 2
                      WHEN gl.penalty_option = 'Add Payment Terms' THEN COALESCE(gl.loan_monthly_payment, 0) * 2
                      ELSE COALESCE(gl.loan_monthly_payment, 0) * 2
                    END
                  ELSE 0
                END, 2
              ) AS computed_deduction,
              (
                COALESCE(gl.loan_monthly_payment, 0) * gl.payment_terms 
                + CASE 
                    WHEN gl.penalty_option = 'Add in 1st Payment' THEN COALESCE(gl.penalty, 0)
                    ELSE 0
                  END
              ) AS total_loan
            FROM emp_info ei
            LEFT JOIN emp_payroll_part_1 pp ON ei.emp_id = pp.emp_id
            INNER JOIN emp_goverment_loans gl ON ei.emp_id = gl.emp_id

            UNION ALL

            -- Company Loans
            SELECT
              ei.emp_id,
              cl.emp_company_loans_id AS loan_ID,
              cl.loan_type AS loan_type_name,
              cl.loan_monthly_payment,
              cl.penalty,
              cl.penalty_option,
              cl.payment_terms,
              cl.period_of_deduction,
              pp.payrollCycle,
              'Company' AS loan_type,
              ROUND(
                CASE
                  WHEN cl.period_of_deduction IN ('1stCycle', '1st Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle') THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
                      WHEN cl.penalty_option = 'Add in 1st Payment' THEN COALESCE(cl.loan_monthly_payment, 0) + COALESCE(cl.penalty, 0)
                      WHEN cl.penalty_option = 'Add Payment Terms' THEN COALESCE(cl.loan_monthly_payment, 0)
                      ELSE COALESCE(cl.loan_monthly_payment, 0)
                    END
                  WHEN cl.period_of_deduction IN ('2ndCycle', '2nd Cycle') AND pp.payrollCycle IN ('2ndCycle', '2nd Cycle') THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
                      ELSE COALESCE(cl.loan_monthly_payment, 0)
                    END
                  WHEN cl.period_of_deduction IN ('BothCycle', 'Both Cycle') AND pp.payrollCycle IN ('1stCycle', '1st Cycle', '2ndCycle', '2nd Cycle') THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
                      ELSE COALESCE(cl.loan_monthly_payment, 0)
                    END
                  WHEN cl.period_of_deduction = 'Monthly' AND pp.payrollCycle = 'Monthly' THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))
                      WHEN cl.penalty_option = 'Add in 1st Payment' THEN COALESCE(cl.loan_monthly_payment, 0) + COALESCE(cl.penalty, 0)
                      ELSE COALESCE(cl.loan_monthly_payment, 0)
                    END
                  WHEN cl.period_of_deduction = 'Double' AND pp.payrollCycle = 'Monthly' THEN
                    CASE 
                      WHEN cl.penalty_option = 'Distributed' THEN (COALESCE(cl.loan_monthly_payment, 0) + (COALESCE(cl.penalty, 0) / NULLIF(cl.payment_terms, 0))) * 2
                      WHEN cl.penalty_option = 'Add in 1st Payment' THEN (COALESCE(cl.loan_monthly_payment, 0) + COALESCE(cl.penalty, 0)) * 2
                      WHEN cl.penalty_option = 'Add Payment Terms' THEN COALESCE(cl.loan_monthly_payment, 0) * 2
                      ELSE COALESCE(cl.loan_monthly_payment, 0) * 2
                    END
                  ELSE 0
                END, 2
              ) AS computed_deduction,
              (
                COALESCE(cl.loan_monthly_payment, 0) * cl.payment_terms 
                + CASE 
                    WHEN cl.penalty_option = 'Add in 1st Payment' THEN COALESCE(cl.penalty, 0)
                    ELSE 0
                  END
              ) AS total_loan
            FROM emp_info ei
            LEFT JOIN emp_payroll_part_1 pp ON ei.emp_id = pp.emp_id
            INNER JOIN emp_company_loans cl ON ei.emp_id = cl.emp_id
          ) AS LoansDetailed;
        `;

      db.query(
        insertDeductionsQuery,
        [emp_loans_date, payrollCycle, emp_date_coverage, payrollType],
        (err3) => {
          if (err3) {
            console.error('Error inserting deductions:', err3);
            return res.status(500).send('Error computing and inserting loan deductions');
          }
          console.log('Loan deductions inserted successfully');
        }
      );


      console.log('Loan deductions inserted');
// Step 3a: Update government loan statuses
      const updateGovStatusQuery = `
        UPDATE emp_goverment_loans gl
        JOIN emp_loan_summary els ON gl.emp_goverment_loans_id = els.loan_ID
        SET gl.status = 'Inactive'
        WHERE els.loan_source = 'Government'
          AND (els.total_loan - els.loan_amount) <= 0
          OR els.payment_terms <= 1;
      `;

      db.query(updateGovStatusQuery, (err4) => {
        if (err4) {
          console.error('Error updating government loan statuses:', err4);
          return res.status(500).send('Loan data saved, but failed to update government loan statuses');
        }

        // Step 3b: Update company loan statuses
        const updateCompanyStatusQuery = `
          UPDATE emp_company_loans cl
          JOIN emp_loan_summary els ON cl.emp_company_loans_id = els.loan_ID
          SET cl.status = 'Inactive'
          WHERE els.loan_source = 'Company'
            AND (els.total_loan - els.loan_amount) <= 0
            OR els.payment_terms <= 1;
        `;

        db.query(updateCompanyStatusQuery, (err5) => {
          if (err5) {
            console.error('Error updating company loan statuses:', err5);
            return res.status(500).send('Loan data saved, but failed to update company loan statuses');
          }

          console.log('Loan statuses updated successfully');
          return res.status(200).send('Loan data and statuses updated');
        });
      });

    });
  });
});*/


router.get('/payroll/cycle', async (req, res) => {
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




router.post('/payroll-part-2-m', async (req, res) => {
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


router.get('/payroll/cycle', async (req, res) => {
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

router.get('/date_cycle', (req, res) => {
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


router.post("/payroll-settings-toggle", (req, res) => {
  const settings = req.body;
  const queries = Object.entries(settings).map(([key, value]) =>
    db.query("UPDATE settings_payroll SET paysett_value = ? WHERE paysett_name = ?", [value, key])
  );

  Promise.all(queries)
    .then(() => res.json({ message: "Payroll settings updated successfully" }))
    .catch(err => res.status(500).json(err));
});


router.post("/settings_payroll_2", (req, res) => {
  const settings = req.body; // Expects an array of objects like: { paysett2_name, paysett2_startdate, paysett2_enddate, paysett2_value }

  const queries = settings.map(({ paysett2_name, paysett2_startdate, paysett2_enddate, paysett2_release, paysett2_value }) =>
    db.query(
      "UPDATE settings_payroll_2 SET paysett2_startdate = ?, paysett2_enddate = ?, paysett2_release = ?, paysett2_value = ? WHERE paysett2_name = ?",
      [paysett2_startdate, paysett2_enddate, paysett2_release, paysett2_value, paysett2_name]
    )
  );

  Promise.all(queries)
    .then(() => res.json({ message: "Payroll settings updated successfully" }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Error updating payroll settings" });
    });
});


router.get("/settings_payroll_2", (req, res) => {
  // Correct SQL query to select the necessary columns
  db.query("SELECT paysett2_name, paysett2_startdate, paysett2_enddate, paysett2_release, paysett2_value FROM settings_payroll_2", (err, results) => {
    if (err) return res.status(500).json(err);

    // Initialize the settings array
    const settings = results.map(row => ({
      paysett2_name: row.paysett2_name,
      paysett2_startdate: row.paysett2_startdate,
      paysett2_enddate: row.paysett2_enddate,
      paysett2_release: row.paysett2_release,
      paysett2_value: row.paysett2_value
    }));

    // Send the populated settings as a response
    res.json({ settings });
  });
});
// Get all payroll toggle settings (used in UI toggle switch)

router.get("/payroll-settings", async (req, res) => {
  try {
    const [rows] = await dbNew.query("SELECT * FROM settings_payroll");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update individual toggle (and logic for exclusive payroll type)

router.put("/payroll-settings/:id", async (req, res) => {
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
    } else if (id == 10 && paysett_value == 0) {
      await dbNew.query("UPDATE settings_payroll SET paysett_value = 1 WHERE paysett_id = 11");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 1 WHERE paysett2_name = 'Monthly'");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 0 WHERE paysett2_name = '1stCycle' ");
      await dbNew.query("UPDATE settings_payroll_2 SET paysett2_value = 0 WHERE paysett2_name ='2ndCycle'");
    } else if (id == 11 && paysett_value == 0) {
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

router.get("/payroll-date-settings", (req, res) => {
  db.query("SELECT paysett2_id, paysett2_name, paysett2_startdate, paysett2_enddate, paysett2_value FROM settings_payroll_2", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json({ settings: results });
  });
});

// Update payroll date settings in bulk

router.post("/payroll-date-settings", (req, res) => {
  const settings = req.body;
  const queries = Object.entries(settings).map(([key, value]) =>
    db.query("UPDATE settings_payroll_2 SET paysett_value = ? WHERE paysett_name = ? AND paysett2_date = ?", [value.value, key, value.date])
  );

  Promise.all(queries)
    .then(() => res.json({ message: "Payroll settings updated successfully" }))
    .catch(err => res.status(500).json(err));
});

// Category listing

router.get('/payroll-category', async (req, res) => {
  try {
    const [rows] = await dbNew.query("SELECT * FROM settings_category");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});


router.get('/payroll-cycles', async (req, res) => {
  try {
    const [rows] = await dbNew.query("SELECT * FROM settings_payroll_2");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});


router.get("/active-payroll-cycles", (req, res) => {
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

export default router;
