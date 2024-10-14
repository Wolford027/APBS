import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./MiniCalendar.css";
import { Text, Icon } from "@chakra-ui/react";
// Chakra imports
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
// Custom components
import Cards from "../Card";
import { Box, Card } from "@mui/material";
import CalendarModal from "../_Modals/CalendarModal";

export default function MiniCalendar(props) {
  const { selectRange, ...rest } = props;
  const [value, onChange] = useState(new Date());
  const [openModal, setOpenModal] = useState(false)

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'start'}}>
      <Card elevation={3}>
        <Cards
          align='center'
          direction='column'
          w='94%'
          maxW='max-content'
          p='10px 10px'
          h='max-content'
          {...rest}>
          <Calendar
            onChange={onChange}
            value={value}
            selectRange={selectRange}
            view={"month"}
            tileContent={<Text color='brand.500'></Text>}
            prevLabel={<Icon as={MdChevronLeft} w='24px' h='24px' mt='4px' />}
            nextLabel={<Icon as={MdChevronRight} w='24px' h='24px' mt='4px' />}
            onClickDay={handleOpenModal}
          />
          <CalendarModal onOpen={openModal} onClose={handleCloseModal} />
        </Cards>
      </Card>
    </Box>
  );
}