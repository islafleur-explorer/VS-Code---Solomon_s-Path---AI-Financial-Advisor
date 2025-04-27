import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useBudget } from './BudgetContext';
import BudgetCategory from './BudgetCategory';
import MonthSelector from './MonthSelector';

export default function BudgetTemplate() {
  const {
    budgetTemplate,
    resetBudget,
    calculateSummary,
    currentMonth,
    currentYear,
    activeTab,
    setActiveTab,
    createNextMonthBudget
  } = useBudget();

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const summary = calculateSummary();

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleResetBudget = () => {
    resetBudget();
    setResetDialogOpen(false);
  };

  return (
    <Box>
      {/* Month/Year Header */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          p: 2,
          mb: 0,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4
        }}
      >
        <MonthSelector />
      </Paper>

      {/* Planned Tab */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          mb: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          textAlign: 'center',
          py: 1
        }}
      >
        <Typography variant="h6">
          PLANNED
        </Typography>
      </Paper>

      {/* Budget Balance */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {formatCurrency(summary.balance)} left to budget
        </Typography>
      </Paper>

      {/* Budget Categories */}
      {budgetTemplate.map((category) => (
        <BudgetCategory
          key={category.id}
          category={category}
        />
      ))}

      {/* Reset Budget Button */}
      <Box sx={{ mt: 3, mb: 5, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={() => setResetDialogOpen(true)}
        >
          Reset Budget
        </Button>
      </Box>

      {/* Reset Budget Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      >
        <DialogTitle>Reset Budget</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset your budget to the default template? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetBudget} color="error">Reset</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
