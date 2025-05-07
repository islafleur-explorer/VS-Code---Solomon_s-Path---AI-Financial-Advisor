import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../auth';
import { BUDGET_TEMPLATE } from './budgetTemplateData';

// Create the budget context
const BudgetContext = createContext();

// Custom hook to use the budget context
export const useBudget = () => useContext(BudgetContext);

// Provider component that wraps the app and makes budget object available to any child component
export function BudgetProvider({ children }) {
  const { currentUser } = useAuth();
  const [budgetTemplate, setBudgetTemplate] = useState(BUDGET_TEMPLATE);
  const [loading, setLoading] = useState(true);
  // Initialize with the current month and year
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.toLocaleString('default', { month: 'long' }));
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [activeTab, setActiveTab] = useState('planned'); // 'planned', 'spent', 'remaining'

  // Force reset budget data to apply updated classifications (temporary fix)
  useEffect(() => {
    if (currentUser) {
      // Check if we need to force reset (you can remove this after testing)
      const forceReset = true;

      if (forceReset) {
        // Clear all stored budget data for the current user
        const keys = Object.keys(localStorage);
        const userBudgetKeys = keys.filter(key =>
          key.startsWith(`budget_template_${currentUser.id}`)
        );
        userBudgetKeys.forEach(key => localStorage.removeItem(key));

        // Set the budget to the default template
        setBudgetTemplate(BUDGET_TEMPLATE);
      }
    }
  }, [currentUser]);

  // Helper function to check if a month is in the future
  const isMonthInFuture = (month, year) => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    // Convert month name to month index (0-11)
    const monthNames = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString('default', { month: 'long' })
    );
    const monthIndex = monthNames.findIndex(m => m === month);

    // Compare year and month to determine if it's in the future
    if (year > todayYear) return true;
    if (year === todayYear && monthIndex > todayMonth) return true;
    return false;
  };

  // Helper function to check if a month is in the past
  const isMonthInPast = (month, year) => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    // Convert month name to month index (0-11)
    const monthNames = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString('default', { month: 'long' })
    );
    const monthIndex = monthNames.findIndex(m => m === month);

    // Compare year and month to determine if it's in the past
    // We consider the current month as "not past"
    if (year < todayYear) return true;
    if (year === todayYear && monthIndex < todayMonth) return true;
    return false;
  };

  // Helper function to check if a month is the current month
  const isCurrentMonth = (month, year) => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    // Convert month name to month index (0-11)
    const monthNames = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString('default', { month: 'long' })
    );
    const monthIndex = monthNames.findIndex(m => m === month);

    return year === todayYear && monthIndex === todayMonth;
  };

  // Helper function to ensure all subcategories have a classification field
  const ensureClassifications = (template) => {
    return template.map(category => {
      return {
        ...category,
        subcategories: category.subcategories.map(subcategory => {
          // If no classification exists, set a default based on category
          if (!subcategory.classification) {
            let defaultClassification = 'need';

            // Set wants based on category and subcategory
            if (category.id === 'giving' ||
                (category.id === 'housing' && subcategory.name === 'Cable') ||
                (category.id === 'transportation' && subcategory.name === 'Car Wash') ||
                (category.id === 'food' && subcategory.name === 'Restaurants') ||
                (category.id === 'personal' && ['Clothing', 'Fun Money', 'Hair/Cosmetics', 'Subscriptions', 'Credit Card'].includes(subcategory.name)) ||
                (category.id === 'lifestyle' && ['Pet Care', 'Entertainment', 'Miscellaneous'].includes(subcategory.name)) ||
                (category.id === 'health' && subcategory.name === 'Gym') ||
                (category.id === 'insurance' && subcategory.name === 'Identity Theft')) {
              defaultClassification = 'want';
            }

            return { ...subcategory, classification: defaultClassification };
          }
          return subcategory;
        })
      };
    });
  };

  // Load budget data for the current month from localStorage
  useEffect(() => {
    if (currentUser) {
      const monthKey = `${currentMonth}_${currentYear}`;

      // Check if this is the current month
      if (isCurrentMonth(currentMonth, currentYear)) {
        // For current month, load normally
        const storedBudget = localStorage.getItem(`budget_template_${currentUser.id}_${monthKey}`);
        if (storedBudget) {
          const parsedBudget = JSON.parse(storedBudget);
          // Ensure all subcategories have a classification
          setBudgetTemplate(ensureClassifications(parsedBudget));
        } else {
          // If no data for this month, check if there's a default template
          const defaultTemplate = localStorage.getItem(`budget_template_${currentUser.id}_default`);
          if (defaultTemplate) {
            const parsedTemplate = JSON.parse(defaultTemplate);
            // Ensure all subcategories have a classification
            setBudgetTemplate(ensureClassifications(parsedTemplate));
          } else {
            setBudgetTemplate(BUDGET_TEMPLATE);
          }
        }
      } else {
        // For future or past months, check if the user has explicitly created this month
        const storedBudget = localStorage.getItem(`budget_template_${currentUser.id}_${monthKey}`);
        if (storedBudget) {
          // User has already created this month
          const parsedBudget = JSON.parse(storedBudget);
          // Ensure all subcategories have a classification
          setBudgetTemplate(ensureClassifications(parsedBudget));
        } else {
          // For months that haven't been created yet, show empty template
          // Create a deep copy of BUDGET_TEMPLATE with zero amounts
          const emptyTemplate = JSON.parse(JSON.stringify(BUDGET_TEMPLATE));
          setBudgetTemplate(emptyTemplate);
        }
      }
    } else {
      setBudgetTemplate(BUDGET_TEMPLATE);
    }
    setLoading(false);
  }, [currentUser, currentMonth, currentYear]);

  // Save budget data to localStorage whenever it changes
  useEffect(() => {
    if (currentUser && !loading) {
      const monthKey = `${currentMonth}_${currentYear}`;
      localStorage.setItem(`budget_template_${currentUser.id}_${monthKey}`, JSON.stringify(budgetTemplate));

      // Only update the default template if we're in the current month or past
      if (!isMonthInFuture(currentMonth, currentYear)) {
        localStorage.setItem(`budget_template_${currentUser.id}_default`, JSON.stringify(budgetTemplate));
      }
    }
  }, [budgetTemplate, currentUser, loading, currentMonth, currentYear]);

  // Create a new month's budget based on the appropriate template
  const createNewMonthBudget = (targetMonth = currentMonth, targetYear = currentYear) => {
    if (currentUser) {
      const monthKey = `${targetMonth}_${targetYear}`;

      // For future months, use the previous month's data if available
      if (isMonthInFuture(targetMonth, targetYear)) {
        // Calculate the previous month (relative to the target month)
        const targetDate = new Date(`${targetMonth} 1, ${targetYear}`);
        const prevDate = new Date(targetDate);
        prevDate.setMonth(targetDate.getMonth() - 1);
        const prevMonth = prevDate.toLocaleString('default', { month: 'long' });
        const prevYear = prevDate.getFullYear();
        const prevMonthKey = `${prevMonth}_${prevYear}`;

        // Try to get the previous month's budget data
        const prevMonthData = localStorage.getItem(`budget_template_${currentUser.id}_${prevMonthKey}`);

        if (prevMonthData) {
          // Use the previous month's data for this future month
          const parsedTemplate = JSON.parse(prevMonthData);
          // Ensure all subcategories have a classification
          const templateWithClassifications = ensureClassifications(parsedTemplate);

          // If we're already on the target month, update the state
          if (targetMonth === currentMonth && targetYear === currentYear) {
            setBudgetTemplate(templateWithClassifications);
          }

          // Save it to localStorage for this month
          localStorage.setItem(`budget_template_${currentUser.id}_${monthKey}`, JSON.stringify(templateWithClassifications));

          return true;
        }

        // If previous month data isn't available, fall back to current month data
        const today = new Date();
        const currentMonthName = today.toLocaleString('default', { month: 'long' });
        const currentYearNum = today.getFullYear();
        const currentMonthKey = `${currentMonthName}_${currentYearNum}`;

        // Try to get the current month's budget data
        const currentMonthData = localStorage.getItem(`budget_template_${currentUser.id}_${currentMonthKey}`);

        if (currentMonthData) {
          // Use the current month's data for this future month
          const parsedTemplate = JSON.parse(currentMonthData);
          // Ensure all subcategories have a classification
          const templateWithClassifications = ensureClassifications(parsedTemplate);

          // If we're already on the target month, update the state
          if (targetMonth === currentMonth && targetYear === currentYear) {
            setBudgetTemplate(templateWithClassifications);
          }

          // Save it to localStorage for this month
          localStorage.setItem(`budget_template_${currentUser.id}_${monthKey}`, JSON.stringify(templateWithClassifications));

          return true;
        }
      }

      // For past months or if current month data isn't available, use the default template
      const defaultTemplate = localStorage.getItem(`budget_template_${currentUser.id}_default`);
      if (defaultTemplate) {
        // Use the default template for this month
        const parsedTemplate = JSON.parse(defaultTemplate);
        // Ensure all subcategories have a classification
        const templateWithClassifications = ensureClassifications(parsedTemplate);

        // If we're already on the target month, update the state
        if (targetMonth === currentMonth && targetYear === currentYear) {
          setBudgetTemplate(templateWithClassifications);
        }

        // Save it to localStorage for this month
        localStorage.setItem(`budget_template_${currentUser.id}_${monthKey}`, JSON.stringify(templateWithClassifications));

        return true;
      } else {
        // If no default template exists, use the built-in template

        // If we're already on the target month, update the state
        if (targetMonth === currentMonth && targetYear === currentYear) {
          setBudgetTemplate(BUDGET_TEMPLATE);
        }

        // Save it to localStorage for this month
        localStorage.setItem(`budget_template_${currentUser.id}_${monthKey}`, JSON.stringify(BUDGET_TEMPLATE));

        return true;
      }
    }
    return false;
  };

  // Update a subcategory amount
  const updateSubcategoryAmount = (categoryId, subcategoryId, amount) => {
    const updatedTemplate = budgetTemplate.map(category => {
      if (category.id === categoryId) {
        const updatedSubcategories = category.subcategories.map(subcategory => {
          if (subcategory.id === subcategoryId) {
            return { ...subcategory, amount: parseFloat(amount) || 0 };
          }
          return subcategory;
        });
        return { ...category, subcategories: updatedSubcategories };
      }
      return category;
    });
    setBudgetTemplate(updatedTemplate);
  };

  // Update a subcategory name
  const updateSubcategoryName = (categoryId, subcategoryId, name) => {
    const updatedTemplate = budgetTemplate.map(category => {
      if (category.id === categoryId) {
        const updatedSubcategories = category.subcategories.map(subcategory => {
          if (subcategory.id === subcategoryId) {
            return { ...subcategory, name };
          }
          return subcategory;
        });
        return { ...category, subcategories: updatedSubcategories };
      }
      return category;
    });
    setBudgetTemplate(updatedTemplate);
  };

  // Update a subcategory classification
  const updateSubcategoryClassification = (categoryId, subcategoryId, classification) => {
    const updatedTemplate = budgetTemplate.map(category => {
      if (category.id === categoryId) {
        const updatedSubcategories = category.subcategories.map(subcategory => {
          if (subcategory.id === subcategoryId) {
            return { ...subcategory, classification };
          }
          return subcategory;
        });
        return { ...category, subcategories: updatedSubcategories };
      }
      return category;
    });
    setBudgetTemplate(updatedTemplate);
  };

  // Add a new subcategory to a main category
  const addSubcategory = (categoryId, subcategoryName, classification = 'need') => {
    const updatedTemplate = budgetTemplate.map(category => {
      if (category.id === categoryId) {
        const newSubcategory = {
          id: `${categoryId}-${Date.now()}`,
          name: subcategoryName,
          amount: 0,
          classification: classification
        };
        return {
          ...category,
          subcategories: [...category.subcategories, newSubcategory]
        };
      }
      return category;
    });
    setBudgetTemplate(updatedTemplate);
  };

  // Delete a subcategory
  const deleteSubcategory = (categoryId, subcategoryId) => {
    const updatedTemplate = budgetTemplate.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: category.subcategories.filter(sub => sub.id !== subcategoryId)
        };
      }
      return category;
    });
    setBudgetTemplate(updatedTemplate);
  };

  // Move a subcategory up in the list
  const moveSubcategoryUp = (categoryId, subcategoryId) => {
    const updatedTemplate = budgetTemplate.map(category => {
      if (category.id === categoryId) {
        const subcategories = [...category.subcategories];
        const index = subcategories.findIndex(sub => sub.id === subcategoryId);

        if (index > 0) {
          // Swap with the item above
          [subcategories[index], subcategories[index - 1]] =
          [subcategories[index - 1], subcategories[index]];
        }

        return { ...category, subcategories };
      }
      return category;
    });
    setBudgetTemplate(updatedTemplate);
  };

  // Move a subcategory down in the list
  const moveSubcategoryDown = (categoryId, subcategoryId) => {
    const updatedTemplate = budgetTemplate.map(category => {
      if (category.id === categoryId) {
        const subcategories = [...category.subcategories];
        const index = subcategories.findIndex(sub => sub.id === subcategoryId);

        if (index < subcategories.length - 1) {
          // Swap with the item below
          [subcategories[index], subcategories[index + 1]] =
          [subcategories[index + 1], subcategories[index]];
        }

        return { ...category, subcategories };
      }
      return category;
    });
    setBudgetTemplate(updatedTemplate);
  };

  // Reset the budget to default template
  const resetBudget = () => {
    // Clear all stored budget data for the current user
    if (currentUser) {
      // Get all localStorage keys
      const keys = Object.keys(localStorage);

      // Filter keys related to this user's budget
      const userBudgetKeys = keys.filter(key =>
        key.startsWith(`budget_template_${currentUser.id}`)
      );

      // Remove all user budget data
      userBudgetKeys.forEach(key => localStorage.removeItem(key));
    }

    // Set the budget to the default template
    setBudgetTemplate(BUDGET_TEMPLATE);
  };

  // Calculate budget summary
  const calculateSummary = () => {
    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,
      balance: 0,
    };

    budgetTemplate.forEach(category => {
      category.subcategories.forEach(subcategory => {
        const amount = parseFloat(subcategory.amount) || 0;

        if (category.type === 'income') {
          summary.totalIncome += amount;
        } else if (category.type === 'expense') {
          summary.totalExpenses += amount;
        } else if (category.type === 'savings') {
          summary.totalSavings += amount;
          summary.totalExpenses += amount; // Savings are also an expense
        }
      });
    });

    summary.balance = summary.totalIncome - summary.totalExpenses;
    return summary;
  };

  // Navigate to the next month
  const goToNextMonth = () => {
    // Get the next month and year
    const currentDate = new Date(`${currentMonth} 1, ${currentYear}`);
    const nextDate = new Date(currentDate);
    nextDate.setMonth(currentDate.getMonth() + 1);

    const nextMonth = nextDate.toLocaleString('default', { month: 'long' });
    const nextYear = nextDate.getFullYear();

    // Update the current month and year
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  // Navigate to the previous month
  const goToPreviousMonth = () => {
    // Get the previous month and year
    const currentDate = new Date(`${currentMonth} 1, ${currentYear}`);
    const prevDate = new Date(currentDate);
    prevDate.setMonth(currentDate.getMonth() - 1);

    const prevMonth = prevDate.toLocaleString('default', { month: 'long' });
    const prevYear = prevDate.getFullYear();

    // Update the current month and year
    setCurrentMonth(prevMonth);
    setCurrentYear(prevYear);
  };

  // Navigate to a specific month and year
  const goToMonth = (month, year) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  // Value object that will be passed to consumers of this context
  const value = {
    budgetTemplate,
    updateSubcategoryAmount,
    updateSubcategoryName,
    updateSubcategoryClassification,
    addSubcategory,
    deleteSubcategory,
    moveSubcategoryUp,
    moveSubcategoryDown,
    resetBudget,
    calculateSummary,
    loading,
    currentMonth,
    setCurrentMonth,
    currentYear,
    setCurrentYear,
    activeTab,
    setActiveTab,
    goToNextMonth,
    goToPreviousMonth,
    goToMonth,
    isMonthInFuture,
    isMonthInPast,
    isCurrentMonth,
    createNewMonthBudget
  };

  return (
    <BudgetContext.Provider value={value}>
      {!loading && children}
    </BudgetContext.Provider>
  );
}
