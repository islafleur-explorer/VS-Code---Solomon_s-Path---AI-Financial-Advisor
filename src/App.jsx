import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Import modules
import { AuthProvider, Login, Register, ProtectedRoute } from './modules/auth';
import { BudgetProvider } from './modules/budget';
import { Layout, Dashboard, BudgetPage, HomePage } from './modules/ui';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BudgetProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="budget" element={
                  <ProtectedRoute>
                    <BudgetPage />
                  </ProtectedRoute>
                } />
              </Route>
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </BudgetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
