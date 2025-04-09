import React, { useState, useEffect } from "react";
import { Calendar, Badge, List, HStack } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { Icon } from "@chakra-ui/react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { Box, Card, Typography } from "@mui/material";
import axios from 'axios';

// Fetch holidays using axios
const fetchHolidays = async (year) => {
  try {
    const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/PH`);
    return response.data.map((holiday) => ({
      date: new Date(holiday.date),
      title: holiday.localName || holiday.name,
    }));
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return [];
  }
};

export default function MiniCalendar({ selectRange }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [endDates, setEndDates] = useState([]);

  // Fetch holidays and termination dates when the component loads
  useEffect(() => {
    const year = new Date().getFullYear();
    fetchHolidays(year).then(setHolidays);
    fetchEndDates().then(setEndDates);
  }, []);

  // Function to check if a date is a holiday
  const getHolidayList = (date) => {
    return holidays.filter(
      (holiday) => holiday.date.toDateString() === date.toDateString()
    );
  };

  // Fetch employee termination dates using axios
  const fetchEndDates = async () => {
    try {
      const response = await axios.get('http://localhost:8800/end-date');
  
      console.log("Fetched End Dates:", response.data); // Debugging log
  
      if (!Array.isArray(response.data)) {
        console.error("Error: Expected an array but got:", response.data);
        return [];
      }
  
      return response.data.map((employee) => {
        const date = new Date(employee.emp_dateend);
        date.setHours(0, 0, 0, 0); // Normalize to midnight to avoid timezone shifts
        return {
          date,
          name: `${employee.l_name}, ${employee.f_name} ${employee.m_name ? employee.m_name.charAt(0) + "." : ""}`,
        };
      });
  
    } catch (error) {
      console.log("Error fetching termination dates:", error);
      return [];
    }
  };  

  // Function to check if a date has an employee termination
  const getEndDateList = (date) => {
    return endDates.filter((endDate) => 
      endDate.date.toISOString().split("T")[0] === date.toISOString().split("T")[0]
    );
  };

  // Badge indicator for holidays and terminations
  const renderCell = (date) => {
    const holidayList = getHolidayList(date);
    const endDateList = getEndDateList(date);

    return (
      <>
        {holidayList.length > 0 && <Badge className="calendar-todo-item-badge" />}
        {endDateList.length > 0 && <Badge className="calendar-todo-item-badge" />}
      </>
    );
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "start" }}>
      <Card elevation={3} sx={{ width: 1100}}>
        <HStack spacing={10} style={{ height: 350, padding: 15 }} alignItems="flex-start" wrap>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            selectRange={selectRange}
            compact
            renderCell={renderCell}
            prevButton={<Icon as={MdChevronLeft} w="24px" h="24px" mt="4px" />}
            nextButton={<Icon as={MdChevronRight} w="24px" h="24px" mt="4px" />}
            style={{ width: 390 }}
          />
          <EventList date={selectedDate} holidays={holidays} endDates={endDates} />
        </HStack>
      </Card>
    </Box>
  );
}

// List display component for holidays and terminations
const EventList = ({ date, holidays, endDates }) => {
  if (!date) return <Box sx={{ p: 2 }}>Select a date to see events.</Box>;

  const holidayList = holidays.filter(
    (holiday) => holiday.date.toDateString() === date.toDateString()
  );
  const endDateList = endDates.filter(
    (endDate) => endDate.date.toDateString() === date.toDateString()
  );

  return (
    <List bordered style={{ flex: 1, minWidth: 200 }}>
      {holidayList.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ p: 1, fontWeight: "bold" }}>Holidays</Typography>
          {holidayList.map((item, index) => (
            <List.Item key={index}>
              <Typography variant="body1">{item.title}</Typography>
            </List.Item>
          ))}
        </>
      )}

      {endDateList.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ p: 1, fontWeight: "bold", color: "red" }}>Terminations</Typography>
          {endDateList.map((item, index) => (
            <List.Item key={index}>
              <Typography variant="body1">{item.name} (Will be Terminated)</Typography>
            </List.Item>
          ))}
        </>
      )}

      {holidayList.length === 0 && endDateList.length === 0 && (
        <Typography variant="body2" sx={{ p: 2 }}>No events on this day.</Typography>
      )}
    </List>
  );
};