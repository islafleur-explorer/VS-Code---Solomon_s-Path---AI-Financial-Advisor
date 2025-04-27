from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import logging
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Import RAG system
from modules.rag_system import RAGSystem

# Initialize FastAPI app
app = FastAPI(
    title="SolomonSays Financial Advisor API",
    description="API for the SolomonSays financial advisor RAG system",
    version="0.1.0"
)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request and response models
class QueryRequest(BaseModel):
    query: str
    chat_history: Optional[List[Dict[str, Any]]] = []

class Citation(BaseModel):
    source_title: str
    source_url: Optional[str] = None
    relevance: float
    quote: Optional[str] = None

class QueryResponse(BaseModel):
    answer: str
    citations: Optional[List[Citation]] = []
    confidence: float
    follow_up_questions: List[str]

class ContentIngestionRequest(BaseModel):
    content_source: str
    source_type: str = "json"

# Initialize RAG system
rag_system = None

def get_rag_system():
    global rag_system
    if rag_system is None:
        try:
            # Initialize with default settings
            rag_system = RAGSystem(
                embedding_model_name="all-MiniLM-L6-v2",
                embedding_provider="huggingface",
                llm_model_name="gpt-3.5-turbo",
                llm_temperature=0.2
            )

            # Load sample financial knowledge if available
            sample_knowledge_path = os.path.join("data", "financial_knowledge.json")
            if os.path.exists(sample_knowledge_path):
                rag_system.ingest_content(sample_knowledge_path, source_type="json")

        except Exception as e:
            logger.error(f"Error initializing RAG system: {e}")
            # Fall back to a placeholder if the model can't be initialized
            return None
    return rag_system

# Error handler for exceptions
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."}
    )

# Basic health check endpoint
@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "SolomonSays API is running"}

# RAG query endpoint
@app.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest, background_tasks: BackgroundTasks):
    """
    Process a query using the RAG system.
    """
    logger.info(f"Received query: {request.query}")

    try:
        system = get_rag_system()

        if system is None:
            # If the system couldn't be initialized, return a fallback response
            logger.warning("RAG system not available, returning fallback response")
            return {
                "answer": "I'm currently in maintenance mode and can't access my knowledge base. Please try again later or ask a different question.",
                "citations": [],
                "confidence": 0.0,
                "follow_up_questions": [
                    "Can you try asking a simpler question?",
                    "Would you like to know when the system will be back online?",
                    "Is there a specific financial topic you're interested in?"
                ]
            }

        # Process the query using the RAG system
        result = system.process_query(
            query=request.query,
            chat_history=request.chat_history
        )

        # Log the query and response for analysis
        background_tasks.add_task(
            log_query_response,
            query=request.query,
            response=result
        )

        return {
            "answer": result["answer"],
            "citations": result.get("citations", []),
            "confidence": result.get("confidence", 0.7),
            "follow_up_questions": result.get("follow_up_questions", [])
        }
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Content ingestion endpoint
@app.post("/api/ingest")
async def ingest_content(request: ContentIngestionRequest):
    """
    Ingest content into the RAG system.
    """
    logger.info(f"Ingesting content from {request.source_type} source: {request.content_source}")

    try:
        system = get_rag_system()

        if system is None:
            raise HTTPException(
                status_code=503,
                detail="RAG system not available"
            )

        # Ingest content
        success = system.ingest_content(
            content_source=request.content_source,
            source_type=request.source_type
        )

        if success:
            return {"status": "success", "message": "Content ingested successfully"}
        else:
            raise HTTPException(
                status_code=400,
                detail="Failed to ingest content"
            )
    except Exception as e:
        logger.error(f"Error ingesting content: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# System info endpoint
@app.get("/api/system-info")
async def system_info():
    """
    Get information about the RAG system.
    """
    try:
        system = get_rag_system()

        if system is None:
            raise HTTPException(
                status_code=503,
                detail="RAG system not available"
            )

        # Get system info
        info = system.get_system_info()

        return info
    except Exception as e:
        logger.error(f"Error getting system info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Function to log queries and responses for analysis
def log_query_response(query: str, response: Dict[str, Any]):
    """
    Log a query and its response for analysis.
    """
    try:
        # Create logs directory if it doesn't exist
        os.makedirs("logs", exist_ok=True)

        # Create log entry
        import datetime
        log_entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "query": query,
            "response": response
        }

        # Append to log file
        with open("logs/query_log.jsonl", "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        logger.error(f"Error logging query: {e}")

# Initialize sample financial knowledge
def initialize_sample_knowledge():
    """
    Initialize sample financial knowledge for the RAG system.
    """
    try:
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

        logger.info("Initialized sample financial knowledge")
    except Exception as e:
        logger.error(f"Error initializing sample financial knowledge: {e}")

# Initialize sample knowledge on startup
@app.on_event("startup")
async def startup_event():
    initialize_sample_knowledge()
    logger.info("API started")
