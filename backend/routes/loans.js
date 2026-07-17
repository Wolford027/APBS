import express from 'express';
import { db, dbNew } from '../db.js';

const router = express.Router();

router.get("/get-loans", (req, res) => {
  const query = 'SELECT * FROM emp_loans';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Loans:', err);
      return res.status(500).json({ error: 'Failed to fetch Loan' });
    }
    res.json(results);
  })
})

//Fetch NPRTRV Data

router.get("/fetch-date-loan", (req, res) => {
  const sql = "SELECT paysett2_name, paysett2_release FROM settings_payroll_2";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length > 0) {
      // Convert result rows into a releaseDays object
      const releaseDays = {};
      result.forEach(row => {
        const key = row.paysett2_name.replace(/\s+/g, ""); // Normalize key (e.g., "1st Cycle" → "1stCycle")
        releaseDays[key] = parseInt(row.paysett2_release);
      });

      res.json({
        releaseDays, // { "1stCycle": 15, "2ndCycle": 30, "Monthly": 30 }
      });
    } else {
      res.status(404).json({ error: "No payroll settings found" });
    }
  });
});


//  FETCH LOANS TOTAL

router.get('/employee-table-loans', async (req, res) => {
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

router.get('/employee-table-loans-id/:emp_id', (req, res) => {
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

router.get('/employee-loans/:emp_id', async (req, res) => {
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
        status,
        period_of_deduction,
        startDate,
        endDate
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
        status,
        period_of_deduction,
        startDate,
        endDate
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

router.get("/gov-name", (req, res) => {
  const sql = "SELECT * FROM emp_goverment";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
// FETCH LOAN TYPE

router.get("/loan-type", (req, res) => {
  const sql = "SELECT * FROM loan_type";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
// FETCH COMPANY LOAN NAME

router.get("/com-name", (req, res) => {
  const sql = "SELECT * FROM company_loan_name";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
// FETCH COMPANY LOAN TYPE

router.get("/company-loan-type", (req, res) => {
  const sql = "SELECT * FROM company_loan_type";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
// FETCH STATUS Active / CLOSE

router.get("/status-loans", (req, res) => {
  const sql = "SELECT * FROM emp_status_loans";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});


router.get("/CheckDuplicateGovernmentLoan", (req, res) => {
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


router.post("/AddGovernmentLoans", async (req, res) => {
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

    await dbNew.query(query, values);

    res.status(200).send({ message: "Government loan saved successfully" });

  } catch (error) {
    console.error("Error saving government loan:", error);
    res.status(500).send({ message: "Failed to save government loan" });
  }
});


router.post('/AddCompanyLoans', (req, res) => {
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

router.get('/ViewGovernmentLoans', async (req, res) => {
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

router.get('/ViewCompanyLoans', async (req, res) => {
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

router.get('/emp-loans', (req, res) => {
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


router.get('/emp_loan_summary/:emp_loans_date', (req, res) => {
  const { emp_loans_date } = req.params;

  const query = `
    SELECT els.*
    FROM emp_loan_summary els
    JOIN emp_loans el ON els.emp_loans_date = el.emp_loans_date
    WHERE els.emp_loans_date = ?
  `;

  db.query(query, [emp_loans_date], (err, result) => {
    if (err) {
      console.error('Error fetching loan summary by date:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(result);
  });
});

export default router;
