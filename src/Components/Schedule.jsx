import * as React from 'react'
import Table from '@mui/joy/Table'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'


// Helper function to generate dates for the table rows
function generateDates(startDate, days) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
}

// Generate dates for the next 7 days
const currentDate = new Date();
const daysToShow = 7;
const dates = generateDates(currentDate, daysToShow);

// Sample data for employees
const employees = [
  'Wolford Tempest',
  'James Villanueva',
  'Anarizdel Vitan',
  'Kristle Villareal',
  'Reign Reyes',
];

export default function EmployeeScheduler() {
  const [attendance, setAttendance] = React.useState(() => {
    // Initialize attendance with empty status for each date and employee
    const initialAttendance = {};
    dates.forEach(date => {
      initialAttendance[date.toISOString().split('T')[0]] = employees.map(() => (''));
    });
    return initialAttendance;
  });

  const handleAttendanceChange = (status, dateIndex, employeeIndex) => {
    const updatedAttendance = { ...attendance };
    updatedAttendance[dates[dateIndex].toISOString().split('T')[0]][employeeIndex] = status;
    setAttendance(updatedAttendance);
  };

  return (
    <Table borderAxis="both" sx={{ position: "absolute", marginTop: 5, marginLeft: 40, width: '82.4%' }}>
      <thead>
        <tr>
          <th style={{ width: "15%" }}>Employee</th>
          {dates.map((date, index) => (
            <th key={index}>{date.toLocaleDateString()}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {employees.map((employee, employeeIndex) => (
          <tr key={employeeIndex}>
            <td>{employee}</td>
            {dates.map((date, dateIndex) => (
              <td key={dateIndex}>
                <Select
                fullWidth
                  value={attendance[date.toISOString().split('T')[0]][employeeIndex]}
                  onChange={(event) => handleAttendanceChange(event.target.value, dateIndex, employeeIndex)}
                >
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                </Select>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
