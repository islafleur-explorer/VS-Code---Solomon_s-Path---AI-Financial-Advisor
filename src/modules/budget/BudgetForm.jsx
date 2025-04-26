import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Paper
} from '@mui/material';
import { useBudget } from './BudgetContext';

export default function BudgetForm({ onSuccess }) {
  const { categories, addBudgetItem } = useBudget();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.description || !formData.amount || !formData.categoryId) {
      return;
    }
    
    // Add budget item
    addBudgetItem(formData);
    
    // Reset form
    setFormData({
      description: '',
      amount: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Add Budget Item
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="description"
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="amount"
          label="Amount"
          name="amount"
          type="number"
          inputProps={{ step: "0.01" }}
          value={formData.amount}
          onChange={handleChange}
        />
        
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            label="Category"
            onChange={handleChange}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name} ({category.type})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="date"
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
        >
          Add Item
        </Button>
      </Box>
    </Paper>
  );
}
