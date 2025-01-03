import React, { useState, useEffect } from 'react';
import Table from '@mui/joy/Table';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Collapse } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import axios from 'axios';

export default function TableAttendance() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1); // Track current page
  const limit = 20; // Limit of records per page
  const [expandedRows, setExpandedRows] = useState({}); // Track expanded rows

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
  
  const toggleRowExpansion = (index) => {
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows,
      [index]: !prevExpandedRows[index],
    }));
  };


  return (
    <>
      <Table hoverRow borderAxis="both" id='attendance-table'>
        <thead>
          <tr>
            <th style={{ width: '2%' }}></th>
            <th style={{ width: '2%' }}>No.</th>
            <th style={{ width: '4%' }}>Emp ID</th>
            <th style={{ width: '8%' }}>Employee Name</th>
            <th style={{ width: '5%' }}>Date</th>
            <th style={{ width: '3%' }}>Time In</th>
            <th style={{ width: '5%' }}>Date out</th>
            <th style={{ width: '5%' }}>Time Out</th>
            <th style={{ width: '6%' }}>Total of Hours</th>
            <th style={{ width: '8%' }}>Total Regular Hours</th>
            <th style={{ width: '8%' }}>Total OT Hours</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr>
                  <td>
                    <IconButton onClick={() => toggleRowExpansion(rowIndex)}>
                      {expandedRows[rowIndex] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </td>
                  <td style={{ cursor: 'pointer' }}>{row.emp_attendance_id}</td>
                  <td style={{ cursor: 'pointer' }}>{row.emp_id}</td>
                  <td style={{ cursor: 'pointer' }}>{row.full_name}</td>
                  <td style={{ cursor: 'pointer' }}>{row.date}</td>
                  <td style={{ cursor: 'pointer' }}>{row.time_in}</td>
                  <td style={{ cursor: 'pointer' }}>{row.time_out}</td>
                  <td style={{ cursor: 'pointer' }}>{row.time_out}</td>
                  <td style={{ cursor: 'pointer' }}>{row.total_hours}</td>
                  <td style={{ cursor: 'pointer' }}>{row.total_regular_hours}</td>
                  <td style={{ cursor: 'pointer' }}>{row.total_ot_hours}</td>
                </tr>

                <Collapse in={expandedRows[rowIndex]} timeout="auto" unmountOnExit>
                  <tr>
                    <td colSpan={12} style={{ backgroundColor: '#f9f9f9', padding: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 auto' }}>

                        {/* Break Details Section */}
                        <div style={{ flex: '1', marginRight: '15px', padding: '5px' }}>
                          <strong>Break Details:</strong>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', whiteSpace: 'nowrap' }}>
                            <div style={{ textAlign: 'center', marginRight: '8px' }}>
                              <div>Break In:</div>
                              <div style={{ fontWeight: 'bold' }}>{row.break_in}</div>
                            </div>
                            <div style={{ textAlign: 'center', marginRight: '8px' }}>
                              <div>Break Out:</div>
                              <div style={{ fontWeight: 'bold' }}>{row.break_out}</div>
                            </div>
                            <div style={{ textAlign: 'center', marginRight: '8px' }}>
                              <div>Total Break:</div>
                              <div style={{ fontWeight: 'bold' }}>{row.total_break_hr}</div>
                            </div>
                          </div>
                        </div>

                        {/* Night Difference Details Section */}
                        <div style={{ flex: '1', marginRight: '15px', padding: '5px' }}>
                          <strong>Regular Overtime Details:</strong>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px',whiteSpace: 'nowrap' }}>
                          <div style={{ textAlign: 'center' , marginRight:'8px' }}>
                            <div>Total Regular Overtime Hours:</div>
                              <div style={{ fontWeight: 'bold' }}>{row.total_ot_hours}</div>
                            </div>
                          </div>
                        </div>

                        <div style={{ flex: '1' , padding: '5px' }}>
                          <strong>Night Difference Details:</strong>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px',whiteSpace: 'nowrap' }}>
                            <div style={{ textAlign: 'center', marginRight:'8px'  }}>
                            <div>Total Night Diff OT Hours:</div>
                              <div style={{ fontWeight: 'bold' }}>{row.total_night_diff_hours}</div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </td>
                  </tr>
                </Collapse>
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="11" style={{ textAlign: 'center' }}>
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
