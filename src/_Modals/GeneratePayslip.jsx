import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
} from '@mui/material';

export default function GeneratePayslip({ onOpen, onClose, onDownload }) {
  const [data, setData] = useState([]); // State for table data
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchPayrollSummary = async () => {
      try {
        const response = await axios.get('http://localhost:8800/payroll-summary');

        // Format options for Month Day, Year
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

        // Process response data to format dates
        const payrollData = response.data.map((item) => {
          const { startDate, endDate } = item;

          // Format startDate and endDate
          const formattedStartDate = dateFormatter.format(new Date(startDate));
          const formattedEndDate = dateFormatter.format(new Date(endDate));

          // Concatenate formatted dates
          const concatenatedDate = `${formattedStartDate} - ${formattedEndDate}`;

          return {
            ...item,
            concatenatedDate,
            selected: false, // Add 'selected' field for checkbox state
          };
        });

        setData(payrollData); // Update state with the modified data
      } catch (error) {
        console.error('Failed to fetch payroll summary data:', error);
      }
    };

    fetchPayrollSummary();
  }, []);

  const handleCheckboxChange = (id) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.id === id ? { ...row, selected: !row.selected } : row
      )
    );
  };

  return (
    <Dialog open={onOpen} onClose={onClose}>
      <DialogTitle>Generate Payslip</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Select</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Date Range</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      checked={row.selected}
                      onChange={() => handleCheckboxChange(row.id)}
                    />
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.concatenatedDate}</TableCell>
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
        <Button onClick={onDownload} color="primary">
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}
