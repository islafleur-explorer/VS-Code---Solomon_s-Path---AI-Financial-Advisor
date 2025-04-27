import { useState } from 'react';
import {
  ListItem,
  ListItemText,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import { useBudget } from './BudgetContext';

export default function BudgetSubcategory({ categoryId, subcategory }) {
  const {
    updateSubcategoryAmount,
    updateSubcategoryName,
    deleteSubcategory,
    moveSubcategoryUp,
    moveSubcategoryDown
  } = useBudget();

  const [amount, setAmount] = useState(subcategory.amount);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [subcategoryName, setSubcategoryName] = useState(subcategory.name);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleAmountBlur = () => {
    updateSubcategoryAmount(categoryId, subcategory.id, amount);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      updateSubcategoryAmount(categoryId, subcategory.id, amount);
      setIsEditing(false);
    }
  };

  const handleAmountClick = () => {
    setIsEditing(true);
  };

  // Function to handle focus on the amount field
  const handleAmountFocus = (event) => {
    // Select the entire text when the field receives focus
    event.target.select();
  };

  const handleDeleteSubcategory = () => {
    deleteSubcategory(categoryId, subcategory.id);
    setDeleteDialogOpen(false);
  };

  const handleNameChange = (e) => {
    setSubcategoryName(e.target.value);
  };

  const handleNameBlur = () => {
    if (subcategoryName.trim()) {
      updateSubcategoryName(categoryId, subcategory.id, subcategoryName);
    } else {
      setSubcategoryName(subcategory.name); // Reset to original if empty
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (subcategoryName.trim()) {
        updateSubcategoryName(categoryId, subcategory.id, subcategoryName);
      } else {
        setSubcategoryName(subcategory.name); // Reset to original if empty
      }
      setIsEditingName(false);
    }
  };

  const handleNameClick = () => {
    setIsEditingName(true);
  };

  const handleMoveUp = () => {
    moveSubcategoryUp(categoryId, subcategory.id);
  };

  const handleMoveDown = () => {
    moveSubcategoryDown(categoryId, subcategory.id);
  };

  return (
    <>
      <ListItem
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          <Tooltip title="Move up">
            <IconButton
              size="small"
              onClick={handleMoveUp}
              sx={{ p: 0.5 }}
            >
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Move down">
            <IconButton
              size="small"
              onClick={handleMoveDown}
              sx={{ p: 0.5 }}
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {isEditingName ? (
          <TextField
            autoFocus
            size="small"
            value={subcategoryName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            sx={{ flexGrow: 1, mr: 2 }}
          />
        ) : (
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="body1"
                  onClick={handleNameClick}
                  sx={{ cursor: 'pointer', flexGrow: 1 }}
                >
                  {subcategory.name}
                </Typography>
                <Tooltip title="Edit name">
                  <IconButton
                    size="small"
                    onClick={handleNameClick}
                    sx={{ ml: 1, p: 0.5 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
            secondary={subcategory.dueDate ? `Due: ${subcategory.dueDate}` : null}
          />
        )}

        {isEditing ? (
          <TextField
            autoFocus
            size="small"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            onKeyDown={handleKeyDown}
            onFocus={handleAmountFocus}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { step: "0.01", min: "0" }
            }}
            sx={{ width: '120px' }}
          />
        ) : (
          <Typography
            variant="body1"
            onClick={handleAmountClick}
            sx={{ cursor: 'pointer', minWidth: '80px', textAlign: 'right' }}
          >
            {formatCurrency(subcategory.amount)}
          </Typography>
        )}

        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ ml: 1 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </ListItem>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete {subcategory.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item from your budget?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteSubcategory} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
