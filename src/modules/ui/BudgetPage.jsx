import { Typography, Box } from '@mui/material';
import { BudgetForm, BudgetList, BudgetSummary } from '../budget';

export default function BudgetPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Budget Management
      </Typography>
      
      <Typography variant="body1" paragraph>
        Create and manage your budget by adding income, expenses, and savings.
      </Typography>
      
      <BudgetSummary />
      <BudgetForm />
      
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Budget Items
      </Typography>
      
      <BudgetList />
    </Box>
  );
}
