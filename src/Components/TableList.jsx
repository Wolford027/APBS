import * as React from 'react'
import Table from '@mui/joy/Table'

function createData(name, EmpN, EmpP) {
  return { name, EmpN, EmpP};
}

const rows = [
  createData('1', "Wolford Tempest", "Manager"),
  createData('2', "Shin Tempest", "Finance Head"),
  createData('3', "Gideon Villanueva", "Chef"),
  createData('4', "Ruti Gimber", "Cashier"),
  createData('5', "Erslet", "Assistant Manager"),
];

export default function TableHover() {
  return (
    <Table hoverRow sx={{marginTop:10, marginLeft:-12}}>
      <thead>
        <tr>
          <th style={{ width: '10%' }}>Employee Id</th>
          <th>Employee Name</th>
          <th>Employee Position</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td>{row.name}</td>
            <td>{row.EmpN}</td>
            <td>{row.EmpP}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}