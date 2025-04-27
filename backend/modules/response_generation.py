"""
Response Generation Module for the SolomonSays Financial Advisor

This module is responsible for generating responses to user queries using retrieved context
and language models, with citations to educational content.
"""

import os
import logging
from typing import List, Dict, Any, Optional, Union, Tuple
import json
import re

from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate, ChatPromptTemplate
from langchain.chains import LLMChain
from langchain.schema import Document, HumanMessage, AIMessage, SystemMessage
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define output schemas
class Citation(BaseModel):
    """Citation for a source used in the response."""
    source_title: str = Field(description="Title of the source document")
    source_url: Optional[str] = Field(None, description="URL of the source document if available")
    relevance: float = Field(description="Relevance score from 0.0 to 1.0")
    quote: Optional[str] = Field(None, description="Relevant quote from the source")

class FinancialResponse(BaseModel):
    """Structured financial response with citations."""
    answer: str = Field(description="The answer to the user's question")
    citations: List[Citation] = Field(description="Citations for sources used in the answer")
    confidence: float = Field(description="Confidence score from 0.0 to 1.0")
    follow_up_questions: List[str] = Field(description="Suggested follow-up questions")

class ResponseGenerationModule:
    """
    Module for generating responses to user queries with citations.
    """
    
    def __init__(
        self,
        model_name: str = "gpt-3.5-turbo",
        temperature: float = 0.2,
        max_tokens: int = 1000
    ):
        """
        Initialize the response generation module.
        
        Args:
            model_name: Name of the language model to use
            temperature: Temperature for response generation
            max_tokens: Maximum number of tokens in the response
        """
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        
        # Initialize language model
        self.llm = ChatOpenAI(
            model_name=model_name,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        # Initialize output parser
        self.output_parser = PydanticOutputParser(pydantic_object=FinancialResponse)
        
        # Initialize prompt templates
        self._initialize_prompts()
    
    def _initialize_prompts(self):
        """Initialize prompt templates for response generation."""
        # System prompt for financial advisor
        self.system_prompt = """You are SolomonSays, a helpful and knowledgeable financial assistant.
Your goal is to provide accurate, helpful financial advice based on the retrieved context.
Always cite your sources and be transparent about the limitations of your knowledge.
If you don't know the answer or don't have enough information, say so rather than making up information.
Focus on providing practical, actionable advice that users can apply to their financial situations.
"""
        
        # Prompt for generating responses with citations
        self.response_prompt_template = """
{system_prompt}

USER QUERY: {query}

RETRIEVED CONTEXT:
{context}

INSTRUCTIONS:
1. Answer the user's question based on the retrieved context.
2. Cite your sources clearly.
3. If the context doesn't contain enough information, acknowledge the limitations.
4. Provide practical, actionable advice when appropriate.
5. Suggest 2-3 relevant follow-up questions the user might want to ask.

Your response should be formatted as a JSON object with the following structure:
{format_instructions}

Remember to be helpful, accurate, and transparent about the sources of your information.
"""
        
        # Create the prompt template
        self.response_prompt = PromptTemplate(
            template=self.response_prompt_template,
            input_variables=["query", "context"],
            partial_variables={
                "system_prompt": self.system_prompt,
                "format_instructions": self.output_parser.get_format_instructions()
            }
        )
        
        # Create the response chain
        self.response_chain = LLMChain(
            llm=self.llm,
            prompt=self.response_prompt
        )
    
    def generate_response(
        self,
        query: str,
        retrieved_documents: List[Document],
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Generate a response to a user query using retrieved documents.
        
        Args:
            query: The user's query
            retrieved_documents: List of retrieved Document objects
            chat_history: Optional list of previous chat messages
            
        Returns:
            Dictionary containing the generated response
        """
        logger.info(f"Generating response for query: {query}")
        
        try:
            # Format retrieved documents as context
            context = self._format_context(retrieved_documents)
            
            # Generate response
            response = self.response_chain.run(
                query=query,
                context=context
            )
            
            # Parse the response
            try:
                parsed_response = self._parse_response(response)
                logger.info(f"Generated response with {len(parsed_response['citations'])} citations")
                return parsed_response
            except Exception as e:
                logger.error(f"Error parsing response: {str(e)}")
                # Fall back to a simpler response format
                return self._generate_simple_response(query, retrieved_documents, response)
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return {
                "answer": f"I'm sorry, I encountered an error while generating a response. Please try asking your question differently.",
                "citations": [],
                "confidence": 0.0,
                "follow_up_questions": []
            }
    
    def _format_context(self, documents: List[Document]) -> str:
        """
        Format retrieved documents as context for the language model.
        
        Args:
            documents: List of retrieved Document objects
            
        Returns:
            Formatted context string
        """
        if not documents:
            return "No relevant information found."
        
        context_parts = []
        
        for i, doc in enumerate(documents):
            # Extract metadata
            title = doc.metadata.get("title", f"Document {i+1}")
            source = doc.metadata.get("source", "Unknown source")
            url = doc.metadata.get("url", "")
            
            # Format document
            doc_text = f"[{i+1}] {title} (Source: {source})"
            if url:
                doc_text += f" [URL: {url}]"
            doc_text += f"\nContent: {doc.page_content}\n"
            
            context_parts.append(doc_text)
        
        return "\n".join(context_parts)
    
    def _parse_response(self, response: str) -> Dict[str, Any]:
        """
        Parse the generated response into a structured format.
        
        Args:
            response: The generated response string
            
        Returns:
            Dictionary containing the parsed response
        """
        # Extract JSON from the response
        json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find JSON without the markdown code block
            json_match = re.search(r'(\{.*\})', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                raise ValueError("Could not extract JSON from response")
        
        # Parse JSON
        parsed = json.loads(json_str)
        
        # Validate required fields
        required_fields = ["answer", "citations", "confidence", "follow_up_questions"]
        for field in required_fields:
            if field not in parsed:
                parsed[field] = [] if field in ["citations", "follow_up_questions"] else (0.0 if field == "confidence" else "")
        
        return parsed
    
    def _generate_simple_response(
        self,
        query: str,
        documents: List[Document],
        raw_response: str
    ) -> Dict[str, Any]:
        """
        Generate a simple response when parsing fails.
        
        Args:
            query: The user's query
            documents: List of retrieved Document objects
            raw_response: The raw response from the language model
            
        Returns:
            Dictionary containing a simple response
        """
        logger.info("Falling back to simple response format")
        
        # Extract the main response text
        answer = raw_response
        
        # Try to clean up the response
        if "```json" in answer:
            answer = answer.replace("```json", "").replace("```", "")
        
        # Create simple citations
        citations = []
        for i, doc in enumerate(documents):
            title = doc.metadata.get("title", f"Document {i+1}")
            url = doc.metadata.get("url", "")
            
            citations.append({
                "source_title": title,
                "source_url": url,
                "relevance": 1.0 / (i + 1),  # Simple relevance score
                "quote": None
            })
        
        return {
            "answer": answer,
            "citations": citations,
            "confidence": 0.7,  # Default confidence
            "follow_up_questions": [
                "Can you explain more about this topic?",
                "What are the next steps I should take?"
            ]
        }
    
    def generate_follow_up_questions(
        self,
        query: str,
        answer: str,
        num_questions: int = 3
    ) -> List[str]:
        """
        Generate follow-up questions based on the query and answer.
        
        Args:
            query: The user's query
            answer: The generated answer
            num_questions: Number of follow-up questions to generate
            
        Returns:
            List of follow-up questions
        """
        logger.info(f"Generating {num_questions} follow-up questions")
        
        try:
            # Create prompt for follow-up questions
            prompt = f"""
Based on the following user query and the answer provided, generate {num_questions} relevant follow-up questions that the user might want to ask next.

USER QUERY: {query}

ANSWER: {answer}

FOLLOW-UP QUESTIONS:
"""
            
            # Generate follow-up questions
            response = self.llm([HumanMessage(content=prompt)])
            
            # Parse the response
            questions = []
            for line in response.content.strip().split("\n"):
                # Remove numbering and other formatting
                clean_line = re.sub(r'^\d+[\.\)]\s*', '', line).strip()
                if clean_line:
                    questions.append(clean_line)
            
            # Limit to requested number
            return questions[:num_questions]
            
        except Exception as e:
            logger.error(f"Error generating follow-up questions: {str(e)}")
            return [
                "Can you explain more about this topic?",
                "What are the next steps I should take?",
                "How does this apply to my specific situation?"
            ][:num_questions]
