from typing import List
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

class DocumentLoader:
    """
    Utility for loading and processing documents for the RAG system.
    """
    
    def __init__(self, chunk_size=1000, chunk_overlap=200):
        """
        Initialize the document loader.
        
        Args:
            chunk_size: Size of text chunks for splitting documents
            chunk_overlap: Overlap between chunks
        """
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )
    
    def create_documents_from_texts(self, texts: List[str], metadatas: List[dict] = None) -> List[Document]:
        """
        Create Document objects from a list of texts.
        
        Args:
            texts: List of text strings
            metadatas: Optional list of metadata dictionaries
            
        Returns:
            List of Document objects
        """
        if metadatas is None:
            metadatas = [{} for _ in texts]
            
        documents = [Document(page_content=text, metadata=metadata) 
                    for text, metadata in zip(texts, metadatas)]
        
        return self.split_documents(documents)
    
    def split_documents(self, documents: List[Document]) -> List[Document]:
        """
        Split documents into chunks.
        
        Args:
            documents: List of Document objects
            
        Returns:
            List of chunked Document objects
        """
        return self.text_splitter.split_documents(documents)
