import React from 'react'


const Schedule = () => {

  return (
    <>
      <table border={"0"} width={'80%'} style={{marginTop: 10, marginLeft:335, position:"absolute"}}>
        <tr style={{backgroundColor: "#DDDDDD"}}>
          <td><strong>Employee Name</strong></td>
          <td width={'80%'}><center><strong>April</strong></center></td>
        </tr>
        <tr>
          <td></td>
          <td>Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday</td>
        </tr>
      </table>
    </>
  )
}

export default Schedule
