import * as React from 'react';
import Table from '@mui/joy/Table';

function createData(name, EmpN, EmpS) {
  return { name, EmpN, EmpS};
}

const rows = [
  createData('1', "Wolford Tempest", "Present"),
  createData('2', "Shin Tempest", "Present"),
  createData('3', "Gideon Villanueva", "Absent"),
  createData('4', "Ruti Gimber", "Absent"),
  createData('5', "Erslet", "Present"),
];

export default function TableHover() {
  return (
    <Table hoverRow sx={{marginTop:10, marginLeft:-12}}>
      <thead>
        <tr>
          <th style={{ width: '10%' }}>Employee Id</th>
          <th>Employee Name</th>
          <th>Employee Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td>{row.name}</td>
            <td>{row.EmpN}</td>
            <td>{row.EmpS}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}