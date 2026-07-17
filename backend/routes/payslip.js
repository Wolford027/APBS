import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/payslip/:id', async (req, res) => {
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

router.get("/payslip-data", async (req, res) => {
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

export default router;
