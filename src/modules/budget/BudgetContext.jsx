import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../auth';

// Create the budget context
const BudgetContext = createContext();

// Custom hook to use the budget context
export const useBudget = () => useContext(BudgetContext);

// Default budget categories
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Housing', type: 'expense' },
  { id: '2', name: 'Transportation', type: 'expense' },
  { id: '3', name: 'Food', type: 'expense' },
  { id: '4', name: 'Utilities', type: 'expense' },
  { id: '5', name: 'Insurance', type: 'expense' },
  { id: '6', name: 'Medical & Healthcare', type: 'expense' },
  { id: '7', name: 'Savings', type: 'savings' },
  { id: '8', name: 'Debt Payments', type: 'expense' },
  { id: '9', name: 'Personal Spending', type: 'expense' },
  { id: '10', name: 'Recreation & Entertainment', type: 'expense' },
  { id: '11', name: 'Salary', type: 'income' },
  { id: '12', name: 'Other Income', type: 'income' },
];

// Provider component that wraps the app and makes budget object available to any child component
export function BudgetProvider({ children }) {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [budgetItems, setBudgetItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load budget data from localStorage when user changes
  useEffect(() => {
    if (currentUser) {
      const storedBudget = localStorage.getItem(`budget_${currentUser.id}`);
      if (storedBudget) {
        setBudgetItems(JSON.parse(storedBudget));
      } else {
        setBudgetItems([]);
      }
    } else {
      setBudgetItems([]);
    }
    setLoading(false);
  }, [currentUser]);

  // Save budget data to localStorage whenever it changes
  useEffect(() => {
    if (currentUser && !loading) {
      localStorage.setItem(`budget_${currentUser.id}`, JSON.stringify(budgetItems));
    }
  }, [budgetItems, currentUser, loading]);

  // Add a new budget item
  const addBudgetItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      userId: currentUser.id,
    };
    setBudgetItems([...budgetItems, newItem]);
    return newItem;
  };

  // Update an existing budget item
  const updateBudgetItem = (id, updatedItem) => {
    setBudgetItems(
      budgetItems.map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
    );
  };

  // Delete a budget item
  const deleteBudgetItem = (id) => {
    setBudgetItems(budgetItems.filter((item) => item.id !== id));
  };

  // Add a new category
  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories([...categories, newCategory]);
    return newCategory;
  };

  // Calculate budget summary
  const calculateSummary = () => {
    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,
      balance: 0,
    };

    budgetItems.forEach((item) => {
      const category = categories.find((cat) => cat.id === item.categoryId);
      if (category) {
        const amount = parseFloat(item.amount) || 0;
        
        if (category.type === 'income') {
          summary.totalIncome += amount;
        } else if (category.type === 'expense') {
          summary.totalExpenses += amount;
        } else if (category.type === 'savings') {
          summary.totalSavings += amount;
          summary.totalExpenses += amount; // Savings are also an expense
        }
      }
    });

    summary.balance = summary.totalIncome - summary.totalExpenses;
    return summary;
  };

  // Value object that will be passed to consumers of this context
  const value = {
    categories,
    budgetItems,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    addCategory,
    calculateSummary,
    loading,
  };

  return (
    <BudgetContext.Provider value={value}>
      {!loading && children}
    </BudgetContext.Provider>
  );
}
