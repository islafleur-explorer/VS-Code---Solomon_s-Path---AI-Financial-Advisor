/**
 * Financial Knowledge Base for SolomonSays
 * 
 * This file contains structured financial knowledge organized by categories
 * to help the chatbot provide accurate and helpful responses.
 */

const financialKnowledgeBase = {
  // Basic Budgeting
  budgeting: {
    basics: {
      title: "Budgeting Basics",
      content: `Budgeting is the process of creating a plan to spend your money. This spending plan is called a budget. Creating a budget allows you to determine in advance whether you will have enough money to do the things you need to do or would like to do. Budgeting is simply balancing your expenses with your income.`,
      source: "Consumer Financial Protection Bureau",
      url: "https://www.consumerfinance.gov/consumer-tools/money-as-you-grow/",
    },
    methods: {
      title: "Popular Budgeting Methods",
      content: [
        {
          name: "50/30/20 Rule",
          description: "Allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.",
          bestFor: "Beginners who want a simple framework",
          source: "Elizabeth Warren's book 'All Your Worth'"
        },
        {
          name: "Zero-Based Budgeting",
          description: "Give every dollar a job so that income minus expenses equals zero.",
          bestFor: "Detail-oriented people who want maximum control",
          source: "YNAB (You Need A Budget) methodology"
        },
        {
          name: "Envelope System",
          description: "Divide cash into envelopes for different spending categories.",
          bestFor: "People who overspend with credit/debit cards",
          source: "Dave Ramsey's Financial Peace University"
        },
        {
          name: "Pay Yourself First",
          description: "Set aside savings at the beginning of the month before other expenses.",
          bestFor: "Prioritizing long-term financial goals",
          source: "George S. Clason's book 'The Richest Man in Babylon'"
        }
      ]
    },
    familyBudgeting: {
      title: "Family Budgeting Tips",
      content: `
        1. Include all family members in age-appropriate budget discussions
        2. Plan for child-specific expenses (childcare, education, activities)
        3. Build emergency savings for unexpected family needs
        4. Regularly review and adjust as children grow and needs change
        5. Include fun family activities in your budget to maintain balance
      `,
      source: "National Endowment for Financial Education",
      url: "https://www.nefe.org/"
    }
  },

  // Debt Management
  debt: {
    strategies: {
      title: "Debt Repayment Strategies",
      content: [
        {
          name: "Debt Snowball",
          description: "Pay off debts from smallest to largest balance, gaining momentum as each debt is paid off.",
          bestFor: "Those who need psychological wins to stay motivated",
          source: "Dave Ramsey's Financial Peace University"
        },
        {
          name: "Debt Avalanche",
          description: "Pay off debts from highest to lowest interest rate, saving the most money in interest.",
          bestFor: "Those who want to minimize interest paid",
          source: "Various financial experts"
        },
        {
          name: "Debt Consolidation",
          description: "Combine multiple debts into a single loan with a lower interest rate.",
          bestFor: "Those with good credit who qualify for lower rates",
          source: "Federal Trade Commission Consumer Information"
        }
      ]
    },
    familyDebtManagement: {
      title: "Managing Debt with a Family",
      content: `
        1. Prioritize high-interest debt while maintaining minimum payments on all debts
        2. Consider the impact of debt repayment on family necessities
        3. Teach children about responsible borrowing through age-appropriate conversations
        4. Avoid taking on new debt while paying off existing obligations
        5. Create a family celebration plan for debt milestones
      `,
      source: "Financial Planning Association",
      url: "https://www.plannersearch.org/"
    }
  },

  // Savings and Emergency Funds
  savings: {
    emergencyFund: {
      title: "Emergency Fund Basics",
      content: `An emergency fund is money specifically set aside to cover unexpected expenses or financial emergencies. Most financial experts recommend having 3-6 months of essential expenses saved. For families, consider aiming for the higher end of this range due to additional potential emergencies related to children.`,
      source: "Consumer Financial Protection Bureau",
      url: "https://www.consumerfinance.gov/start-small-save-up/"
    },
    savingStrategies: {
      title: "Saving Strategies for Families",
      content: [
        {
          strategy: "Automate savings through direct deposit",
          benefit: "Removes the temptation to spend before saving"
        },
        {
          strategy: "Use tax-advantaged accounts (529 plans, HSAs)",
          benefit: "Maximizes growth potential for specific goals"
        },
        {
          strategy: "Implement a 'save to spend' approach for large purchases",
          benefit: "Avoids debt for major family expenses"
        },
        {
          strategy: "Include children in saving activities",
          benefit: "Teaches financial literacy from an early age"
        }
      ],
      source: "America Saves",
      url: "https://americasaves.org/"
    }
  },

  // Family Financial Planning
  familyFinance: {
    childExpenses: {
      title: "Planning for Child-Related Expenses",
      content: `
        The USDA estimates that it costs about $233,610 to raise a child from birth to age 17 (not including college). Major expense categories include:
        
        1. Housing (29% of total cost)
        2. Food (18% of total cost)
        3. Childcare and education (16% of total cost)
        4. Transportation (15% of total cost)
        5. Healthcare (9% of total cost)
        6. Clothing (6% of total cost)
        7. Other necessities (7% of total cost)
        
        These costs vary significantly based on your location, income level, and personal choices.
      `,
      source: "USDA Cost of Raising a Child Calculator",
      url: "https://www.usda.gov/media/blog/2017/01/13/cost-raising-child"
    },
    collegeEducation: {
      title: "Saving for College Education",
      content: `
        Options for college savings include:
        
        1. 529 Plans: Tax-advantaged savings plans designed specifically for education expenses
        2. Coverdell ESAs: Another tax-advantaged option with more flexibility but lower contribution limits
        3. UGMA/UTMA Accounts: Custodial accounts that transfer to the child at age of majority
        4. Roth IRAs: Can be used for education expenses under certain conditions
        
        Start early: Even small regular contributions can grow significantly over 18 years.
      `,
      source: "College Savings Plans Network",
      url: "https://www.collegesavings.org/"
    },
    teachingKids: {
      title: "Teaching Children About Money",
      content: `
        Age-appropriate financial lessons:
        
        Ages 3-5: Identifying coins and bills, understanding that things cost money
        Ages 6-10: Earning and saving money, making simple spending decisions
        Ages 11-13: Budgeting allowance, saving for short-term goals, introduction to banking
        Ages 14-18: Working and earning income, saving for larger purchases, understanding credit
        
        Consistent conversations about money in a positive context help children develop healthy financial habits.
      `,
      source: "Jump$tart Coalition for Personal Financial Literacy",
      url: "https://www.jumpstart.org/"
    }
  },

  // Insurance and Protection
  insurance: {
    familyInsurance: {
      title: "Essential Insurance for Families",
      content: [
        {
          type: "Health Insurance",
          purpose: "Covers medical expenses for the family",
          considerations: "Family deductibles, copays, network coverage, prescription benefits"
        },
        {
          type: "Life Insurance",
          purpose: "Provides financial protection if a parent dies",
          considerations: "Term vs. permanent, coverage amount based on income replacement needs"
        },
        {
          type: "Disability Insurance",
          purpose: "Replaces income if a parent becomes unable to work",
          considerations: "Short-term vs. long-term, elimination period, benefit amount"
        },
        {
          type: "Homeowners/Renters Insurance",
          purpose: "Protects your home and possessions",
          considerations: "Replacement cost coverage, liability protection, special riders for valuables"
        },
        {
          type: "Auto Insurance",
          purpose: "Covers vehicle damage and liability",
          considerations: "Liability limits, comprehensive coverage, uninsured motorist protection"
        }
      ],
      source: "Insurance Information Institute",
      url: "https://www.iii.org/"
    },
    estatePlanning: {
      title: "Basic Estate Planning for Families",
      content: `
        Essential estate planning documents for parents:
        
        1. Will: Designates guardians for minor children and directs asset distribution
        2. Trust: Manages assets for minor children and potentially reduces estate taxes
        3. Power of Attorney: Designates someone to make financial decisions if you're incapacitated
        4. Healthcare Directive: Outlines medical wishes if you're unable to communicate
        
        Review and update these documents regularly, especially after major life events.
      `,
      source: "American Bar Association",
      url: "https://www.americanbar.org/groups/real_property_trust_estate/resources/"
    }
  },

  // Investing
  investing: {
    basics: {
      title: "Investing Basics for Families",
      content: `
        Key investment principles:
        
        1. Start early to benefit from compound growth
        2. Diversify investments to manage risk
        3. Consider your time horizon (when you'll need the money)
        4. Understand your risk tolerance
        5. Keep costs low with index funds or ETFs
        
        For families, balance long-term goals like retirement with medium-term goals like college education.
      `,
      source: "Securities and Exchange Commission",
      url: "https://www.investor.gov/"
    },
    retirementAccounts: {
      title: "Retirement Accounts Overview",
      content: [
        {
          type: "401(k)/403(b)",
          features: "Employer-sponsored, tax-deferred growth, possible employer match",
          considerations: "Limited investment options, early withdrawal penalties"
        },
        {
          type: "Traditional IRA",
          features: "Tax-deductible contributions, tax-deferred growth",
          considerations: "Income limits for deductions, required minimum distributions"
        },
        {
          type: "Roth IRA",
          features: "After-tax contributions, tax-free growth and withdrawals",
          considerations: "Income limits for contributions, more flexible withdrawal rules"
        },
        {
          type: "SEP IRA/Solo 401(k)",
          features: "Higher contribution limits for self-employed individuals",
          considerations: "Different rules for employees vs. business owners"
        }
      ],
      source: "Internal Revenue Service",
      url: "https://www.irs.gov/retirement-plans"
    }
  },

  // Housing
  housing: {
    buyingVsRenting: {
      title: "Buying vs. Renting with a Family",
      content: `
        Factors to consider:
        
        1. Financial: Upfront costs, ongoing expenses, potential appreciation, tax benefits
        2. Lifestyle: Stability for children, school districts, space needs, maintenance responsibilities
        3. Flexibility: Job security, potential relocations, changing family size
        
        General guideline: Consider buying if you plan to stay in the same location for at least 5-7 years.
      `,
      source: "U.S. Department of Housing and Urban Development",
      url: "https://www.hud.gov/topics/buying_a_home"
    },
    mortgages: {
      title: "Mortgage Basics for Families",
      content: `
        Key mortgage concepts:
        
        1. Pre-approval: Get this before house hunting to understand your budget
        2. Down payment: Typically 3-20% of home price (larger down payments reduce costs)
        3. Mortgage types: Fixed-rate vs. adjustable-rate, conventional vs. government-backed
        4. Term: Usually 15 or 30 years (shorter terms have higher payments but lower total cost)
        5. Affordability: Total housing costs should generally not exceed 28-33% of gross income
        
        Consider how the mortgage payment will impact other family financial goals.
      `,
      source: "Consumer Financial Protection Bureau",
      url: "https://www.consumerfinance.gov/owning-a-home/"
    }
  },

  // Taxes
  taxes: {
    familyTaxCredits: {
      title: "Tax Credits and Deductions for Families",
      content: [
        {
          credit: "Child Tax Credit",
          description: "Credit for taxpayers with qualifying children",
          value: "Up to $2,000 per qualifying child (subject to change with tax legislation)"
        },
        {
          credit: "Child and Dependent Care Credit",
          description: "Credit for childcare expenses while working or looking for work",
          value: "Up to 35% of qualifying expenses, maximum of $3,000 for one child or $6,000 for two or more"
        },
        {
          credit: "Earned Income Tax Credit",
          description: "Credit for low to moderate income working individuals and families",
          value: "Varies based on income and number of children"
        },
        {
          credit: "Education Credits",
          description: "American Opportunity Credit and Lifetime Learning Credit for education expenses",
          value: "Up to $2,500 for AOTC and up to $2,000 for LLC"
        }
      ],
      source: "Internal Revenue Service",
      url: "https://www.irs.gov/credits-deductions-for-individuals"
    },
    taxPlanning: {
      title: "Family Tax Planning Strategies",
      content: `
        1. Contribute to tax-advantaged accounts (401(k), HSA, FSA, 529 plans)
        2. Time major purchases or medical expenses for maximum tax benefit
        3. Keep records of childcare expenses and education costs
        4. Consider filing status options (married filing jointly vs. separately)
        5. Adjust withholding to avoid large refunds or unexpected tax bills
        
        Review tax planning annually as family circumstances and tax laws change.
      `,
      source: "American Institute of CPAs",
      url: "https://www.aicpa.org/topics/tax"
    }
  },

  // Career and Income
  income: {
    workLifeBalance: {
      title: "Financial Aspects of Work-Life Balance",
      content: `
        Considerations for family income decisions:
        
        1. Childcare costs vs. potential income from both parents working
        2. Career advancement opportunities and long-term earning potential
        3. Benefits like health insurance, retirement plans, and flexible scheduling
        4. Tax implications of one vs. two incomes
        5. Non-financial benefits of different work arrangements
        
        There's no one-size-fits-all solution; the best approach depends on your family's unique circumstances and values.
      `,
      source: "Pew Research Center",
      url: "https://www.pewresearch.org/topics/work-and-employment/"
    },
    sideHustles: {
      title: "Side Hustles for Parents",
      content: `
        Popular flexible income options:
        
        1. Freelancing in your professional field
        2. Online tutoring or teaching
        3. E-commerce or dropshipping
        4. Content creation (blogging, podcasting, social media)
        5. Virtual assistance or customer service
        
        Consider time requirements, startup costs, and potential income when evaluating opportunities.
      `,
      source: "FlexJobs",
      url: "https://www.flexjobs.com/"
    }
  }
};

export default financialKnowledgeBase;
