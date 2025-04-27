"""
Script to initialize the RAG system with financial knowledge.
This script loads financial documents, processes them, and creates a vector database.
"""

import os
import json
from vector_db.database import VectorDatabase
from vector_db.document_loader import DocumentLoader

def load_financial_knowledge():
    """
    Load financial knowledge from the data directory.
    For now, we'll use a simple JSON file with financial information.
    """
    # Create data directory if it doesn't exist
    os.makedirs("data", exist_ok=True)
    
    # Sample financial knowledge
    financial_knowledge = [
        {
            "title": "50/30/20 Budget Rule",
            "content": """The 50/30/20 rule is a budgeting guideline that suggests allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.
            
            Needs include essential expenses like housing, food, utilities, transportation, and healthcare.
            
            Wants include non-essential expenses like entertainment, dining out, subscriptions, and hobbies.
            
            Savings include emergency funds, retirement accounts, investments, and debt repayment beyond minimum payments.
            
            This rule provides a simple framework for financial planning and helps ensure a balanced approach to spending and saving.""",
            "source": "Financial Planning Basics",
            "url": "https://www.investopedia.com/ask/answers/022916/what-502030-budget-rule.asp"
        },
        {
            "title": "Emergency Fund",
            "content": """An emergency fund is money set aside for unexpected expenses or financial emergencies.
            
            Financial experts typically recommend saving 3-6 months of living expenses in an easily accessible account like a high-yield savings account.
            
            The purpose of an emergency fund is to provide financial security and prevent the need to rely on credit cards or loans during emergencies.
            
            Start by saving $1,000, then work toward one month of expenses, and gradually build up to the recommended 3-6 months.""",
            "source": "Emergency Fund Basics",
            "url": "https://www.nerdwallet.com/article/banking/emergency-fund-why-it-matters"
        },
        {
            "title": "Debt Repayment Strategies",
            "content": """There are two popular debt repayment strategies: the debt snowball and the debt avalanche.
            
            The debt snowball method involves paying off debts from smallest to largest balance, regardless of interest rate. This method provides psychological wins as debts are paid off quickly.
            
            The debt avalanche method involves paying off debts in order of highest to lowest interest rate. This method saves the most money in interest over time.
            
            Both methods require making minimum payments on all debts while putting extra money toward the target debt.""",
            "source": "Debt Repayment Strategies",
            "url": "https://www.ramseysolutions.com/debt/debt-snowball-vs-debt-avalanche"
        },
        {
            "title": "Retirement Accounts",
            "content": """Retirement accounts like 401(k)s and IRAs offer tax advantages for saving for retirement.
            
            A traditional 401(k) or IRA uses pre-tax contributions, reducing your current taxable income. Withdrawals in retirement are taxed as ordinary income.
            
            A Roth 401(k) or Roth IRA uses after-tax contributions, but qualified withdrawals in retirement are tax-free.
            
            Many employers offer matching contributions to 401(k) plans, which is essentially free money. Financial advisors typically recommend contributing at least enough to get the full employer match.""",
            "source": "Retirement Planning Basics",
            "url": "https://www.fidelity.com/retirement-ira/overview"
        },
        {
            "title": "Credit Score Factors",
            "content": """Your credit score is calculated based on several factors:
            
            Payment history (35%): Whether you've paid your bills on time
            Amounts owed (30%): How much debt you have, especially relative to your credit limits
            Length of credit history (15%): How long you've had credit accounts
            New credit (10%): How many new accounts you've opened recently
            Credit mix (10%): The variety of credit accounts you have
            
            To improve your score: pay bills on time, keep credit card balances low, don't close old accounts, and limit new credit applications.""",
            "source": "Credit Score Basics",
            "url": "https://www.myfico.com/credit-education/whats-in-your-credit-score"
        }
    ]
    
    # Save the knowledge to a JSON file
    with open("data/financial_knowledge.json", "w") as f:
        json.dump(financial_knowledge, f, indent=2)
    
    return financial_knowledge

def initialize_vector_database():
    """
    Initialize the vector database with financial knowledge.
    """
    # Load financial knowledge
    financial_knowledge = load_financial_knowledge()
    
    # Prepare documents
    texts = [item["content"] for item in financial_knowledge]
    metadatas = [{"title": item["title"], "source": item["source"], "url": item.get("url", "")} 
                for item in financial_knowledge]
    
    # Create document loader
    loader = DocumentLoader()
    documents = loader.create_documents_from_texts(texts, metadatas)
    
    # Create vector database
    vector_db = VectorDatabase()
    vector_db.create_index_from_documents(documents)
    
    print(f"Vector database initialized with {len(documents)} documents.")

if __name__ == "__main__":
    initialize_vector_database()
    print("RAG system initialization complete.")
