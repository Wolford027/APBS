import React, { useState, useEffect } from 'react'
import Table from '@mui/joy/Table'
import axios from 'axios'

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

export default function TableAttendance() {

  const [timelist, setTimelist] = useState([]);
  useEffect(() => {
    getTime();
  }, []);

  function getTime(){
    axios.get('http://localhost/Another1/APBS/api/user/timelist/').then(function(response){
      console.log(response.data);
      setTimelist(response.data);
    });
  }


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
        {timelist.map((time, key) => 
          <tr key={key}>
            <td style={{cursor:"pointer"}}>{time.id}</td>
            <td style={{cursor:"pointer"}}>{time.empName}</td>
            <td style={{cursor:"pointer"}}>{time.timeIn}</td>
            <td style={{cursor:"pointer"}}>{time.timeOut}</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}