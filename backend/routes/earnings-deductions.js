import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/employee-table-earnings', async (req, res) => {
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

router.get('/employee-table-earnings-id/:emp_id', (req, res) => {
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

router.get('/employee-earnings/:emp_id', (req, res) => {
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

router.get('/emp-additional-benifits/:emp_id', (req, res) => {
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


router.get('/emp-benifits-deminimis-annually/:emp_id', (req, res) => {
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

router.get('/emp_list', (req, res) => {
  const { startDate, endDate } = req.query;

  const sql = ` SELECT emp_id, f_name, l_name FROM emp_info`;

  db.query(sql, [startDate, endDate], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});
// SELECT EMP BY DATE

router.get('/emp_list_by_date', (req, res) => {
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

router.get('/emp-additional-benefits-filter/:empId/:filter', (req, res) => {
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

router.get('/ViewEarningsDeMinimisM', async (req, res) => {
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

router.get('/ViewEarningsDeMinimisA', async (req, res) => {
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

router.post('/AddEarningsDeMinimisM', (req, res) => {
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

router.post("/AddEarningsDeMinimisA", (req, res) => {
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

router.post('/AddEmpBenefits', (req, res) => {
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

router.post('/onetimeEarnDeduct', (req, res) => {
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



router.get('/onetimeEarnDeduct', (req, res) => {
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


router.get('/earnings_deductions', (req, res) => {
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


router.get('/earnings_deductions/:id', (req, res) => {
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



router.get('/option', (req, res) => {
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


router.get('/pay_des', (req, res) => {
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


router.get('/name', (req, res) => {
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

router.post('/submit_earnings_deductions', (req, res) => {
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

router.get('/earnings_deductions_per_emp/:id', (req, res) => {
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


router.post("/update_earn_deduct/:id", (req, res) => {
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


router.delete("/delete_earn_deduct/:id", (req, res) => {
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
});


router.delete("/delete_earnings_deductions", (req, res) => {
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


// Update payroll settings

export default router;
