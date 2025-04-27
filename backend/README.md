# SolomonSays Financial Advisor RAG Backend

This is the backend for the SolomonSays financial advisor, implementing a Retrieval-Augmented Generation (RAG) system for answering financial questions.

## Architecture

The backend follows a modular architecture with clear separation of concerns:

1. **Content Ingestion Module**: Processes financial educational materials from various sources
2. **Knowledge Base Module**: Stores and retrieves financial knowledge using vector embeddings
3. **Query Processing Module**: Processes user queries, extracts intents, and prepares for RAG
4. **Response Generation Module**: Generates responses to user queries with citations
5. **RAG System Module**: Integrates all RAG components

For more details, see [MODULE_STRUCTURE.md](./MODULE_STRUCTURE.md).

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

## Running the Backend

Start the FastAPI server:
```
uvicorn app:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access the API documentation at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## API Endpoints

### Health Check
```
GET /
```
Returns a simple health check response.

### Query
```
POST /api/query
```
Process a query using the RAG system.

Request body:
```json
{
  "query": "What is the 50/30/20 budget rule?",
  "chat_history": [
    {
      "sender": "user",
      "message": "Hello"
    },
    {
      "sender": "bot",
      "message": "Hi there! How can I help you with your financial questions today?"
    }
  ]
}
```

Response:
```json
{
  "answer": "The 50/30/20 rule is a budgeting guideline that suggests allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.",
  "citations": [
    {
      "source_title": "50/30/20 Budget Rule",
      "source_url": "https://www.investopedia.com/ask/answers/022916/what-502030-budget-rule.asp",
      "relevance": 0.95,
      "quote": "The 50/30/20 rule is a budgeting guideline that suggests allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment."
    }
  ],
  "confidence": 0.92,
  "follow_up_questions": [
    "How do I determine what counts as a need versus a want?",
    "How can I start implementing the 50/30/20 rule in my budget?",
    "What if my needs are more than 50% of my income?"
  ]
}
```

### Ingest Content
```
POST /api/ingest
```
Ingest content into the RAG system.

Request body:
```json
{
  "content_source": "https://www.investopedia.com/terms/b/budget.asp",
  "source_type": "url"
}
```

Response:
```json
{
  "status": "success",
  "message": "Content ingested successfully"
}
```

### System Info
```
GET /api/system-info
```
Get information about the RAG system.

Response:
```json
{
  "knowledge_base": {
    "document_count": 5,
    "chunk_count": 15,
    "embedding_model": "all-MiniLM-L6-v2",
    "embedding_provider": "huggingface",
    "sources": [
      "Financial Planning Basics",
      "Emergency Fund Basics",
      "Debt Repayment Strategies",
      "Retirement Planning Basics",
      "Credit Score Basics"
    ],
    "last_updated": "2023-06-01T12:34:56.789Z"
  },
  "content_registry": {
    "sources": [
      {
        "type": "json",
        "path": "data/financial_knowledge.json",
        "raw_path": "data/raw/financial_knowledge.json",
        "processed_path": "data/processed/processed_financial_knowledge.json",
        "item_count": 5,
        "ingested_at": "2023-06-01T12:34:56.789Z"
      }
    ],
    "last_updated": "2023-06-01T12:34:56.789Z"
  },
  "embedding_model": "all-MiniLM-L6-v2",
  "embedding_provider": "huggingface",
  "llm_model": "gpt-3.5-turbo",
  "llm_temperature": 0.2
}
```

## Development

### Project Structure

```
backend/
├── app.py                  # FastAPI application
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (create this file)
├── MODULE_STRUCTURE.md     # Module structure documentation
├── data/                   # Data directory
│   ├── raw/                # Raw ingested content
│   ├── processed/          # Processed content
│   ├── vector_store/       # Vector database files
│   └── financial_knowledge.json  # Sample financial knowledge
├── logs/                   # Log files
│   └── query_log.jsonl     # Query log
└── modules/                # RAG system modules
    ├── content_ingestion.py  # Content ingestion module
    ├── knowledge_base.py     # Knowledge base module
    ├── query_processing.py   # Query processing module
    ├── response_generation.py  # Response generation module
    └── rag_system.py        # RAG system module
```

### Adding New Content

You can add new financial content to the RAG system using the `/api/ingest` endpoint or by modifying the `financial_knowledge.json` file.

### Customizing the RAG System

You can customize the RAG system by modifying the modules in the `modules/` directory. Each module has a clear responsibility and can be modified independently.

## Future Enhancements

- **AI Verification and Validation**: Implement fact-checking for financial advice
- **AI Orchestration Platform**: Coordinate between RAG, budget tools, and UI
- **LLM Fine-tuning Framework**: Fine-tune language models for financial domain
