import React, { useState, useEffect } from 'react';
import Table from '@mui/joy/Table';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Collapse } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import axios from 'axios';

export default function TableAttendance({ data: initialData, onSearch }) {
  const [tableData, setTableData] = useState(initialData || []);
  const [page, setPage] = useState(1); // Track current page
  const [expandedRows, setExpandedRows] = useState({}); // Track expanded rows

  useEffect(() => {
    fetchData(page); // Fetch data when page changes
  }, [page]);

  const filteredEmp = tableData.filter((emp) => {
    const fullname = `${emp.f_name} ${emp.l_name}`.toLowerCase();
    return (
      emp.emp_id.toString().includes(onSearch) ||
      fullname.includes(onSearch.toLowerCase())
    );
  });

  const fetchData = async (page) => {
    try {
      const limit = 20;
      const offset = (page - 1) * limit;
      const response = await axios.get(`http://localhost:8800/attendance-module?limit=${limit}&offset=${offset}`);
      console.log("Fetched Data:", response.data);
      if (response && response.data) {
        setTableData(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString([], {
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
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Table hoverRow borderAxis="both" id='attendance-table'>
          <thead>
            <tr>
              <th style={{ width: 'auto' }}></th>
              <th style={{ width: 'auto', textAlign: 'center' }}>Emp ID</th>
              <th style={{ width: 'auto', textAlign: 'center' }}>Employee Name</th>
              <th style={{ width: 'auto', textAlign: 'center' }}>Date</th>
              <th style={{ width: 'auto', textAlign: 'center' }}>Time In</th>
              <th style={{ width: 'auto', textAlign: 'center' }}>Date out</th>
              <th style={{ width: 'auto', textAlign: 'center' }}>Time Out</th>
              <th style={{ width: 'auto', textAlign: 'center' }}>Total of Hours</th>
              <th style={{ width: 'auto', textAlign: 'center' }}>Total Regular Hours</th>
              <th style={{ width: 'auto', textAlign: 'center' }}>Total OT Hours</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmp.length > 0 ? (
              onSearch ? filteredEmp : tableData.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <tr key={rowIndex}>
                    <td>
                      <IconButton onClick={() => toggleRowExpansion(rowIndex)}>
                        {expandedRows[rowIndex] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </td>
                    <td style={{ cursor: 'pointer', textAlign: 'center' }}>{row.emp_id}</td>
                    <td style={{ cursor: 'pointer', textAlign: 'center' }}>{row.full_name}</td>
                    <td style={{ cursor: 'pointer', textAlign: 'center' }}>{formatDate()}</td>
                    <td style={{ cursor: 'pointer', textAlign: 'center' }}>{formatTime1(row.time_in)}</td>
                    <td style={{ cursor: 'pointer', textAlign: 'center' }}>{formatTime1(row.time_out)}</td>
                    <td style={{ cursor: 'pointer', textAlign: 'center' }}>{formatTime1(row.time_out)}</td>
                    <td style={{ cursor: 'pointer', textAlign: 'center' }}>{formatTime1(row.total_hours)}</td>
                    <td style={{ cursor: 'pointer', textAlign: 'center' }}>{formatTime1(row.total_regular_hours)}</td>
                    <td style={{ cursor: 'pointer', textAlign: 'center' }}>{formatTime1(row.total_ot_hours)}</td>
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
      </div>

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
