import React from 'react';
import Table from '@mui/joy/Table';

export default function TableAttendance({ data }) {
  return (
    <Table hoverRow id='attendance-table' borderAxis='both'>
      <thead>
        <tr>
          <th style={{ width: '10%' }}>Attendance</th>
          <th style={{ width: '10%' }}>Employee ID</th>
          <th style={{ width: '30%' }}>Employee Name</th>
          <th style={{ width: '10%' }}>Date</th>
          <th style={{ width: '10%' }}>Time In</th>
          <th style={{ width: '10%' }}>Time Out</th>
          <th style={{ width: '10%' }}>Total of Hour</th>
          <th style={{ width: '10%' }}>Total OT Hour</th>
        </tr>
      </thead>
      <tbody>
        {data && data.length > 0 ? (
          data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td style={{ cursor: 'pointer' }}>{row.attendance}</td>
              <td style={{ cursor: 'pointer' }}>{row.employee_id}</td>
              <td style={{ cursor: 'pointer' }}>{row.employee_name}</td>
              <td style={{ cursor: 'pointer' }}>{row.date}</td>
              <td style={{ cursor: 'pointer' }}>{row.time_in}</td>
              <td style={{ cursor: 'pointer' }}>{row.time_out}</td>
              <td style={{ cursor: 'pointer' }}>{row.total_hours}</td>
              <td style={{ cursor: 'pointer' }}>{row.total_ot_hours}</td>
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
  );
}
