import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
} from "@mui/material";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PayslipPDF from "../Formats/PayslipFormat"; // Import PDF format

export default function GeneratePayslip({ onOpen, onClose }) {
  const [data, setData] = useState([]);
  const [checked, setChecked] = useState([]);
  const [payslipData, setPayslipData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayrollSummary();
    if (!onOpen) {
      setChecked(new Array(data.length).fill(false))
      setPayslipData([]);
    }
  }, [onOpen, data.length]);

  const fetchPayrollSummary = async () => {
    try {
      const response = await axios.get("http://localhost:8800/payslip-data");
      setData(response.data);
      setChecked(new Array(response.data.length).fill(false));
    } catch (error) {
      console.error("Failed to fetch payroll summary:", error);
    }
  };

  const handleParentCheckboxChange = (event) => {
    const checkedValue = event.target.checked;
    setChecked(new Array(data.length).fill(checkedValue));
  };

  const handleChildCheckboxChange = (index) => {
    setChecked((prevChecked) => {
      const updatedChecked = [...prevChecked];
      updatedChecked[index] = !updatedChecked[index];
      return updatedChecked;
    });
  };

  const isAllChecked = checked.every((item) => item);
  const isIndeterminate = checked.some((item) => item) && !isAllChecked;

  const selectedIds = data
    .filter((_, index) => checked[index])
    .map((row) => row.emp_id);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all(
        selectedIds.map((id) => axios.get(`http://localhost:8800/payslip/${id}`))
      );
      setPayslipData(responses.map((response) => response.data));
    } catch (error) {
      console.error("Failed to fetch payslip data:", error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={onOpen} onClose={onClose}>
      <DialogTitle>Generate Payslip</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox
                    checked={isAllChecked}
                    indeterminate={isIndeterminate}
                    onChange={handleParentCheckboxChange}
                  />
                </TableCell>
                <TableCell>Emp ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Payroll Type</TableCell>
                <TableCell>Payroll Cycle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      checked={checked[index]}
                      onChange={() => handleChildCheckboxChange(index)}
                    />
                  </TableCell>
                  <TableCell>{row.emp_id}</TableCell>
                  <TableCell>{row.full_name}</TableCell>
                  <TableCell>{row.payrollType}</TableCell>
                  <TableCell>{row.payrollCycle}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleDownload} color="primary" disabled={loading}>
          {loading ? "Fetching Data..." : "Generate PDF"}
        </Button>
        {payslipData.length > 0 && (
          <PDFDownloadLink document={<PayslipPDF payslipData={payslipData} />} fileName="payslip.pdf">
            {({ loading }) =>
              loading ? <Button disabled>Loading PDF...</Button> : <Button color="primary" onClick={onClose}>Download PDF</Button>
            }
          </PDFDownloadLink>
        )}
      </DialogActions>
    </Dialog>
  );
}
