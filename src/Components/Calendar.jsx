import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.module.css'
import { Box, Badge } from '@mui/material'

export default function Calendar() {
    const [selectedDate, setSelectedDate] = useState(null)

    const handleDateChange = (date) => {
        setSelectedDate(date)
    }

    const isSundayInCurrentMonth = (date) => {
        const day = date.getDay();
        const currentMonth = new Date().getMonth();
        const selectedMonth = date.getMonth();
    
        return day === 0 && selectedMonth === currentMonth;
    };
    
    const isInCurrentMonth = (date) => {
        const currentMonth = new Date().getMonth();
        const selectedMonth = date.getMonth();
    
        return selectedMonth === currentMonth;
    };
    
    const filterDates = (date) => {
        return isInCurrentMonth(date) && !isSundayInCurrentMonth(date);
    };

    const isToday = (date) => {
        const today = new Date();
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
    };

    const renderDayContents = (day, date) => {
        const importantDays = [5, 10]; // Example: Show badge on the 5th, 10th, and 15th of the month
        const isImportantDay = importantDays.includes(date.getDate());
        const todayHighlight = isToday(date);
    
        return (
          <Badge
            color="primary"
            badgeContent={isImportantDay ? '!' : 0}
            invisible={!isImportantDay}
          >
            <span
              style={{
                fontWeight: todayHighlight ? 'bold' : 'normal',
                backgroundColor: todayHighlight ? '#bad9f1' : 'inherit',
                borderBottom: todayHighlight ? '2px solid black' : 'none',
              }}
            >
              {day}
            </span>
          </Badge>
        );
      };

  return (
    <Box sx={{
        display: 'flex',
        width: { xs: '90%', sm: '75%', md: '50%', lg: '30%' },
        margin: 'auto',
        marginTop: 3,
      }}>
        <DatePicker
            inline
            onChange={handleDateChange}
            dateFormat='MM/dd/yyyy'
            renderDayContents={(day, date) => renderDayContents(day, date)}
            filterDate={filterDates}
             />
    </Box>
  )
}
