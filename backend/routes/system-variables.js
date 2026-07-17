import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get("/get-dmb", (req, res) => {
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

router.get("/get-nprtrv", (req, res) => {
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

router.get("/get-deduc", (req, res) => {
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

router.get("/get-rate-value", (req, res) => {
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

router.get("/get-tax", (req, res) => {
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

router.get("/get-payroll-settings", (req, res) => {
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

router.get("/get-leave-type", (req, res) => {
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

router.get("/get-loan-type", (req, res) => {
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

router.get("/get-employment-type", (req, res) => {
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

router.get("/get-civil-status", (req, res) => {
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

router.get("/get-sex", (req, res) => {
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

router.post("/save-dmb", (req, res) => {
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

router.post("/save-payroll-settings", (req, res) => {
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

router.post("/save-leave-type", (req, res) => {
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

router.post("/save-employment-type", (req, res) => {
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

router.post("/save-nprtrv", (req, res) => {
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

router.post("/save-deduc", (req, res) => {
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

router.post("/save-rate-value", (req, res) => {
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

router.delete('/delete-rate-value/:id', async (req, res) => {
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

router.delete('/delete-deduc/:id', async (req, res) => {
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

router.delete('/delete-dmb/:id', async (req, res) => {
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

router.delete('/delete-payroll-settings/:id', async (req, res) => {
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

router.delete('/delete-leave-type/:id', async (req, res) => {
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

router.delete('/delete-employment-type/:id', async (req, res) => {
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

router.delete('/delete-loan-type/:id', async (req, res) => {
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

router.delete('/delete-civil-status/:id', async (req, res) => {
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

router.delete('/delete-sex/:id', async (req, res) => {
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

router.post("/save-loan-type", (req, res) => {
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

router.post("/save-civil-status", (req, res) => {
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

router.post("/save-sex", (req, res) => {
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

router.post("/save-tax", (req, res) => {
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

export default router;
