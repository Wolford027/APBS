import * as React from 'react';
import Table from '@mui/joy/Table';

function createData(id, EmpN, EmpI, EmpO) {
  return { id, EmpN, EmpI, EmpO};
}

const rows = [
  createData('1', "Wolford Tempest", "8:00am", "6:00pm"),
  createData('2', "Shin Tempest", "8:00am", "6:00pm"),
  createData('3', "Gideon Villanueva", "8:00am", "6:00pm"),
  createData('4', "Ruti Gimber", "8:00am", "6:00pm"),
  createData('5', "Erslet", "8:00am", "6:00pm"),
];

export default function TableHover() {
  return (
    <Table hoverRow sx={{marginTop:10, marginLeft:-12}} borderAxis='both'>
      <thead>
        <tr>
          <th style={{ width: '100px' }}>ID No.</th>
          <th>Employee Name</th>
          <th>Time In</th>
          <th>Time Out</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td style={{cursor:"pointer"}}>{row.id}</td>
            <td style={{cursor:"pointer"}}>{row.EmpN}</td>
            <td style={{cursor:"pointer"}}>{row.EmpI}</td>
            <td style={{cursor:"pointer"}}>{row.EmpO}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}