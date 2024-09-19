import React, { useState, useEffect } from 'react'
import Table from '@mui/joy/Table'
import axios from 'axios'


export default function TableAttendance() {

 // const [timelist, setTimelist] = useState([]);
 // useEffect(() => {
 //   getTime();
  //}, [timelist]);

  //function getTime(){
  //  axios.get('http://localhost/Another1/APBS/api/user/timelist/').then(function(response){
  //    console.log(response.data);
  ////    setTimelist(response.data);
 //   });
  //}


  return (
    <Table hoverRow sx={{}} borderAxis='both'>
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
       
          <tr >
            <td style={{cursor:"pointer"}}>{}</td>
            <td style={{cursor:"pointer"}}>{}</td>
            <td style={{cursor:"pointer"}}>{}</td>
            <td style={{cursor:"pointer"}}>{}</td>
            <td style={{cursor:"pointer"}}>{}</td>
            <td style={{cursor:"pointer"}}>{}</td>
            <td style={{cursor:"pointer"}}>{}</td>
            <td style={{cursor:"pointer"}}>{}</td>
          </tr>
        
      </tbody>
    </Table>
  );
}