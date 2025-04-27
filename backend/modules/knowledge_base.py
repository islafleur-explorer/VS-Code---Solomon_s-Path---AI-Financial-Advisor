"""
Knowledge Base Module for the SolomonSays Financial Advisor

This module is responsible for storing and retrieving financial knowledge using vector embeddings.
"""

import os
import json
import logging
import pickle
from typing import List, Dict, Any, Optional, Union, Tuple
import numpy as np
from pathlib import Path

import faiss
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings, OpenAIEmbeddings
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class KnowledgeBaseModule:
    """
    Module for storing and retrieving financial knowledge using vector embeddings.
    """
    
    def __init__(
        self, 
        embedding_model_name: str = "all-MiniLM-L6-v2",
        embedding_provider: str = "huggingface",
        data_dir: str = "data",
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ):
        """
        Initialize the knowledge base module.
        
        Args:
            embedding_model_name: Name of the embedding model to use
            embedding_provider: Provider of the embedding model ('huggingface' or 'openai')
            data_dir: Directory to store vector database
            chunk_size: Size of text chunks for splitting documents
            chunk_overlap: Overlap between chunks
        """
        self.data_dir = data_dir
        self.vector_store_dir = os.path.join(data_dir, "vector_store")
        self.metadata_path = os.path.join(self.vector_store_dir, "metadata.json")
        os.makedirs(self.vector_store_dir, exist_ok=True)
        
        # Initialize embeddings
        self.embedding_model_name = embedding_model_name
        self.embedding_provider = embedding_provider
        
        if embedding_provider == "openai":
            self.embeddings = OpenAIEmbeddings(model=embedding_model_name)
        else:
            self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model_name)
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )
        
        # Initialize vector store
        self.vector_store = None
        self._load_vector_store()
        
        # Initialize metadata
        self.metadata = self._load_metadata()
    
    def _load_vector_store(self):
        """Load the vector store if it exists."""
        try:
            if os.path.exists(self.vector_store_dir) and os.listdir(self.vector_store_dir):
                self.vector_store = FAISS.load_local(self.vector_store_dir, self.embeddings)
                logger.info(f"Loaded vector store from {self.vector_store_dir}")
            else:
                self.vector_store = None
                logger.info("No existing vector store found")
        except Exception as e:
            logger.error(f"Error loading vector store: {str(e)}")
            self.vector_store = None
    
    def _save_vector_store(self):
        """Save the vector store to disk."""
        if self.vector_store is not None:
            try:
                self.vector_store.save_local(self.vector_store_dir)
                logger.info(f"Saved vector store to {self.vector_store_dir}")
            except Exception as e:
                logger.error(f"Error saving vector store: {str(e)}")
    
    def _load_metadata(self) -> Dict[str, Any]:
        """Load metadata if it exists, or create a new metadata object."""
        if os.path.exists(self.metadata_path):
            try:
                with open(self.metadata_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading metadata: {str(e)}")
        
        # Create new metadata
        return {
            "document_count": 0,
            "chunk_count": 0,
            "embedding_model": self.embedding_model_name,
            "embedding_provider": self.embedding_provider,
            "sources": [],
            "last_updated": None
        }
    
    def _save_metadata(self):
        """Save metadata to disk."""
        import datetime
        self.metadata["last_updated"] = datetime.datetime.now().isoformat()
        
        try:
            with open(self.metadata_path, 'w') as f:
                json.dump(self.metadata, f, indent=2)
            logger.info(f"Saved metadata to {self.metadata_path}")
        except Exception as e:
            logger.error(f"Error saving metadata: {str(e)}")
    
    def add_documents(self, documents: List[Document]) -> None:
        """
        Add documents to the knowledge base.
        
        Args:
            documents: List of Document objects to add
        """
        logger.info(f"Adding {len(documents)} documents to knowledge base")
        
        try:
            # Split documents into chunks
            chunked_documents = self.text_splitter.split_documents(documents)
            logger.info(f"Split {len(documents)} documents into {len(chunked_documents)} chunks")
            
            # Add to vector store
            if self.vector_store is None:
                self.vector_store = FAISS.from_documents(chunked_documents, self.embeddings)
            else:
                self.vector_store.add_documents(chunked_documents)
            
            # Update metadata
            self.metadata["document_count"] += len(documents)
            self.metadata["chunk_count"] += len(chunked_documents)
            
            # Extract source information
            sources = set()
            for doc in documents:
                source = doc.metadata.get("source", "unknown")
                sources.add(source)
            
            # Add sources to metadata
            for source in sources:
                if source not in self.metadata["sources"]:
                    self.metadata["sources"].append(source)
            
            # Save vector store and metadata
            self._save_vector_store()
            self._save_metadata()
            
            logger.info(f"Successfully added documents to knowledge base")
        except Exception as e:
            logger.error(f"Error adding documents to knowledge base: {str(e)}")
    
    def add_texts(self, texts: List[str], metadatas: Optional[List[Dict[str, Any]]] = None) -> None:
        """
        Add texts to the knowledge base.
        
        Args:
            texts: List of text strings to add
            metadatas: Optional list of metadata dictionaries
        """
        logger.info(f"Adding {len(texts)} texts to knowledge base")
        
        try:
            # Create Document objects
            if metadatas is None:
                metadatas = [{} for _ in texts]
            
            documents = [Document(page_content=text, metadata=metadata) 
                        for text, metadata in zip(texts, metadatas)]
            
            # Add documents
            self.add_documents(documents)
            
            logger.info(f"Successfully added texts to knowledge base")
        except Exception as e:
            logger.error(f"Error adding texts to knowledge base: {str(e)}")
    
    def add_financial_knowledge(self, knowledge_items: List[Dict[str, Any]]) -> None:
        """
        Add financial knowledge items to the knowledge base.
        
        Args:
            knowledge_items: List of financial knowledge items
        """
        logger.info(f"Adding {len(knowledge_items)} financial knowledge items to knowledge base")
        
        try:
            texts = []
            metadatas = []
            
            for item in knowledge_items:
                # Extract content and metadata
                content = item.get("content", "")
                if not content:
                    logger.warning(f"Skipping item without content: {item}")
                    continue
                
                # Create metadata
                metadata = {
                    "title": item.get("title", ""),
                    "source": item.get("source", "financial_knowledge"),
                    "source_type": item.get("source_type", "knowledge_item"),
                    "url": item.get("url", "")
                }
                
                # Add any additional metadata
                if "metadata" in item and isinstance(item["metadata"], dict):
                    for key, value in item["metadata"].items():
                        metadata[key] = value
                
                texts.append(content)
                metadatas.append(metadata)
            
            # Add texts with metadata
            self.add_texts(texts, metadatas)
            
            logger.info(f"Successfully added financial knowledge items to knowledge base")
        except Exception as e:
            logger.error(f"Error adding financial knowledge items: {str(e)}")
    
    def similarity_search(
        self, 
        query: str, 
        k: int = 4,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Document]:
        """
        Perform a similarity search for the given query.
        
        Args:
            query: The query string
            k: Number of results to return
            filter_metadata: Optional metadata filter
            
        Returns:
            List of Document objects most similar to the query
        """
        logger.info(f"Performing similarity search for query: {query}")
        
        if self.vector_store is None:
            logger.warning("No vector store found. Please add documents first.")
            return []
        
        try:
            if filter_metadata:
                results = self.vector_store.similarity_search(
                    query, 
                    k=k,
                    filter=filter_metadata
                )
            else:
                results = self.vector_store.similarity_search(query, k=k)
            
            logger.info(f"Found {len(results)} results for query")
            return results
        except Exception as e:
            logger.error(f"Error performing similarity search: {str(e)}")
            return []
    
    def similarity_search_with_score(
        self, 
        query: str, 
        k: int = 4,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[Document, float]]:
        """
        Perform a similarity search with scores for the given query.
        
        Args:
            query: The query string
            k: Number of results to return
            filter_metadata: Optional metadata filter
            
        Returns:
            List of tuples containing Document objects and their similarity scores
        """
        logger.info(f"Performing similarity search with scores for query: {query}")
        
        if self.vector_store is None:
            logger.warning("No vector store found. Please add documents first.")
            return []
        
        try:
            if filter_metadata:
                results = self.vector_store.similarity_search_with_score(
                    query, 
                    k=k,
                    filter=filter_metadata
                )
            else:
                results = self.vector_store.similarity_search_with_score(query, k=k)
            
            logger.info(f"Found {len(results)} results for query")
            return results
        except Exception as e:
            logger.error(f"Error performing similarity search with scores: {str(e)}")
            return []
    
    def get_relevant_documents(self, query: str, k: int = 4) -> List[Document]:
        """
        Get documents relevant to the query (alias for similarity_search).
        
        Args:
            query: The query string
            k: Number of results to return
            
        Returns:
            List of Document objects relevant to the query
        """
        return self.similarity_search(query, k=k)
    
    def get_metadata(self) -> Dict[str, Any]:
        """
        Get metadata about the knowledge base.
        
        Returns:
            Dictionary containing metadata
        """
        return self.metadata
