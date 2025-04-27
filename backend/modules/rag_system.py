"""
RAG System Module for the SolomonSays Financial Advisor

This module integrates all the components of the RAG system:
- Content Ingestion
- Knowledge Base
- Query Processing
- Response Generation
"""

import os
import logging
from typing import List, Dict, Any, Optional, Union, Tuple
import json

from .content_ingestion import ContentIngestionModule
from .knowledge_base import KnowledgeBaseModule
from .query_processing import QueryProcessingModule
from .response_generation import ResponseGenerationModule
from langchain.schema import Document

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RAGSystem:
    """
    Retrieval-Augmented Generation system for the SolomonSays Financial Advisor.
    """
    
    def __init__(
        self,
        data_dir: str = "data",
        embedding_model_name: str = "all-MiniLM-L6-v2",
        embedding_provider: str = "huggingface",
        llm_model_name: str = "gpt-3.5-turbo",
        llm_temperature: float = 0.2,
        max_tokens: int = 1000
    ):
        """
        Initialize the RAG system.
        
        Args:
            data_dir: Directory to store data
            embedding_model_name: Name of the embedding model to use
            embedding_provider: Provider of the embedding model ('huggingface' or 'openai')
            llm_model_name: Name of the language model to use
            llm_temperature: Temperature for response generation
            max_tokens: Maximum number of tokens in the response
        """
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        
        # Initialize components
        logger.info("Initializing RAG system components")
        
        self.content_ingestion = ContentIngestionModule(data_dir=data_dir)
        
        self.knowledge_base = KnowledgeBaseModule(
            embedding_model_name=embedding_model_name,
            embedding_provider=embedding_provider,
            data_dir=data_dir
        )
        
        self.query_processing = QueryProcessingModule()
        
        self.response_generation = ResponseGenerationModule(
            model_name=llm_model_name,
            temperature=llm_temperature,
            max_tokens=max_tokens
        )
        
        logger.info("RAG system initialized")
    
    def ingest_content(self, content_source: Union[str, List[Dict[str, Any]]], source_type: str = "json") -> bool:
        """
        Ingest content into the RAG system.
        
        Args:
            content_source: Path to content file or list of content items
            source_type: Type of content source ('json', 'url', 'pdf', 'csv', or 'direct')
            
        Returns:
            True if ingestion was successful, False otherwise
        """
        logger.info(f"Ingesting content from {source_type} source")
        
        try:
            # Ingest content based on source type
            if source_type == "json" and isinstance(content_source, str):
                content_items = self.content_ingestion.ingest_from_json(content_source)
            elif source_type == "url" and isinstance(content_source, str):
                content_item = self.content_ingestion.ingest_from_url(content_source)
                content_items = [content_item] if content_item else []
            elif source_type == "pdf" and isinstance(content_source, str):
                content_item = self.content_ingestion.ingest_from_pdf(content_source)
                content_items = [content_item] if content_item else []
            elif source_type == "csv" and isinstance(content_source, str):
                # Assume the first column is content and the second is title
                content_items = self.content_ingestion.ingest_from_csv(
                    content_source, 
                    content_col="content", 
                    title_col="title"
                )
            elif source_type == "direct" and isinstance(content_source, list):
                content_items = self.content_ingestion.ingest_financial_knowledge(content_source)
            else:
                logger.error(f"Invalid content source or source type: {source_type}")
                return False
            
            # Add content to knowledge base
            if content_items:
                self.knowledge_base.add_financial_knowledge(content_items)
                logger.info(f"Successfully ingested {len(content_items)} content items")
                return True
            else:
                logger.warning("No content items were ingested")
                return False
            
        except Exception as e:
            logger.error(f"Error ingesting content: {str(e)}")
            return False
    
    def process_query(
        self,
        query: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        num_results: int = 5
    ) -> Dict[str, Any]:
        """
        Process a user query and generate a response.
        
        Args:
            query: The user's query
            chat_history: Optional list of previous chat messages
            num_results: Number of results to retrieve
            
        Returns:
            Dictionary containing the response
        """
        logger.info(f"Processing query: {query}")
        
        try:
            # Process the query
            processed_query = self.query_processing.process_query(query)
            
            # Generate search queries
            search_queries = self.query_processing.generate_search_queries(processed_query)
            
            # Retrieve relevant documents
            all_documents = []
            for search_query in search_queries:
                documents = self.knowledge_base.similarity_search(
                    search_query,
                    k=num_results
                )
                all_documents.extend(documents)
            
            # Remove duplicates
            unique_documents = self._deduplicate_documents(all_documents)
            
            # Generate response
            response = self.response_generation.generate_response(
                query=query,
                retrieved_documents=unique_documents[:num_results],
                chat_history=chat_history
            )
            
            # Add metadata
            response["query"] = query
            response["processed_query"] = processed_query
            response["num_documents_retrieved"] = len(unique_documents)
            
            logger.info(f"Generated response with confidence: {response['confidence']}")
            return response
            
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return {
                "answer": f"I'm sorry, I encountered an error while processing your query. Please try asking your question differently.",
                "citations": [],
                "confidence": 0.0,
                "follow_up_questions": [],
                "query": query,
                "error": str(e)
            }
    
    def _deduplicate_documents(self, documents: List[Document]) -> List[Document]:
        """
        Remove duplicate documents based on content.
        
        Args:
            documents: List of Document objects
            
        Returns:
            List of unique Document objects
        """
        unique_docs = []
        seen_contents = set()
        
        for doc in documents:
            # Create a hash of the content
            content_hash = hash(doc.page_content)
            
            if content_hash not in seen_contents:
                unique_docs.append(doc)
                seen_contents.add(content_hash)
        
        return unique_docs
    
    def get_system_info(self) -> Dict[str, Any]:
        """
        Get information about the RAG system.
        
        Returns:
            Dictionary containing system information
        """
        # Get knowledge base metadata
        kb_metadata = self.knowledge_base.get_metadata()
        
        # Get content registry
        content_registry = self.content_ingestion.registry if hasattr(self.content_ingestion, "registry") else {}
        
        return {
            "knowledge_base": kb_metadata,
            "content_registry": content_registry,
            "embedding_model": self.knowledge_base.embedding_model_name,
            "embedding_provider": self.knowledge_base.embedding_provider,
            "llm_model": self.response_generation.model_name,
            "llm_temperature": self.response_generation.temperature
        }
