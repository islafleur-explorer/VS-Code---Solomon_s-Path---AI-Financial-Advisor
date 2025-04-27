import financialKnowledgeBase from './financialKnowledgeBase';

// Hardcoded responses for common financial questions
const responses = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: "Hello! I'm SolomonSays, your financial assistant. How can I help you today?"
  },
  {
    keywords: ['50/30/20', '50 30 20', 'budget rule'],
    response: "The 50/30/20 rule is a budgeting guideline that suggests allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment. Needs include housing, food, utilities, and transportation. Wants include entertainment, dining out, and non-essential shopping. Savings include emergency funds, retirement accounts, and paying off debt."
  },
  {
    keywords: ['emergency fund', 'rainy day fund'],
    response: "An emergency fund is money set aside for unexpected expenses like medical bills, car repairs, or job loss. Financial experts typically recommend saving 3-6 months of living expenses in an easily accessible account like a high-yield savings account."
  },
  {
    keywords: ['debt snowball', 'snowball method'],
    response: "The debt snowball method is a debt repayment strategy where you pay off debts from smallest to largest balance, regardless of interest rate. You make minimum payments on all debts while putting extra money toward the smallest debt. Once that's paid off, you roll that payment into the next smallest debt, creating momentum like a snowball rolling downhill."
  },
  {
    keywords: ['debt avalanche', 'avalanche method'],
    response: "The debt avalanche method is a debt repayment strategy where you pay off debts in order of highest to lowest interest rate. Mathematically, this saves you the most money in interest over time compared to other methods like the debt snowball."
  },
  {
    keywords: ['401k', 'retirement', 'ira', 'roth'],
    response: "Retirement accounts like 401(k)s and IRAs offer tax advantages for saving for retirement. A traditional 401(k) or IRA uses pre-tax contributions, while a Roth 401(k) or Roth IRA uses after-tax contributions but grows tax-free. Many financial advisors recommend contributing at least enough to get your employer's full match, as that's essentially free money."
  },
  {
    keywords: ['credit score', 'fico'],
    response: "Your credit score is a number between 300-850 that represents your creditworthiness. It's calculated based on payment history (35%), amounts owed (30%), length of credit history (15%), new credit (10%), and credit mix (10%). To improve your score: pay bills on time, keep credit card balances low, don't close old accounts, and limit new credit applications."
  },
  {
    keywords: ['invest', 'investing', 'stock', 'bond', 'etf', 'mutual fund'],
    response: "Investing is putting money into assets with the expectation of generating returns over time. Common investment vehicles include stocks (ownership in companies), bonds (loans to companies or governments), ETFs and mutual funds (collections of stocks/bonds), and real estate. For beginners, many experts recommend starting with low-cost index funds that track the broader market."
  },
  {
    keywords: ['inflation'],
    response: "Inflation is the rate at which prices for goods and services rise over time, reducing purchasing power. The Federal Reserve targets an inflation rate of about 2% annually. To protect against inflation, consider investments that historically outpace inflation like stocks, TIPS (Treasury Inflation-Protected Securities), real estate, and I bonds."
  },
  {
    keywords: ['compound interest'],
    response: "Compound interest is when you earn interest on both your initial investment and on the interest you've already earned. It's often called 'interest on interest' and is a powerful force in building wealth over time. The earlier you start investing, the more time your money has to compound and grow."
  },
  {
    keywords: ['budget', 'budgeting', 'track expenses'],
    response: "Budgeting is tracking your income and expenses to understand and plan your finances. Popular budgeting methods include zero-based budgeting (giving every dollar a job), 50/30/20 (needs/wants/savings), and envelope budgeting (allocating cash to different spending categories). The best budget is one you'll actually stick to consistently."
  },
  {
    keywords: ['save money', 'saving tips', 'frugal'],
    response: "Some effective ways to save money include: automating savings transfers, cutting subscription services you don't use, meal planning to reduce food waste, using cashback apps and credit cards (if paid in full), negotiating bills annually, buying used for big purchases, and following the 24-hour rule for non-essential purchases."
  },
  {
    keywords: ['mortgage', 'home loan'],
    response: "A mortgage is a loan used to purchase real estate. Key factors include the down payment (typically 3-20%), interest rate (fixed or adjustable), term (commonly 15 or 30 years), and additional costs like property taxes, insurance, and possibly PMI (Private Mortgage Insurance). Most experts recommend keeping housing costs below 28% of your gross income."
  },
  {
    keywords: ['student loan', 'student debt'],
    response: "Student loans can be federal (government-issued) or private (from banks or lenders). Federal loans typically offer more flexible repayment options, including income-driven repayment plans and potential forgiveness programs. Strategies for managing student debt include refinancing for lower rates (though this may sacrifice federal benefits), making extra payments toward principal, and exploring forgiveness or employer assistance programs."
  },
  {
    keywords: ['credit card debt'],
    response: "Credit card debt typically carries high interest rates (often 15-25% APR), making it one of the most expensive forms of debt. Strategies to tackle credit card debt include: stopping new charges, negotiating for lower interest rates, debt consolidation through personal loans or balance transfers, and using either the avalanche method (highest interest first) or snowball method (smallest balance first) to systematically pay down balances."
  }
];

