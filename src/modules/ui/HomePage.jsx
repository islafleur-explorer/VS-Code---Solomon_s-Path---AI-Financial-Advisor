import { 
  Typography, 
  Box, 
  Button, 
  Container, 
  Grid, 
  Paper,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText', 
          py: 8, 
          mb: 4,
          borderRadius: 1
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom>
            Solomon's Path
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Your Personal Financial Advisor
          </Typography>
          <Typography variant="body1" paragraph>
            Take control of your finances with our simple yet powerful budgeting tool.
            Track expenses, set savings goals, and make informed financial decisions.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>
      
      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Features
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Budget Creation
                </Typography>
                <Typography variant="body1">
                  Create a personalized budget with customizable categories for income, expenses, and savings.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/register')}>
                  Try It
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Expense Tracking
                </Typography>
                <Typography variant="body1">
                  Track your daily expenses and income to stay on top of your financial situation.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/register')}>
                  Try It
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Financial Insights
                </Typography>
                <Typography variant="body1">
                  Get insights and summaries of your financial health with easy-to-understand visualizations.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/register')}>
                  Try It
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to take control of your finances?
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/register')}
            sx={{ mt: 2 }}
          >
            Create Your Account
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
