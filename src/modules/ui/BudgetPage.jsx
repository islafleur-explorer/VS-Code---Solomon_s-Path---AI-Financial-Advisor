import { Typography, Box } from '@mui/material';
import { BudgetSummary, BudgetTemplate } from '../budget';

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
      <BudgetTemplate />
    </Box>
  );
}
