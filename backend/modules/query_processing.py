"""
Query Processing Module for the SolomonSays Financial Advisor

This module is responsible for processing user queries, extracting intents,
and preparing them for the RAG system.
"""

import re
import logging
from typing import List, Dict, Any, Optional, Tuple
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class QueryProcessingModule:
    """
    Module for processing user queries and extracting intents.
    """
    
    def __init__(self, financial_topics_path: Optional[str] = None):
        """
        Initialize the query processing module.
        
        Args:
            financial_topics_path: Optional path to a JSON file containing financial topics
        """
        self.financial_topics = self._load_financial_topics(financial_topics_path)
    
    def _load_financial_topics(self, financial_topics_path: Optional[str]) -> Dict[str, List[str]]:
        """
        Load financial topics from a JSON file or use default topics.
        
        Args:
            financial_topics_path: Path to a JSON file containing financial topics
            
        Returns:
            Dictionary mapping topic categories to lists of related terms
        """
        default_topics = {
            "budgeting": [
                "budget", "budgeting", "50/30/20", "envelope", "zero-based", 
                "expense", "spending", "income", "cash flow", "track expenses"
            ],
            "saving": [
                "save", "saving", "savings", "emergency fund", "rainy day fund",
                "sinking fund", "save money", "savings rate", "savings account"
            ],
            "investing": [
                "invest", "investing", "investment", "stock", "bond", "etf",
                "mutual fund", "index fund", "portfolio", "asset allocation",
                "diversification", "retirement", "401k", "ira", "roth"
            ],
            "debt": [
                "debt", "loan", "credit card", "mortgage", "student loan",
                "car loan", "personal loan", "debt snowball", "debt avalanche",
                "interest rate", "refinance", "consolidation"
            ],
            "credit": [
                "credit", "credit score", "credit report", "fico", "credit card",
                "credit utilization", "credit history", "credit limit"
            ],
            "taxes": [
                "tax", "taxes", "tax return", "tax refund", "tax deduction",
                "tax credit", "income tax", "property tax", "capital gains"
            ],
            "insurance": [
                "insurance", "life insurance", "health insurance", "auto insurance",
                "home insurance", "disability insurance", "premium", "deductible"
            ],
            "retirement": [
                "retirement", "retire", "401k", "ira", "roth", "pension",
                "social security", "retirement planning", "retirement age"
            ],
            "housing": [
                "house", "home", "mortgage", "rent", "property", "real estate",
                "down payment", "closing costs", "homeowner", "landlord"
            ],
            "financial_planning": [
                "financial plan", "financial planning", "financial advisor",
                "financial goals", "net worth", "estate planning", "will", "trust"
            ]
        }
        
        if financial_topics_path:
            try:
                with open(financial_topics_path, 'r') as f:
                    topics = json.load(f)
                logger.info(f"Loaded financial topics from {financial_topics_path}")
                return topics
            except Exception as e:
                logger.error(f"Error loading financial topics from {financial_topics_path}: {str(e)}")
                logger.info("Using default financial topics")
        
        return default_topics
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """
        Process a user query to extract intents and prepare for RAG.
        
        Args:
            query: The user's query
            
        Returns:
            Dictionary containing processed query information
        """
        logger.info(f"Processing query: {query}")
        
        # Clean and normalize the query
        cleaned_query = self._clean_query(query)
        
        # Extract financial topics
        topics = self._extract_topics(cleaned_query)
        
        # Determine if it's a question
        is_question = self._is_question(cleaned_query)
        
        # Extract any numerical values
        numbers = self._extract_numbers(cleaned_query)
        
        # Determine query complexity
        complexity = self._determine_complexity(cleaned_query)
        
        # Create processed query object
        processed_query = {
            "original_query": query,
            "cleaned_query": cleaned_query,
            "topics": topics,
            "is_question": is_question,
            "numbers": numbers,
            "complexity": complexity
        }
        
        logger.info(f"Processed query: {processed_query}")
        return processed_query
    
    def _clean_query(self, query: str) -> str:
        """
        Clean and normalize a query.
        
        Args:
            query: The query to clean
            
        Returns:
            Cleaned query
        """
        # Convert to lowercase
        cleaned = query.lower()
        
        # Remove extra whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
        # Remove special characters except question marks
        cleaned = re.sub(r'[^\w\s\?]', '', cleaned)
        
        return cleaned
    
    def _extract_topics(self, query: str) -> Dict[str, float]:
        """
        Extract financial topics from a query.
        
        Args:
            query: The query to analyze
            
        Returns:
            Dictionary mapping topics to confidence scores
        """
        topics = {}
        
        # Check for each topic
        for topic, keywords in self.financial_topics.items():
            score = 0.0
            matched_keywords = []
            
            for keyword in keywords:
                # Check for exact matches
                pattern = r'\b' + re.escape(keyword) + r'\b'
                matches = re.findall(pattern, query)
                
                if matches:
                    # Increase score based on number of matches and keyword specificity
                    match_score = len(matches) * (0.5 + 0.5 * len(keyword.split()) / 3)
                    score += match_score
                    matched_keywords.append(keyword)
            
            # Only include topics with matches
            if score > 0:
                topics[topic] = {
                    "score": min(score, 1.0),  # Cap at 1.0
                    "matched_keywords": matched_keywords
                }
        
        # Sort topics by score
        sorted_topics = {
            k: v for k, v in sorted(
                topics.items(), 
                key=lambda item: item[1]["score"], 
                reverse=True
            )
        }
        
        return sorted_topics
    
    def _is_question(self, query: str) -> bool:
        """
        Determine if a query is a question.
        
        Args:
            query: The query to analyze
            
        Returns:
            True if the query is a question, False otherwise
        """
        # Check for question mark
        if '?' in query:
            return True
        
        # Check for question words
        question_words = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'should', 'could', 'would']
        for word in question_words:
            if query.startswith(word + ' '):
                return True
        
        return False
    
    def _extract_numbers(self, query: str) -> List[Dict[str, Any]]:
        """
        Extract numerical values from a query.
        
        Args:
            query: The query to analyze
            
        Returns:
            List of dictionaries containing extracted numbers and their context
        """
        numbers = []
        
        # Extract numbers with dollar signs
        dollar_pattern = r'\$\s*(\d+(?:,\d{3})*(?:\.\d+)?)'
        dollar_matches = re.finditer(dollar_pattern, query)
        
        for match in dollar_matches:
            # Get context (words before and after)
            start = max(0, match.start() - 20)
            end = min(len(query), match.end() + 20)
            context = query[start:end]
            
            # Clean the number
            value_str = match.group(1).replace(',', '')
            value = float(value_str)
            
            numbers.append({
                "value": value,
                "type": "currency",
                "currency": "USD",
                "original": match.group(0),
                "context": context
            })
        
        # Extract percentage values
        percent_pattern = r'(\d+(?:\.\d+)?)\s*%'
        percent_matches = re.finditer(percent_pattern, query)
        
        for match in percent_matches:
            # Get context
            start = max(0, match.start() - 20)
            end = min(len(query), match.end() + 20)
            context = query[start:end]
            
            value = float(match.group(1))
            
            numbers.append({
                "value": value,
                "type": "percentage",
                "original": match.group(0),
                "context": context
            })
        
        # Extract other numbers
        number_pattern = r'\b(\d+(?:,\d{3})*(?:\.\d+)?)\b'
        number_matches = re.finditer(number_pattern, query)
        
        for match in number_matches:
            # Skip if already captured as currency or percentage
            if any(n["original"] == match.group(0) for n in numbers):
                continue
            
            # Get context
            start = max(0, match.start() - 20)
            end = min(len(query), match.end() + 20)
            context = query[start:end]
            
            # Clean the number
            value_str = match.group(1).replace(',', '')
            value = float(value_str)
            
            numbers.append({
                "value": value,
                "type": "number",
                "original": match.group(0),
                "context": context
            })
        
        return numbers
    
    def _determine_complexity(self, query: str) -> str:
        """
        Determine the complexity of a query.
        
        Args:
            query: The query to analyze
            
        Returns:
            Complexity level: "simple", "moderate", or "complex"
        """
        # Count words
        word_count = len(query.split())
        
        # Count financial terms
        financial_term_count = 0
        for topic_keywords in self.financial_topics.values():
            for keyword in topic_keywords:
                if ' ' + keyword + ' ' in ' ' + query + ' ':
                    financial_term_count += 1
        
        # Check for comparison indicators
        comparison_indicators = ['compare', 'difference', 'versus', 'vs', 'better', 'worse', 'pros and cons']
        has_comparison = any(indicator in query for indicator in comparison_indicators)
        
        # Check for multi-part questions
        multi_part_indicators = [' and ', ' or ', ' also ', ' additionally ', '; ', 'first', 'second', 'finally']
        has_multi_part = any(indicator in query for indicator in multi_part_indicators)
        
        # Determine complexity
        if word_count <= 10 and financial_term_count <= 1 and not has_comparison and not has_multi_part:
            return "simple"
        elif word_count > 25 or financial_term_count > 3 or (has_comparison and has_multi_part):
            return "complex"
        else:
            return "moderate"
    
    def generate_search_queries(self, processed_query: Dict[str, Any], max_queries: int = 3) -> List[str]:
        """
        Generate search queries for the RAG system based on the processed query.
        
        Args:
            processed_query: Processed query information
            max_queries: Maximum number of search queries to generate
            
        Returns:
            List of search queries
        """
        search_queries = []
        
        # Add the original query
        search_queries.append(processed_query["cleaned_query"])
        
        # Generate topic-focused queries
        topics = processed_query.get("topics", {})
        if topics:
            # Get the top topics
            top_topics = list(topics.keys())[:2]
            
            for topic in top_topics:
                # Get matched keywords
                keywords = topics[topic].get("matched_keywords", [])
                
                if keywords:
                    # Create a query focused on the topic
                    topic_query = f"{topic} {' '.join(keywords[:2])} {processed_query['cleaned_query']}"
                    search_queries.append(topic_query)
        
        # Limit the number of queries
        return search_queries[:max_queries]
