import { 
  Paper, 
  Typography, 
  Grid, 
  Box,
  Divider
} from '@mui/material';
import { useBudget } from './BudgetContext';

export default function BudgetSummary() {
  const { calculateSummary } = useBudget();
  const summary = calculateSummary();

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Budget Summary
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Total Income
            </Typography>
            <Typography variant="h6" color="success.main">
              {formatCurrency(summary.totalIncome)}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Total Expenses
            </Typography>
            <Typography variant="h6" color="error.main">
              {formatCurrency(summary.totalExpenses)}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Total Savings
            </Typography>
            <Typography variant="h6" color="info.main">
              {formatCurrency(summary.totalSavings)}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Balance
            </Typography>
            <Typography 
              variant="h6" 
              color={summary.balance >= 0 ? 'success.main' : 'error.main'}
            >
              {formatCurrency(summary.balance)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {summary.balance >= 0 
            ? 'You are on track with your budget!' 
            : 'You are spending more than your income. Consider adjusting your budget.'}
        </Typography>
      </Box>
    </Paper>
  );
}
