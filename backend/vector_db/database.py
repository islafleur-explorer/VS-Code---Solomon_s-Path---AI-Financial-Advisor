import os
import pickle
from typing import List, Dict, Any

import faiss
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document

class VectorDatabase:
    """
    Vector database for storing and retrieving document embeddings.
    """
    
    def __init__(self, embedding_model_name="all-MiniLM-L6-v2"):
        """
        Initialize the vector database with the specified embedding model.
        
        Args:
            embedding_model_name: Name of the HuggingFace embedding model to use
        """
        self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model_name)
        self.vector_store = None
        self.index_path = os.path.join(os.path.dirname(__file__), "../data/vector_store")
    
    def create_index_from_documents(self, documents: List[Document]) -> None:
        """
        Create a new vector index from a list of documents.
        
        Args:
            documents: List of Document objects to index
        """
        self.vector_store = FAISS.from_documents(documents, self.embeddings)
        self._save_index()
    
    def add_documents(self, documents: List[Document]) -> None:
        """
        Add documents to an existing index.
        
        Args:
            documents: List of Document objects to add
        """
        if self.vector_store is None:
            self.create_index_from_documents(documents)
        else:
            self.vector_store.add_documents(documents)
            self._save_index()
    
    def similarity_search(self, query: str, k: int = 4) -> List[Document]:
        """
        Perform a similarity search for the given query.
        
        Args:
            query: The query string
            k: Number of results to return
            
        Returns:
            List of Document objects most similar to the query
        """
        if self.vector_store is None:
            self._load_index()
            
        if self.vector_store is None:
            raise ValueError("No vector store found. Please create an index first.")
            
        return self.vector_store.similarity_search(query, k=k)
    
    def _save_index(self) -> None:
        """Save the vector store to disk."""
        if self.vector_store is not None:
            os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
            self.vector_store.save_local(self.index_path)
    
    def _load_index(self) -> None:
        """Load the vector store from disk if it exists."""
        if os.path.exists(self.index_path):
            self.vector_store = FAISS.load_local(self.index_path, self.embeddings)
        else:
            self.vector_store = None
