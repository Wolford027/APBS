import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { StaticDatePicker } from '@mui/x-date-pickers';

function getRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function fakeFetch(date, { signal }) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const daysInMonth = date.daysInMonth();
      const daysToHighlight = [1, 2, 3].map(() => getRandomNumber(1, daysInMonth));

      resolve({ daysToHighlight });
    }, 500);

    signal.onabort = () => {
      clearTimeout(timeout);
      reject(new DOMException('aborted', 'AbortError'));
    };
  });
}

export default function DateCalendarServerRequest() {
  const requestAbortController = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialValue, setInitialValue] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [inputEvent, setInputEvent] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    setInitialValue(dayjs());
  }, []);

  const fetchHighlightedDays = (date) => {
    const controller = new AbortController();
    fakeFetch(date, {
      signal: controller.signal,
    })
      .then(({ daysToHighlight }) => {
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          throw error;
        }
      });

    requestAbortController.current = controller;
  };

  const handleMonthChange = (date) => {
    if (requestAbortController.current) {
      requestAbortController.current.abort();
    }

    setIsLoading(true);
    fetchHighlightedDays(date);
  };

  const handleDayClick = (date, event) => {
    const newEvents = [...events, { date, event }];
    setEvents(newEvents);
    setInputEvent('');
    setAnchorEl(date);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StaticDatePicker
        orientation="landscape"
        defaultValue={initialValue}
        loading={isLoading}
        onMonthChange={handleMonthChange}
        renderLoading={() => <DayCalendarSkeleton />}
        slots={{
          day: (props) => (
            <ServerDay
              {...props}
              events={events}
              handlePopoverOpen={handleDayClick}
            />
          ),
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
      >
        <div>
            <input
                type="text"
                value={inputEvent}
                onChange={(e) => setInputEvent(e.target.value)}
                placeholder="Enter event"
            />
            <button onClick={() => handleDayClick(initialValue, inputEvent)}>Set Event</button>
        </div>
        <Typography sx={{ p: 2 }}>
          {events.find((event) => dayjs(event.date).isSame(anchorEl, 'day'))?.event}
        </Typography>
      </Popover>
    </LocalizationProvider>
  );
}

function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, events, handlePopoverOpen, ...other } = props;

  const isSelected = !outsideCurrentMonth && highlightedDays.indexOf(day.date()) >= 0;

  const eventForDay = events.find((event) => dayjs(event.date).isSame(day, 'day'));

  const handleClick = () => {
    handlePopoverOpen(day, eventForDay?.event);
  };

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={isSelected ? undefined : eventForDay ? '🎉' : undefined}
      onClick={handleClick}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}
