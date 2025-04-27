# SolomonSays RAG System Module Structure

This document outlines the modular architecture of the SolomonSays RAG (Retrieval-Augmented Generation) system.

## Phase 1: RAG System & Vector Database

### Content Ingestion Module
- **File**: `modules/content_ingestion.py`
- **Responsibility**: Process financial educational materials from various sources
- **Key Functions**:
  - `ingest_from_json`: Ingest content from JSON files
  - `ingest_from_url`: Ingest content from web URLs
  - `ingest_from_pdf`: Ingest content from PDF files
  - `ingest_from_csv`: Ingest content from CSV files
  - `ingest_financial_knowledge`: Ingest directly provided financial knowledge

### Knowledge Base Module
- **File**: `modules/knowledge_base.py`
- **Responsibility**: Store and retrieve financial knowledge using vector embeddings
- **Key Functions**:
  - `add_documents`: Add documents to the knowledge base
  - `add_texts`: Add text strings to the knowledge base
  - `add_financial_knowledge`: Add financial knowledge items to the knowledge base
  - `similarity_search`: Perform similarity search for a query
  - `similarity_search_with_score`: Perform similarity search with relevance scores

### Query Processing Module
- **File**: `modules/query_processing.py`
- **Responsibility**: Process user queries, extract intents, and prepare for RAG
- **Key Functions**:
  - `process_query`: Process a user query to extract intents
  - `generate_search_queries`: Generate search queries for the RAG system
  - `_extract_topics`: Extract financial topics from a query
  - `_determine_complexity`: Determine the complexity of a query

### Response Generation Module
- **File**: `modules/response_generation.py`
- **Responsibility**: Generate responses to user queries with citations
- **Key Functions**:
  - `generate_response`: Generate a response to a user query
  - `generate_follow_up_questions`: Generate follow-up questions based on the query and answer

### RAG System Module
- **File**: `modules/rag_system.py`
- **Responsibility**: Integrate all RAG components
- **Key Functions**:
  - `ingest_content`: Ingest content into the RAG system
  - `process_query`: Process a user query and generate a response
  - `get_system_info`: Get information about the RAG system

## Phase 2: AI Verification & Orchestration (Future Implementation)

### AI Verification and Validation Module
- **Planned File**: `modules/verification.py`
- **Responsibility**: Implement fact-checking for financial advice
- **Planned Functions**:
  - `verify_response`: Verify the accuracy of a generated response
  - `calculate_confidence`: Calculate confidence score for a response
  - `validate_content`: Validate the accuracy of content

### AI Orchestration Platform
- **Planned File**: `modules/orchestration.py`
- **Responsibility**: Coordinate between RAG, budget tools, and UI
- **Planned Functions**:
  - `route_query`: Route a query to the appropriate AI component
  - `combine_responses`: Combine responses from multiple AI components
  - `manage_workflow`: Manage the workflow of AI components

### LLM Fine-tuning Framework
- **Planned File**: `modules/fine_tuning.py`
- **Responsibility**: Fine-tune language models for financial domain
- **Planned Functions**:
  - `prepare_dataset`: Prepare a dataset for fine-tuning
  - `fine_tune_model`: Fine-tune a language model
  - `evaluate_model`: Evaluate a fine-tuned model

## API Integration

### FastAPI Application
- **File**: `app.py`
- **Responsibility**: Provide API endpoints for the frontend
- **Key Endpoints**:
  - `/api/query`: Process a query using the RAG system
  - `/api/ingest`: Ingest content into the RAG system
  - `/api/system-info`: Get information about the RAG system

## Frontend Integration

### API Service
- **File**: `src/services/api.js`
- **Responsibility**: Communicate with the backend API
- **Key Functions**:
  - `sendQuery`: Send a query to the RAG system
  - `checkApiAvailability`: Check if the API is available
  - `getSystemInfo`: Get information about the RAG system
  - `ingestContent`: Ingest content into the RAG system

### ChatBot Component
- **File**: `src/modules/chatbot/ChatBot.jsx`
- **Responsibility**: Provide a user interface for interacting with the RAG system
- **Key Features**:
  - Chat interface with message history
  - Support for follow-up suggestions
  - Display of sources and confidence scores
  - Fallback to hardcoded responses when API is unavailable
