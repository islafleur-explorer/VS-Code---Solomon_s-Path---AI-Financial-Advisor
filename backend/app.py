from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import RAG model
from models.rag_model import RAGModel

# Initialize FastAPI app
app = FastAPI(
    title="SolomonSays Financial Assistant API",
    description="API for the SolomonSays financial assistant RAG system",
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

class Source(BaseModel):
    content: str
    metadata: Dict[str, Any]

class QueryResponse(BaseModel):
    answer: str
    sources: Optional[List[Source]] = None

# Initialize RAG model
rag_model = None

def get_rag_model():
    global rag_model
    if rag_model is None:
        try:
            rag_model = RAGModel()
        except Exception as e:
            print(f"Error initializing RAG model: {e}")
            # Fall back to a placeholder if the model can't be initialized
            return None
    return rag_model

# Basic health check endpoint
@app.get("/")
async def root():
    return {"status": "ok", "message": "SolomonSays API is running"}

# RAG query endpoint
@app.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """
    Process a query using the RAG system.
    """
    try:
        model = get_rag_model()

        if model is None:
            # If the model couldn't be initialized, return a fallback response
            return {
                "answer": f"I'm currently in maintenance mode and can't access my knowledge base. Please try again later or ask a different question.",
                "sources": []
            }

        # Process the query using the RAG model
        result = model.query(request.query, request.chat_history)

        return {
            "answer": result["answer"],
            "sources": result["sources"]
        }
    except Exception as e:
        print(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Add more endpoints as needed for the RAG system
