import React, { useState, useEffect } from 'react'
import Table from '@mui/joy/Table'
import axios from 'axios'


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
          <th style={{ width: '10%' }}>ID No.</th>
          <th style={{ width: '30%' }} >Employee Name</th>
          <th>Time In</th>
          <th>Time Out</th>
          <th style={{ width: '10%' }}>Total of Hour</th>
          <th style={{ width: '10%' }}>Total OT Hour</th>
        </tr>
      </thead>
      <tbody>
        {timelist.map((time, key) => 
          <tr key={key}>
            <td style={{cursor:"pointer"}}>{time.id}</td>
            <td style={{cursor:"pointer"}}>{time.empName}</td>
            <td style={{cursor:"pointer"}}>{time.timeIn}</td>
            <td style={{cursor:"pointer"}}>{time.timeOut}</td>
            <td style={{cursor:"pointer"}}>{time.toh}</td>
            <td style={{cursor:"pointer"}}>{time.toth}</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}