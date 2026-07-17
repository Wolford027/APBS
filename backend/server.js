import 'dotenv/config';
import express from "express";
import cors from "cors";

import backupRoutes from "./routes/backup.js";
import systemVariablesRoutes from "./routes/system-variables.js";
import reportsRoutes from "./routes/reports.js";
import payslipRoutes from "./routes/payslip.js";
import authRoutes from "./routes/auth.js";
import employeesRoutes from "./routes/employees.js";
import leavesRoutes from "./routes/leaves.js";
import attendanceRoutes from "./routes/attendance.js";
import earningsDeductionsRoutes from "./routes/earnings-deductions.js";
import loansRoutes from "./routes/loans.js";
import payrollRoutes from "./routes/payroll.js";

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.options('*', cors())
app.use(express.static('public'))
app.use(express.json({ limit: '5mb' }));

app.get("/", (req, res) => {
  return res.json("BACKEND");
});

app.use(backupRoutes);
app.use(systemVariablesRoutes);
app.use(reportsRoutes);
app.use(payslipRoutes);
app.use(authRoutes);
app.use(employeesRoutes);
app.use(leavesRoutes);
app.use(attendanceRoutes);
app.use(earningsDeductionsRoutes);
app.use(loansRoutes);
app.use(payrollRoutes);

app.listen(process.env.PORT, () => {
  console.log("Connected in Backend!");
});