// Default response when no matching keywords are found
const defaultResponse = "I'm still learning about financial topics. For more detailed information on this topic, I recommend consulting a financial advisor or checking reputable financial education websites like Investopedia or NerdWallet.";

// Function to search the knowledge base for relevant information
const searchKnowledgeBase = (input) => {
  const lowercaseInput = input.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  // Define categories and their keywords for searching
  const categories = {
    budgeting: ['budget', 'spending', 'expense', 'track', '50/30/20', 'envelope', 'zero-based'],
    debt: ['debt', 'loan', 'credit card', 'mortgage', 'student loan', 'snowball', 'avalanche'],
    savings: ['save', 'saving', 'emergency fund', 'rainy day', 'sinking fund'],
    investing: ['invest', 'investment', 'retirement', '401k', 'ira', 'roth', 'stock', 'bond', 'etf', 'mutual fund'],
    familyFinance: ['family', 'child', 'kid', 'baby', 'education', 'college', 'childcare', 'daycare', '529'],
    housing: ['house', 'home', 'mortgage', 'rent', 'apartment', 'down payment', 'property'],
    insurance: ['insurance', 'life insurance', 'health insurance', 'disability', 'term', 'whole life'],
    taxes: ['tax', 'taxes', 'deduction', 'credit', 'refund', 'irs', 'filing'],
    income: ['income', 'salary', 'wage', 'raise', 'promotion', 'side hustle', 'gig', 'freelance']
  };

  // Search each category
  for (const [category, keywords] of Object.entries(categories)) {
    // Calculate match score based on keyword presence
    const matchCount = keywords.reduce((count, keyword) => {
      return count + (lowercaseInput.includes(keyword) ? 1 : 0);
    }, 0);

    const score = matchCount / keywords.length;

    // If this category has a better match, update bestMatch
    if (score > bestScore && score > 0) {
      bestScore = score;
      bestMatch = category;
    }
  }

  // If we found a matching category, look for specific subcategories
  if (bestMatch && financialKnowledgeBase[bestMatch]) {
    const categoryData = financialKnowledgeBase[bestMatch];

    // Look for the most relevant subcategory
    let bestSubcategory = null;
    let bestSubcategoryContent = null;

    for (const [subcategory, content] of Object.entries(categoryData)) {
      // For now, just return the first subcategory we find
      // In a more sophisticated implementation, we would score subcategories too
      bestSubcategory = subcategory;
      bestSubcategoryContent = content;
      break;
    }

    if (bestSubcategoryContent) {
      // Format the response based on the content structure
      if (typeof bestSubcategoryContent.content === 'string') {
        return `${bestSubcategoryContent.title}: ${bestSubcategoryContent.content}${bestSubcategoryContent.source ? `\n\nSource: ${bestSubcategoryContent.source}` : ''}`;
      } else if (Array.isArray(bestSubcategoryContent.content)) {
        // Handle array content (like lists of strategies)
        let response = `${bestSubcategoryContent.title}:\n\n`;

        bestSubcategoryContent.content.forEach(item => {
          if (item.name) {
            response += `• ${item.name}: ${item.description}\n`;
          } else {
            response += `• ${item}\n`;
          }
        });

        if (bestSubcategoryContent.source) {
          response += `\nSource: ${bestSubcategoryContent.source}`;
        }

        return response;
      }
    }
  }

  return null;
};

// Function to get a response based on user input
export const getFinancialResponse = (input) => {
  const lowercaseInput = input.toLowerCase();

  // First check if input contains any keywords from our hardcoded responses
  for (const item of responses) {
    if (item.keywords.some(keyword => lowercaseInput.includes(keyword))) {
      return item.response;
    }
  }

  // If no hardcoded response matches, search the knowledge base
  const knowledgeBaseResponse = searchKnowledgeBase(input);
  if (knowledgeBaseResponse) {
    return knowledgeBaseResponse;
  }

  // If no matching keywords in hardcoded responses or knowledge base, return default response
  return defaultResponse;
};
