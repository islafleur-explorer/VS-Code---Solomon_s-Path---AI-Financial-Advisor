import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Button 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { BudgetSummary } from '../budget';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {currentUser.username}!
      </Typography>
      
      <Typography variant="body1" paragraph>
        This is your financial dashboard. Here you can see an overview of your budget and financial status.
      </Typography>
      
      <BudgetSummary />
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/budget')}
              >
                Manage Budget
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Tips & Advice
            </Typography>
            <Typography variant="body2" paragraph>
              • Track your expenses regularly to stay on top of your finances.
            </Typography>
            <Typography variant="body2" paragraph>
              • Aim to save at least 20% of your income each month.
            </Typography>
            <Typography variant="body2" paragraph>
              • Review your budget monthly and adjust as needed.
            </Typography>
            <Typography variant="body2">
              • Pay off high-interest debt first to save money in the long run.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
