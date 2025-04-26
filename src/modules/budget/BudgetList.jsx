import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton,
  Typography,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useBudget } from './BudgetContext';

export default function BudgetList() {
  const { budgetItems, categories, deleteBudgetItem } = useBudget();

  // Get category name by id
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Get category type by id
  const getCategoryType = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.type : 'expense';
  };

  // Format amount based on category type
  const formatAmount = (amount, categoryId) => {
    const type = getCategoryType(categoryId);
    const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    
    return type === 'income' ? `+${formattedAmount}` : formattedAmount;
  };

  // Sort budget items by date (newest first)
  const sortedItems = [...budgetItems].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  if (budgetItems.length === 0) {
    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="body1">
          No budget items yet. Add your first item using the form above.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="budget items table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedItems.map((item) => (
            <TableRow
              key={item.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {new Date(item.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{getCategoryName(item.categoryId)}</TableCell>
              <TableCell align="right" 
                sx={{ 
                  color: getCategoryType(item.categoryId) === 'income' ? 'success.main' : 
                         getCategoryType(item.categoryId) === 'savings' ? 'info.main' : 'error.main'
                }}
              >
                {formatAmount(item.amount, item.categoryId)}
              </TableCell>
              <TableCell align="center">
                <IconButton 
                  aria-label="delete" 
                  color="error"
                  onClick={() => deleteBudgetItem(item.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
