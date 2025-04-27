import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Divider,
  Chip,
  Button,
  Collapse,
  Fade,
  CircularProgress,
  Link,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import { getFinancialResponse } from './chatbotResponses';
import { sendQuery, checkApiAvailability } from '../../services/api';

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([
    {
      sender: 'bot',
      message: "Hello! I'm SolomonSays, your financial assistant. I can answer basic financial questions. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [sources, setSources] = useState([]);
  const [showSources, setShowSources] = useState(false);
  const messagesEndRef = useRef(null);

  // Check if the API is available when the component mounts
  useEffect(() => {
    const checkApi = async () => {
      const isAvailable = await checkApiAvailability();
      setApiAvailable(isAvailable);
    };

    checkApi();
  }, []);

  // Scroll to bottom of chat whenever conversation updates
  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [conversation, open]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    // Add user message to conversation
    const userMessage = {
      sender: 'user',
      message: input,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Try to get response from the API if it's available
      if (apiAvailable) {
        // Format conversation history for the API
        const chatHistory = conversation.map(msg => ({
          sender: msg.sender,
          message: msg.message
        }));

        // Send query to the API
        const response = await sendQuery(input, chatHistory);

        // Add bot response to conversation
        const botResponse = {
          sender: 'bot',
          message: response.answer,
          timestamp: new Date(),
          confidence: response.confidence
        };

        setConversation(prev => [...prev, botResponse]);

        // Store citations if available
        if (response.citations && response.citations.length > 0) {
          setSources(response.citations);
          setShowSources(true);
        } else if (response.sources && response.sources.length > 0) {
          // Backward compatibility with old API format
          setSources(response.sources);
          setShowSources(true);
        } else {
          setSources([]);
          setShowSources(false);
        }

        // If there are follow-up questions, suggest them
        if (response.follow_up_questions && response.follow_up_questions.length > 0) {
          setTimeout(() => {
            const suggestionsResponse = {
              sender: 'bot',
              message: "You might also want to ask:",
              suggestions: response.follow_up_questions,
              timestamp: new Date()
            };
            setConversation(prev => [...prev, suggestionsResponse]);
          }, 1000);
        }
      } else {
        // Fall back to hardcoded responses if API is not available
        setTimeout(() => {
          const botResponse = {
            sender: 'bot',
            message: getFinancialResponse(input),
            timestamp: new Date()
          };
          setConversation(prev => [...prev, botResponse]);
        }, 500); // Small delay to make it feel more natural
      }
    } catch (error) {
      console.error('Error getting response:', error);

      // Add error message to conversation
      const errorResponse = {
        sender: 'bot',
        message: "I'm having trouble connecting to my knowledge base. Let me try to answer with what I know.",
        timestamp: new Date()
      };

      setConversation(prev => [...prev, errorResponse]);

      // Fall back to hardcoded responses
      setTimeout(() => {
        const fallbackResponse = {
          sender: 'bot',
          message: getFinancialResponse(input),
          timestamp: new Date()
        };
        setConversation(prev => [...prev, fallbackResponse]);
      }, 500);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleChat = () => {
    setOpen(prev => !prev);
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {/* Chat button */}
      <Fade in={!open}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ChatIcon />}
          onClick={toggleChat}
          sx={{ borderRadius: 28 }}
        >
          Ask SolomonSays
        </Button>
      </Fade>

      {/* Chat window */}
      <Collapse in={open} timeout={300}>
        <Paper
          elevation={3}
          sx={{
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* Chat header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SmartToyIcon sx={{ mr: 1 }} />
              <Typography variant="h6">SolomonSays</Typography>
            </Box>
            <Chip
              label={apiAvailable ? "RAG Enabled" : "Preview Mode"}
              size="small"
              color={apiAvailable ? "success" : "warning"}
              sx={{ mr: 1 }}
            />
            <IconButton size="small" color="inherit" onClick={toggleChat}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Chat messages */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: '#f5f5f5'
            }}
          >
            <List>
              {conversation.map((msg, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      p: 0,
                      mb: 1
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 0.5
                      }}
                    >
                      {msg.sender === 'bot' && (
                        <SmartToyIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {msg.sender === 'user' ? 'You' : 'SolomonSays'} • {formatTime(msg.timestamp)}
                      </Typography>
                      {msg.sender === 'user' && (
                        <PersonIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                      )}
                    </Box>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        maxWidth: '80%',
                        bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
                        color: msg.sender === 'user' ? 'white' : 'text.primary',
                        borderRadius: 2,
                        borderTopRightRadius: msg.sender === 'user' ? 0 : 2,
                        borderTopLeftRadius: msg.sender === 'bot' ? 0 : 2
                      }}
                    >
                      <Typography variant="body2">{msg.message}</Typography>

                      {/* Display follow-up suggestions if available */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {msg.suggestions.map((suggestion, idx) => (
                            <Button
                              key={idx}
                              size="small"
                              variant="outlined"
                              sx={{
                                mr: 1,
                                mb: 1,
                                fontSize: '0.75rem',
                                textTransform: 'none'
                              }}
                              onClick={() => {
                                setInput(suggestion);
                                // Focus the input field
                                document.querySelector('input[type="text"]').focus();
                              }}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </Box>
                      )}

                      {/* Display confidence if available */}
                      {msg.confidence !== undefined && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 1,
                            color: 'text.secondary',
                            fontSize: '0.7rem'
                          }}
                        >
                          Confidence: {Math.round(msg.confidence * 100)}%
                        </Typography>
                      )}
                    </Paper>
                  </ListItem>
                  {index < conversation.length - 1 && (
                    <Divider variant="fullWidth" component="li" sx={{ my: 1 }} />
                  )}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          {/* Sources section */}
          {showSources && sources.length > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: '#f0f7ff',
                borderTop: '1px solid',
                borderColor: 'divider',
                maxHeight: '150px',
                overflowY: 'auto'
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Sources:
              </Typography>
              <List dense>
                {sources.map((source, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <Typography variant="body2">
                      {source.source_title || source.metadata?.title || 'Source'}
                      {(source.source_url || source.metadata?.url) && (
                        <Link
                          href={source.source_url || source.metadata?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ ml: 1, fontSize: '0.8rem' }}
                        >
                          [Link]
                        </Link>
                      )}
                      {source.relevance && (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ ml: 1, color: 'text.secondary' }}
                        >
                          (Relevance: {Math.round(source.relevance * 100)}%)
                        </Typography>
                      )}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Chat input */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex'
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask a financial question..."
              variant="outlined"
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              sx={{ mr: 1 }}
            />
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <IconButton
                color="primary"
                type="submit"
                disabled={input.trim() === ''}
              >
                <SendIcon />
              </IconButton>
            )}
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default ChatBot;
