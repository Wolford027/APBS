import * as React from 'react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Table from '@mui/joy/Table'
import { Button } from '@mui/material'


export default function TableList() {

  const [emplist,setEmplist] = useState([]);
  useEffect(() => {
    getEmp();
  }, []);

  function getEmp(){
    axios.get('http://localhost/Another1/APBS/api/user/').then(function(response){
      console.log(response.data);
      setEmplist(response.data);
    });
  }


  return (
    <Table hoverRow sx={{marginTop:10, marginLeft:-12}} borderAxis='both'>
      <thead>
        <tr>
          <th style={{ width: '10%' }}>Employee Id</th>
          <th style={{ width: '20%' }}>Employee Name</th>
          <th >Employee Position</th>
          <th>Configuration</th>
        </tr>
      </thead>
      <tbody>
        {emplist.map((emp, key) =>
        <tr key={key}>
          <td>{emp.id}</td>
          <td>{emp.empName}</td>
          <td>{emp.position}</td>
          <td>
            <Button variant='contained' style={{marginRight: 5, width: '25%', fontSize: 12, fontWeight: 'bold'}}>Update</Button>
            <Button variant='contained' style={{width: '25%', fontSize: 12, fontWeight: 'bold'}}>Archive</Button>
          </td>
        </tr>
        )}
      </tbody>
    </Table>
  );
}