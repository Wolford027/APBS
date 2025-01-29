import React, { useState } from "react";
import { Calendar, HStack } from "rsuite"; // Importing Calendar from rsuite
import "rsuite/dist/rsuite.min.css"; // Import rsuite styles
import { Text, Icon } from "@chakra-ui/react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import Cards from "../Card";
import { Box, Card } from "@mui/material";
import CalendarModal from "../_Modals/CalendarModal";

export default function MiniCalendar(props) {
  const { selectRange, ...rest } = props;
  const [value, onChange] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "start" }}>
      <Card elevation={3}>
        <HStack spacing={10} style={{ height: 320 }} alignItems="flex-start" wrap>
          <Calendar
            onChange={onChange}
            value={value}
            selectRange={selectRange}
            compact // Use the compact mode for a more compact calendar view
            prevButton={<Icon as={MdChevronLeft} w="24px" h="24px" mt="4px" />}
            nextButton={<Icon as={MdChevronRight} w="24px" h="24px" mt="4px" />}
            onSelect={handleOpenModal}
          />
          <CalendarModal onOpen={openModal} onClose={handleCloseModal} />
        </HStack>
      </Card>
    </Box>
  );
}
