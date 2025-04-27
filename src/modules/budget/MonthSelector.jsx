import { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useBudget } from './BudgetContext';
import { useAuth } from '../auth';

export default function MonthSelector() {
  const {
    currentMonth,
    currentYear,
    goToNextMonth,
    goToPreviousMonth,
    goToMonth,
    isMonthInFuture,
    isMonthInPast,
    isCurrentMonth,
    createNewMonthBudget
  } = useBudget();

  const { currentUser } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [futureMonthDialog, setFutureMonthDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState({ month: '', year: 0 });

  // Generate a list of months to display in the dropdown
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    const currentMonthDate = new Date(`${currentMonth} 1, ${currentYear}`);
    const todayMonth = today.toLocaleString('default', { month: 'long' });
    const todayYear = today.getFullYear();

    // Add previous 3 months
    for (let i = 3; i >= 1; i--) {
      const prevDate = new Date(today);
      prevDate.setMonth(today.getMonth() - i);
      const prevMonth = prevDate.toLocaleString('default', { month: 'long' });
      const prevYear = prevDate.getFullYear();

      // Check if this month has data
      const monthKey = `${prevMonth}_${prevYear}`;
      const hasData = localStorage.getItem(`budget_template_${currentUser?.id}_${monthKey}`) !== null;

      options.push({
        month: prevMonth,
        year: prevYear,
        label: `${prevMonth} ${prevYear}${hasData ? '' : ' (Blank)'}`,
        isPast: true,
        hasData: hasData
      });
    }

    // Add current month (today's month)
    options.push({
      month: todayMonth,
      year: todayYear,
      label: `${todayMonth} ${todayYear} (Current)`,
      isCurrent: true,
      hasData: true
    });

    // Add next 12 months
    for (let i = 1; i <= 12; i++) {
      const futureDate = new Date(today);
      futureDate.setMonth(today.getMonth() + i);
      const futureMonth = futureDate.toLocaleString('default', { month: 'long' });
      const futureYear = futureDate.getFullYear();

      // Check if this month has data
      const monthKey = `${futureMonth}_${futureYear}`;
      const hasData = localStorage.getItem(`budget_template_${currentUser?.id}_${monthKey}`) !== null;

      options.push({
        month: futureMonth,
        year: futureYear,
        label: `${futureMonth} ${futureYear}${hasData ? '' : ' (Blank)'}`,
        isFuture: true,
        hasData: hasData
      });
    }

    return options;
  };

  const monthOptions = getMonthOptions();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMonthSelect = (month, year) => {
    // Check if this month has data
    const monthKey = `${month}_${year}`;
    const hasData = localStorage.getItem(`budget_template_${currentUser?.id}_${monthKey}`) !== null;

    // Check if this is a future or past month without data
    if ((isMonthInFuture(month, year) || isMonthInPast(month, year)) && !hasData) {
      // For future or past months without data, show a dialog asking if the user wants to create a new budget
      setSelectedMonth({ month, year });
      setFutureMonthDialog(true);
    } else {
      // For current month or months with data, just navigate to that month
      goToMonth(month, year);
    }
    handleClose();
  };

  const handleCreateNewMonth = () => {
    // Create a new budget for the selected month BEFORE navigating
    createNewMonthBudget(selectedMonth.month, selectedMonth.year);

    // Then navigate to the selected month
    goToMonth(selectedMonth.month, selectedMonth.year);

    // Close the dialog
    setFutureMonthDialog(false);
  };

  const handleCancelNewMonth = () => {
    // Just close the dialog without creating a new month
    setFutureMonthDialog(false);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <IconButton
        onClick={() => {
          // Check if previous month is in the past
          const currentDate = new Date(`${currentMonth} 1, ${currentYear}`);
          const prevDate = new Date(currentDate);
          prevDate.setMonth(currentDate.getMonth() - 1);
          const prevMonth = prevDate.toLocaleString('default', { month: 'long' });
          const prevYear = prevDate.getFullYear();

          // Check if this month has data
          const monthKey = `${prevMonth}_${prevYear}`;
          const hasData = localStorage.getItem(`budget_template_${currentUser?.id}_${monthKey}`) !== null;

          if (isMonthInPast(prevMonth, prevYear) && !hasData) {
            // For past months without data, show the dialog
            setSelectedMonth({ month: prevMonth, year: prevYear });
            setFutureMonthDialog(true);
          } else {
            // For current month or months with data, just navigate
            goToMonth(prevMonth, prevYear);
          }
        }}
        color="inherit"
        aria-label="previous month"
      >
        <ArrowBackIosNewIcon />
      </IconButton>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          onClick={handleClick}
          color="inherit"
          aria-label="select month"
          aria-controls={open ? 'month-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{ mr: 1 }}
        >
          <CalendarMonthIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          {currentMonth} {currentYear}
        </Typography>
      </Box>

      <IconButton
        onClick={() => {
          // Check if next month is in the future
          const currentDate = new Date(`${currentMonth} 1, ${currentYear}`);
          const nextDate = new Date(currentDate);
          nextDate.setMonth(currentDate.getMonth() + 1);
          const nextMonth = nextDate.toLocaleString('default', { month: 'long' });
          const nextYear = nextDate.getFullYear();

          // Check if this month has data
          const monthKey = `${nextMonth}_${nextYear}`;
          const hasData = localStorage.getItem(`budget_template_${currentUser?.id}_${monthKey}`) !== null;

          if (isMonthInFuture(nextMonth, nextYear) && !hasData) {
            // For future months without data, show the dialog
            setSelectedMonth({ month: nextMonth, year: nextYear });
            setFutureMonthDialog(true);
          } else {
            // For current or past months or months with data, just navigate
            goToMonth(nextMonth, nextYear);
          }
        }}
        color="inherit"
        aria-label="next month"
      >
        <ArrowForwardIosIcon />
      </IconButton>

      <Menu
        id="month-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'month-selector-button',
        }}
      >
        {monthOptions.map((option, index) => (
          <div key={option.label}>
            {option.isCurrent && index > 0 && <Divider />}
            <MenuItem
              onClick={() => handleMonthSelect(option.month, option.year)}
              selected={option.month === currentMonth && option.year === currentYear}
              sx={{
                fontWeight: option.isCurrent ? 'bold' : 'normal',
                bgcolor: option.isCurrent ? 'action.selected' : 'inherit',
                color: (!option.hasData && (option.isPast || option.isFuture)) ? 'text.disabled' : 'inherit',
                fontStyle: (!option.hasData && (option.isPast || option.isFuture)) ? 'italic' : 'normal'
              }}
            >
              {option.label}
            </MenuItem>
            {option.isCurrent && <Divider />}
          </div>
        ))}
      </Menu>

      {/* Dialog for creating a new month budget */}
      <Dialog
        open={futureMonthDialog}
        onClose={handleCancelNewMonth}
        aria-labelledby="month-dialog-title"
        aria-describedby="month-dialog-description"
      >
        <DialogTitle id="month-dialog-title">
          Create Budget for {selectedMonth.month} {selectedMonth.year}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="month-dialog-description">
            {isMonthInFuture(selectedMonth.month, selectedMonth.year)
              ? "Would you like to create a budget for this future month? The previous month's budget will be used as a template, preserving all your entered amounts."
              : "Would you like to create a budget for this past month? Your default budget template will be used as a starting point."
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNewMonth}>Cancel</Button>
          <Button onClick={handleCreateNewMonth} variant="contained" color="primary">
            Create Budget
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
