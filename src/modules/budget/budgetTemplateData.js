// Budget template data with main categories and subcategories
export const BUDGET_TEMPLATE = [
  {
    id: 'income',
    name: 'Income',
    type: 'income',
    subcategories: [
      { id: 'his-paycheck-1', name: 'His Paycheck 1', amount: 0 },
      { id: 'her-paycheck-1', name: 'Her Paycheck 1', amount: 0 },
      { id: 'his-paycheck-2', name: 'His Paycheck 2', amount: 0 },
      { id: 'her-paycheck-2', name: 'Her Paycheck 2', amount: 0 },
      { id: 'his-paycheck-3', name: 'His Paycheck 3', amount: 0 },
      { id: 'her-paycheck-3', name: 'Her Paycheck 3', amount: 0 },
      { id: 'his-paycheck-4', name: 'His Paycheck 4', amount: 0 },
      { id: 'her-paycheck-4', name: 'Her Paycheck 4', amount: 0 }
    ]
  },
  {
    id: 'giving',
    name: 'Giving',
    type: 'expense',
    subcategories: [
      { id: 'his-church-giving', name: 'His Church Giving', amount: 0, classification: 'want' },
      { id: 'her-church-giving', name: 'Her Church Giving', amount: 0, classification: 'want' },
      { id: 'charity', name: 'Charity', amount: 0, classification: 'want' }
    ]
  },
  {
    id: 'savings',
    name: 'Savings',
    type: 'savings',
    subcategories: [
      { id: 'emergency-fund', name: 'Emergency Fund', amount: 0, classification: 'need' },
      { id: 'ira', name: 'IRA', amount: 0, classification: 'need' }
    ]
  },
  {
    id: 'housing',
    name: 'Housing',
    type: 'expense',
    subcategories: [
      { id: 'mortgage-rent', name: 'Mortgage/Rent', amount: 0, classification: 'need' },
      { id: 'water', name: 'Water', amount: 0, classification: 'need' },
      { id: 'natural-gas', name: 'Natural Gas', amount: 0, classification: 'need' },
      { id: 'electricity', name: 'Electricity', amount: 0, classification: 'need' },
      { id: 'trash', name: 'Trash', amount: 0, classification: 'need' },
      { id: 'internet', name: 'Internet', amount: 0, classification: 'need' },
      { id: 'cable', name: 'Cable', amount: 0, classification: 'want' }
    ]
  },
  {
    id: 'transportation',
    name: 'Transportation',
    type: 'expense',
    subcategories: [
      { id: 'maintenance', name: 'Maintenance', amount: 0, classification: 'need' },
      { id: 'toll-bridges', name: 'Toll/Bridges', amount: 0, classification: 'need' },
      { id: 'gas', name: 'Gas', amount: 0, classification: 'need' },
      { id: 'car-wash', name: 'Car Wash', amount: 0, classification: 'want' }
    ]
  },
  {
    id: 'food',
    name: 'Food',
    type: 'expense',
    subcategories: [
      { id: 'groceries', name: 'Groceries', amount: 0, classification: 'need' },
      { id: 'restaurants', name: 'Restaurants', amount: 0, classification: 'want' }
    ]
  },
  {
    id: 'personal',
    name: 'Personal',
    type: 'expense',
    subcategories: [
      { id: 'clothing', name: 'Clothing', amount: 0, classification: 'want' },
      { id: 'phone', name: 'Phone', amount: 0, classification: 'need' },
      { id: 'fun-money', name: 'Fun Money', amount: 0, classification: 'want' },
      { id: 'hair-cosmetics', name: 'Hair/Cosmetics', amount: 0, classification: 'want' },
      { id: 'subscriptions', name: 'Subscriptions', amount: 0, classification: 'want' },
      { id: 'credit-card', name: 'Credit Card', amount: 0, classification: 'want' }
    ]
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    type: 'expense',
    subcategories: [
      { id: 'pet-care', name: 'Pet Care', amount: 0, classification: 'want' },
      { id: 'child-care', name: 'Child Care', amount: 0, classification: 'need' },
      { id: 'entertainment', name: 'Entertainment', amount: 0, classification: 'want' },
      { id: 'miscellaneous', name: 'Miscellaneous', amount: 0, classification: 'want' }
    ]
  },
  {
    id: 'health',
    name: 'Health',
    type: 'expense',
    subcategories: [
      { id: 'gym', name: 'Gym', amount: 0, classification: 'want' },
      { id: 'doctor-visits', name: 'Doctor Visits', amount: 0, classification: 'need' },
      { id: 'medicine-vitamins', name: 'Medicine/Vitamins', amount: 0, classification: 'need' }
    ]
  },
  {
    id: 'insurance',
    name: 'Insurance',
    type: 'expense',
    subcategories: [
      { id: 'health-insurance', name: 'Health Insurance', amount: 0, classification: 'need' },
      { id: 'his-life-insurance', name: 'His Life Insurance', amount: 0, classification: 'need' },
      { id: 'her-life-insurance', name: 'Her Life Insurance', amount: 0, classification: 'need' },
      { id: 'auto-insurance', name: 'Auto Insurance', amount: 0, classification: 'need' },
      { id: 'homeowner-renter', name: 'Homeowner/Renter', amount: 0, classification: 'need' },
      { id: 'identity-theft', name: 'Identity Theft', amount: 0, classification: 'want' }
    ]
  },
  {
    id: 'debt',
    name: 'Debt',
    type: 'expense',
    subcategories: [
      { id: 'student-loan', name: 'Student Loan', amount: 0, classification: 'need' }
    ]
  }
];
