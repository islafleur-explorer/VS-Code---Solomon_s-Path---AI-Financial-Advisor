import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Box, Typography, Paper, Grid, Link } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useBudget } from './BudgetContext';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function BudgetPieChart() {
  const { budgetTemplate, calculateSummary, currentMonth, currentYear } = useBudget();
  const [chartData, setChartData] = useState({
    labels: ['Needs (50%)', 'Wants (30%)', 'Savings (20%)'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  });
  const [idealAllocation, setIdealAllocation] = useState({ needs: 0, wants: 0, savings: 0 });
  const [actualAllocation, setActualAllocation] = useState({ needs: 0, wants: 0, savings: 0 });

  // Update chart data whenever budget changes
  useEffect(() => {
    const summary = calculateSummary();
    const totalIncome = summary.totalIncome;

    // Calculate ideal 50/30/20 allocation
    const ideal = {
      needs: totalIncome * 0.5,
      wants: totalIncome * 0.3,
      savings: totalIncome * 0.2,
    };
    setIdealAllocation(ideal);

    // Calculate actual allocation based on budget categories
    const actual = {
      needs: 0,
      wants: 0,
      savings: 0,
    };

    // Categorize each budget item
    budgetTemplate.forEach(category => {
      // Skip income categories
      if (category.type === 'income') return;

      // Calculate total for this category
      const categoryTotal = category.subcategories.reduce(
        (sum, subcategory) => sum + (parseFloat(subcategory.amount) || 0),
        0
      );

      // Assign to the appropriate bucket based on category type or ID
      if (category.type === 'savings' || category.id === 'debt' || category.id === 'emergency_fund') {
        actual.savings += categoryTotal;
      } else if (['housing', 'transportation', 'food', 'health', 'insurance', 'utilities', 'childcare'].includes(category.id)) {
        actual.needs += categoryTotal;
      } else {
        actual.wants += categoryTotal;
      }
    });

    setActualAllocation(actual);

    // Update chart data
    setChartData({
      labels: ['Needs (50%)', 'Wants (30%)', 'Savings (20%)'],
      datasets: [
        {
          data: [actual.needs, actual.wants, actual.savings],
          backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0'],
          hoverBackgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0'],
        },
      ],
    });
  }, [budgetTemplate, calculateSummary]);

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Calculate percentages of total income
  const calculatePercentage = (amount) => {
    const summary = calculateSummary();
    const totalIncome = summary.totalIncome;
    return totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) + '%' : '0%';
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        50/30/20 Budget Rule - {currentMonth} {currentYear}
      </Typography>

      <Typography variant="body2" paragraph>
        The 50/30/20 rule suggests spending 50% of your income on needs, 30% on wants, and 20% on savings and debt repayment.
        <Box component="span" sx={{ ml: 1 }}>
          <Link
            href="https://www.investopedia.com/ask/answers/022916/what-502030-budget-rule.asp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
          </Link>
        </Box>
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 300 }}>
            <Pie data={chartData} options={{ maintainAspectRatio: false }} />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Your Allocation</Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Needs: {formatCurrency(actualAllocation.needs)} ({calculatePercentage(actualAllocation.needs)})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ideal: {formatCurrency(idealAllocation.needs)} (50%)
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Wants: {formatCurrency(actualAllocation.wants)} ({calculatePercentage(actualAllocation.wants)})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ideal: {formatCurrency(idealAllocation.wants)} (30%)
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Savings: {formatCurrency(actualAllocation.savings)} ({calculatePercentage(actualAllocation.savings)})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ideal: {formatCurrency(idealAllocation.savings)} (20%)
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
