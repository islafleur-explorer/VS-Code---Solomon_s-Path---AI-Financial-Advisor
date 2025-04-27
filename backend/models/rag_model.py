from typing import List, Dict, Any, Optional
import os
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate

from ..vector_db.database import VectorDatabase

class RAGModel:
    """
    Retrieval-Augmented Generation model for answering financial questions.
    """
    
    def __init__(self, model_name="gpt-3.5-turbo"):
        """
        Initialize the RAG model.
        
        Args:
            model_name: Name of the OpenAI model to use
        """
        self.vector_db = VectorDatabase()
        
        # Initialize the language model
        self.llm = ChatOpenAI(
            model_name=model_name,
            temperature=0.2,
        )
        
        # Create a conversation memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"
        )
        
        # Create the retrieval chain
        self._create_chain()
    
    def _create_chain(self):
        """Create the conversational retrieval chain."""
        # Custom prompt template
        template = """You are SolomonSays, a helpful and knowledgeable financial assistant.
        Use the following pieces of context to answer the user's question.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        Keep your answers focused on financial topics and advice.
        
        Context: {context}
        
        Question: {question}
        
        Answer:"""
        
        QA_PROMPT = PromptTemplate(
            template=template, input_variables=["context", "question"]
        )
        
        # Create the chain
        self.chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=self.vector_db.similarity_search,
            memory=self.memory,
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": QA_PROMPT}
        )
    
    def query(self, query: str, chat_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Process a query using the RAG system.
        
        Args:
            query: The user's question
            chat_history: Optional list of previous interactions
            
        Returns:
            Dictionary containing the answer and source documents
        """
        # Format chat history if provided
        formatted_history = []
        if chat_history:
            for message in chat_history:
                if message["sender"] == "user":
                    formatted_history.append((message["message"], ""))
                else:
                    # Append the bot's response to the last user message
                    if formatted_history:
                        formatted_history[-1] = (formatted_history[-1][0], message["message"])
        
        # Run the chain
        result = self.chain({"question": query, "chat_history": formatted_history})
        
        # Extract source documents
        sources = []
        for doc in result.get("source_documents", []):
            sources.append({
                "content": doc.page_content,
                "metadata": doc.metadata
            })
        
        return {
            "answer": result["answer"],
            "sources": sources
        }
