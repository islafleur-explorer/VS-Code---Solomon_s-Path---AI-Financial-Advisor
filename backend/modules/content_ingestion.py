"""
Content Ingestion Module for the SolomonSays Financial Advisor

This module is responsible for ingesting financial educational materials from various sources
and preparing them for storage in the vector database.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional, Union
from pathlib import Path
import requests
from bs4 import BeautifulSoup
import PyPDF2
import csv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ContentIngestionModule:
    """
    Module for ingesting financial educational content from various sources.
    """
    
    def __init__(self, data_dir: str = "data"):
        """
        Initialize the content ingestion module.
        
        Args:
            data_dir: Directory to store ingested content
        """
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        
        # Create subdirectories for different content types
        self.raw_dir = os.path.join(data_dir, "raw")
        self.processed_dir = os.path.join(data_dir, "processed")
        os.makedirs(self.raw_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)
        
        # Track ingested content
        self.content_registry = os.path.join(data_dir, "content_registry.json")
        self._load_registry()
    
    def _load_registry(self):
        """Load the content registry if it exists, or create a new one."""
        if os.path.exists(self.content_registry):
            with open(self.content_registry, 'r') as f:
                self.registry = json.load(f)
        else:
            self.registry = {
                "sources": [],
                "last_updated": None
            }
    
    def _save_registry(self):
        """Save the content registry."""
        import datetime
        self.registry["last_updated"] = datetime.datetime.now().isoformat()
        with open(self.content_registry, 'w') as f:
            json.dump(self.registry, f, indent=2)
    
    def ingest_from_json(self, json_file: str) -> List[Dict[str, Any]]:
        """
        Ingest content from a JSON file.
        
        Args:
            json_file: Path to the JSON file
            
        Returns:
            List of ingested content items
        """
        logger.info(f"Ingesting content from JSON file: {json_file}")
        
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            # Save raw data
            filename = os.path.basename(json_file)
            raw_path = os.path.join(self.raw_dir, filename)
            with open(raw_path, 'w') as f:
                json.dump(data, f, indent=2)
            
            # Process and standardize the data
            processed_items = []
            
            # Handle different JSON structures
            if isinstance(data, list):
                items = data
            elif isinstance(data, dict) and "items" in data:
                items = data["items"]
            else:
                items = [data]
            
            for item in items:
                processed_item = self._standardize_content_item(item, source=json_file)
                if processed_item:
                    processed_items.append(processed_item)
            
            # Save processed data
            processed_path = os.path.join(self.processed_dir, f"processed_{filename}")
            with open(processed_path, 'w') as f:
                json.dump(processed_items, f, indent=2)
            
            # Update registry
            self.registry["sources"].append({
                "type": "json",
                "path": json_file,
                "raw_path": raw_path,
                "processed_path": processed_path,
                "item_count": len(processed_items),
                "ingested_at": datetime.datetime.now().isoformat()
            })
            self._save_registry()
            
            logger.info(f"Successfully ingested {len(processed_items)} items from {json_file}")
            return processed_items
            
        except Exception as e:
            logger.error(f"Error ingesting content from {json_file}: {str(e)}")
            return []
    
    def ingest_from_url(self, url: str, selector: Optional[str] = None) -> Dict[str, Any]:
        """
        Ingest content from a URL.
        
        Args:
            url: URL to ingest content from
            selector: Optional CSS selector to extract specific content
            
        Returns:
            Dictionary containing the ingested content
        """
        logger.info(f"Ingesting content from URL: {url}")
        
        try:
            response = requests.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            })
            response.raise_for_status()
            
            # Save raw HTML
            import hashlib
            url_hash = hashlib.md5(url.encode()).hexdigest()
            raw_path = os.path.join(self.raw_dir, f"{url_hash}.html")
            with open(raw_path, 'w', encoding='utf-8') as f:
                f.write(response.text)
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract title
            title = soup.title.string if soup.title else url
            
            # Extract content based on selector or default to body text
            if selector:
                content_elements = soup.select(selector)
                content = "\n".join([elem.get_text(strip=True) for elem in content_elements])
            else:
                # Extract main content (exclude navigation, footer, etc.)
                for elem in soup.find_all(['nav', 'footer', 'header', 'aside']):
                    elem.decompose()
                
                # Get remaining text from body
                body = soup.find('body')
                content = body.get_text(separator="\n", strip=True) if body else ""
            
            # Create standardized content item
            processed_item = {
                "title": title,
                "content": content,
                "source": url,
                "source_type": "web",
                "url": url,
                "ingested_at": datetime.datetime.now().isoformat()
            }
            
            # Save processed data
            processed_path = os.path.join(self.processed_dir, f"{url_hash}.json")
            with open(processed_path, 'w') as f:
                json.dump(processed_item, f, indent=2)
            
            # Update registry
            self.registry["sources"].append({
                "type": "url",
                "url": url,
                "raw_path": raw_path,
                "processed_path": processed_path,
                "ingested_at": datetime.datetime.now().isoformat()
            })
            self._save_registry()
            
            logger.info(f"Successfully ingested content from {url}")
            return processed_item
            
        except Exception as e:
            logger.error(f"Error ingesting content from {url}: {str(e)}")
            return {
                "title": url,
                "content": "",
                "source": url,
                "source_type": "web",
                "url": url,
                "error": str(e)
            }
    
    def ingest_from_pdf(self, pdf_file: str) -> Dict[str, Any]:
        """
        Ingest content from a PDF file.
        
        Args:
            pdf_file: Path to the PDF file
            
        Returns:
            Dictionary containing the ingested content
        """
        logger.info(f"Ingesting content from PDF file: {pdf_file}")
        
        try:
            # Extract text from PDF
            with open(pdf_file, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                content = ""
                for page_num in range(len(pdf_reader.pages)):
                    content += pdf_reader.pages[page_num].extract_text() + "\n"
            
            # Save raw content
            filename = os.path.basename(pdf_file)
            raw_path = os.path.join(self.raw_dir, f"{filename}.txt")
            with open(raw_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Create standardized content item
            processed_item = {
                "title": filename,
                "content": content,
                "source": pdf_file,
                "source_type": "pdf",
                "ingested_at": datetime.datetime.now().isoformat()
            }
            
            # Save processed data
            processed_path = os.path.join(self.processed_dir, f"{filename}.json")
            with open(processed_path, 'w') as f:
                json.dump(processed_item, f, indent=2)
            
            # Update registry
            self.registry["sources"].append({
                "type": "pdf",
                "path": pdf_file,
                "raw_path": raw_path,
                "processed_path": processed_path,
                "ingested_at": datetime.datetime.now().isoformat()
            })
            self._save_registry()
            
            logger.info(f"Successfully ingested content from {pdf_file}")
            return processed_item
            
        except Exception as e:
            logger.error(f"Error ingesting content from {pdf_file}: {str(e)}")
            return {
                "title": os.path.basename(pdf_file),
                "content": "",
                "source": pdf_file,
                "source_type": "pdf",
                "error": str(e)
            }
    
    def ingest_from_csv(self, csv_file: str, content_col: str, title_col: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Ingest content from a CSV file.
        
        Args:
            csv_file: Path to the CSV file
            content_col: Name of the column containing the content
            title_col: Optional name of the column containing the title
            
        Returns:
            List of ingested content items
        """
        logger.info(f"Ingesting content from CSV file: {csv_file}")
        
        try:
            processed_items = []
            
            with open(csv_file, 'r', newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    if content_col not in row:
                        logger.warning(f"Content column '{content_col}' not found in row: {row}")
                        continue
                    
                    title = row.get(title_col, "") if title_col else f"Item {len(processed_items) + 1}"
                    
                    processed_item = {
                        "title": title,
                        "content": row[content_col],
                        "source": csv_file,
                        "source_type": "csv",
                        "metadata": {k: v for k, v in row.items() if k != content_col and k != title_col},
                        "ingested_at": datetime.datetime.now().isoformat()
                    }
                    
                    processed_items.append(processed_item)
            
            # Save processed data
            filename = os.path.basename(csv_file)
            processed_path = os.path.join(self.processed_dir, f"{filename}.json")
            with open(processed_path, 'w') as f:
                json.dump(processed_items, f, indent=2)
            
            # Update registry
            self.registry["sources"].append({
                "type": "csv",
                "path": csv_file,
                "processed_path": processed_path,
                "item_count": len(processed_items),
                "ingested_at": datetime.datetime.now().isoformat()
            })
            self._save_registry()
            
            logger.info(f"Successfully ingested {len(processed_items)} items from {csv_file}")
            return processed_items
            
        except Exception as e:
            logger.error(f"Error ingesting content from {csv_file}: {str(e)}")
            return []
    
    def ingest_financial_knowledge(self, knowledge_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Ingest financial knowledge items directly.
        
        Args:
            knowledge_items: List of financial knowledge items
            
        Returns:
            List of processed knowledge items
        """
        logger.info(f"Ingesting {len(knowledge_items)} financial knowledge items")
        
        try:
            processed_items = []
            
            for item in knowledge_items:
                processed_item = self._standardize_content_item(item, source="direct_input")
                if processed_item:
                    processed_items.append(processed_item)
            
            # Save processed data
            import datetime
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            processed_path = os.path.join(self.processed_dir, f"financial_knowledge_{timestamp}.json")
            with open(processed_path, 'w') as f:
                json.dump(processed_items, f, indent=2)
            
            # Update registry
            self.registry["sources"].append({
                "type": "direct_input",
                "processed_path": processed_path,
                "item_count": len(processed_items),
                "ingested_at": datetime.datetime.now().isoformat()
            })
            self._save_registry()
            
            logger.info(f"Successfully ingested {len(processed_items)} financial knowledge items")
            return processed_items
            
        except Exception as e:
            logger.error(f"Error ingesting financial knowledge: {str(e)}")
            return []
    
    def _standardize_content_item(self, item: Dict[str, Any], source: str) -> Dict[str, Any]:
        """
        Standardize a content item to a common format.
        
        Args:
            item: Content item to standardize
            source: Source of the content
            
        Returns:
            Standardized content item
        """
        try:
            # Extract required fields with fallbacks
            title = item.get("title", "")
            content = item.get("content", "")
            
            # Handle alternative field names
            if not content and "text" in item:
                content = item["text"]
            if not title and "name" in item:
                title = item["name"]
            
            # Skip items without content
            if not content:
                logger.warning(f"Skipping item without content: {item}")
                return None
            
            # Create standardized item
            standardized = {
                "title": title,
                "content": content,
                "source": item.get("source", source),
                "source_type": item.get("source_type", "unknown"),
                "url": item.get("url", ""),
                "metadata": {}
            }
            
            # Add any additional metadata
            for key, value in item.items():
                if key not in ["title", "content", "source", "source_type", "url"]:
                    standardized["metadata"][key] = value
            
            return standardized
            
        except Exception as e:
            logger.error(f"Error standardizing content item: {str(e)}")
            return None
    
    def get_all_processed_content(self) -> List[Dict[str, Any]]:
        """
        Get all processed content items.
        
        Returns:
            List of all processed content items
        """
        all_content = []
        
        for source_info in self.registry["sources"]:
            processed_path = source_info.get("processed_path")
            if processed_path and os.path.exists(processed_path):
                try:
                    with open(processed_path, 'r') as f:
                        content = json.load(f)
                    
                    if isinstance(content, list):
                        all_content.extend(content)
                    else:
                        all_content.append(content)
                except Exception as e:
                    logger.error(f"Error loading processed content from {processed_path}: {str(e)}")
        
        return all_content
