import * as React from 'react';
import Table from '@mui/joy/Table';
import TextField from '@mui/material/TextField';

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
  const [schedule, setSchedule] = React.useState(() => {
    // Initialize schedule with empty time slots for each date and employee
    const initialSchedule = {};
    dates.forEach(date => {
      initialSchedule[date.toISOString().split('T')[0]] = employees.map(() => (''));
    });
    return initialSchedule;
  });

  const handleTimeChange = (event, dateIndex, employeeIndex) => {
    const updatedSchedule = { ...schedule };
    updatedSchedule[dates[dateIndex].toISOString().split('T')[0]][employeeIndex] = event.target.value;
    setSchedule(updatedSchedule);
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
                <TextField
                  type="time"
                  value={schedule[date.toISOString().split('T')[0]][employeeIndex]}
                  onChange={(event) => handleTimeChange(event, dateIndex, employeeIndex)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                  sx={{ width: '120px' }} // Adjust the width of the input field
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
