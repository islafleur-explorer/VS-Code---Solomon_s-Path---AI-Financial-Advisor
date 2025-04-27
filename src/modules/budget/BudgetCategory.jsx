import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useBudget } from './BudgetContext';
import BudgetSubcategory from './BudgetSubcategory';

export default function BudgetCategory({ category }) {
  const { addSubcategory } = useBudget();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  const handleAddSubcategory = () => {
    if (newSubcategoryName.trim()) {
      addSubcategory(category.id, newSubcategoryName.trim());
      setNewSubcategoryName('');
      setAddDialogOpen(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ mb: 2, overflow: 'hidden' }}>
      {/* Category Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: category.id === 'debt' ? 'error.light' :
                  category.type === 'income' ? 'success.light' :
                  category.type === 'savings' ? 'info.light' : 'grey.100',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" component="h3">
          {category.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Planned
        </Typography>
      </Box>

      <Divider />

      {/* Subcategories */}
      <List disablePadding>
        {category.subcategories.map((subcategory) => (
          <BudgetSubcategory
            key={subcategory.id}
            categoryId={category.id}
            subcategory={subcategory}
          />
        ))}

        {/* Add Item Button */}
        <ListItem
          button
          onClick={() => setAddDialogOpen(true)}
          sx={{
            color: 'primary.main',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ListItemText
            primary={
              <Typography color="primary">
                {category.id === 'income' ? 'Add Income' : `Add Item`}
              </Typography>
            }
          />
        </ListItem>
      </List>

      {/* Add Subcategory Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add to {category.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for the new {category.type} item.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={newSubcategoryName}
            onChange={(e) => setNewSubcategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSubcategory} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
