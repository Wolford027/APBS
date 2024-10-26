import React, { useState, useEffect } from 'react';
import Table from '@mui/joy/Table';
import Button from '@mui/material/Button';
import axios from 'axios';

export default function TableAttendance() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1); // Track current page
  const limit = 20; // Limit of records per page

  useEffect(() => {
    fetchData(page); // Fetch data when page changes
  }, [page]);

  const fetchData = async (page) => {
    try {
      const limit = 20;
      const offset = (page - 1) * limit;
      const response = await axios.get(`http://localhost:8800/attendance-module?limit=${limit}&offset=${offset}`);
      
      if (response && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const time = new Date(timeString);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };
  const formatTime1 = (timeString) => {
    if (!timeString || timeString === '--:--:--') return '--:--:--';
    return timeString;  // No need to convert it to a Date object, just return the time
  };

  const handleNext = () => setPage(page + 1);
  const handlePrevious = () => page > 1 && setPage(page - 1);

  return (
    <>
      <Table hoverRow sx={{}} borderAxis="both">
        <thead>
          <tr>
            <th style={{ width: '10%' }}>Attendance</th>
            <th style={{ width: '10%' }}>Employee ID</th>
            <th style={{ width: '15%' }}>Employee Name</th>
            <th style={{ width: '10%' }}>Date in</th>
            <th style={{ width: '10%' }}>Time In</th>
            <th style={{ width: '10%' }}>Date out</th>
            <th style={{ width: '10%' }}>Time Out</th>
            <th style={{ width: '10%' }}>Break In</th>
            <th style={{ width: '10%' }}>Break Out</th>
            <th style={{ width: '10%' }}>Total of Hours</th>
            <th style={{ width: '10%' }}>Total Break</th>
            <th style={{ width: '10%' }}>Grand Total of Hours</th>
            <th style={{ width: '10%' }}>Total OT Hours</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td style={{ cursor: 'pointer' }}>{row.emp_attendance_id}</td>
                <td style={{ cursor: 'pointer' }}>{row.emp_id}</td>
                <td style={{ cursor: 'pointer' }}>{row.full_name}</td>
                <td style={{ cursor: 'pointer' }}>{formatDate(row.time_in)}</td>
                <td style={{ cursor: 'pointer' }}>{formatTime(row.time_in)}</td>
                <td style={{ cursor: 'pointer' }}>{formatDate(row.time_out)}</td>
                <td style={{ cursor: 'pointer' }}>{formatTime(row.time_out)}</td>
                <td style={{ cursor: 'pointer' }}>{formatTime1(row.break_in)}</td>
                <td style={{ cursor: 'pointer' }}>{formatTime1(row.break_out)}</td>
                <td style={{ cursor: 'pointer' }}>{row.total_hrs}</td>
                <td style={{ cursor: 'pointer' }}>{row.total_break_hr}</td>
                <td style={{ cursor: 'pointer' }}>{row.grand_total_hrs}</td>
                <td style={{ cursor: 'pointer' }}>{row.total_ot_hrs}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>
                No Data Available
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Button variant="contained" disabled={page === 1} onClick={handlePrevious}>
          Previous
        </Button>
        <Button variant="contained" onClick={handleNext} style={{ marginLeft: '10px' }}>
          Next
        </Button>
      </div>
    </>
  );
}
