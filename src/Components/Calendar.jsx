import React, { useState } from "react";
import { Calendar, Badge, List, HStack } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { Icon } from "@chakra-ui/react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { Box, Card } from "@mui/material";

// Sample to-do list based on selected date
function getTodoList(date) {
  if (!date) return [];

  const day = date.getDate();
  switch (day) {
    case 10:
      return [
        { time: "10:30 am", title: "Team Meeting" },
        { time: "12:00 pm", title: "Lunch with Client" },
      ];
    case 15:
      return [
        { time: "09:30 am", title: "Product Review" },
        { time: "12:30 pm", title: "Client Call" },
        { time: "02:00 pm", title: "Design Workshop" },
        { time: "05:00 pm", title: "Testing Session" },
        { time: "06:30 pm", title: "Progress Reporting" },
      ];
    default:
      return [];
  }
}

// Badge indicator for dates with tasks
function renderCell(date) {
  const list = getTodoList(date);
  return list.length ? <Badge className="calendar-todo-item-badge" /> : null;
}

// Main MiniCalendar component
export default function MiniCalendar({ selectRange }) { // Removed `...rest`
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "start" }}>
      <Card elevation={3}>
        <HStack spacing={10} style={{ height: 350, paddingTop: 5 }} alignItems="flex-start" wrap>
          <Calendar
            onChange={handleSelect}
            value={selectedDate}
            selectRange={selectRange}
            compact
            renderCell={renderCell}
            prevButton={<Icon as={MdChevronLeft} w="24px" h="24px" mt="4px" />}
            nextButton={<Icon as={MdChevronRight} w="24px" h="24px" mt="4px" />}
            style={{ width: 390 }}
          />
          <TodoList date={selectedDate} />
        </HStack>
      </Card>
    </Box>
  );
}

// To-do list display component
const TodoList = ({ date }) => {
  const list = getTodoList(date);

  if (!list.length) {
    return <Box sx={{ p: 2 }}>No tasks for this day.</Box>;
  }

  return (
    <List bordered style={{ flex: 1, minWidth: 200 }}>
      {list.map((item) => (
        <List.Item key={item.time}>
          <div>{item.time}</div>
          <div>{item.title}</div>
        </List.Item>
      ))}
    </List>
  );
};
