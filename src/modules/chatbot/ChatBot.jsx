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
  Tooltip,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import { getFinancialResponse } from './chatbotResponses';
import { sendQuery, checkApiAvailability } from '../../services/api';

const ChatBot = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([
    {
      sender: 'bot',
      message: "Hello! I'm SolomonSays, your financial assistant. What financial questions can I help you with today?",
      timestamp: new Date(),
      suggestions: [
        "How do I create a family budget?",
        "What's the 50/30/20 rule?",
        "How much emergency savings do I need?",
        "How can I save for my child's education?"
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [sources, setSources] = useState([]);
  const [showSources, setShowSources] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [userContext, setUserContext] = useState({
    hasChildren: false,
    lifeStage: null,
    financialGoals: [],
    recentTopics: [],
    hasFinancialConcerns: false,
    incomeLevel: null
  });
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

  // Function to search topics based on user input
  const searchTopics = (input) => {
    const lowercaseInput = input.toLowerCase();

    // Define topic categories and their keywords
    const topicCategories = [
      {
        category: 'budgeting',
        keywords: ['budget', 'spending', 'expense', 'track', '50/30/20', 'envelope', 'zero-based']
      },
      {
        category: 'debt',
        keywords: ['debt', 'loan', 'credit card', 'mortgage', 'student loan', 'snowball', 'avalanche']
      },
      {
        category: 'saving',
        keywords: ['save', 'saving', 'emergency fund', 'rainy day', 'sinking fund']
      },
      {
        category: 'investing',
        keywords: ['invest', 'investment', 'retirement', '401k', 'ira', 'roth', 'stock', 'bond', 'etf', 'mutual fund']
      },
      {
        category: 'family_finance',
        keywords: ['family', 'child', 'kid', 'baby', 'education', 'college', 'childcare', 'daycare', '529']
      },
      {
        category: 'housing',
        keywords: ['house', 'home', 'mortgage', 'rent', 'apartment', 'down payment', 'property']
      },
      {
        category: 'insurance',
        keywords: ['insurance', 'life insurance', 'health insurance', 'disability', 'term', 'whole life']
      },
      {
        category: 'taxes',
        keywords: ['tax', 'taxes', 'deduction', 'credit', 'refund', 'irs', 'filing']
      },
      {
        category: 'income',
        keywords: ['income', 'salary', 'wage', 'raise', 'promotion', 'side hustle', 'gig', 'freelance']
      }
    ];

    // Search for matches and calculate relevance scores
    const results = topicCategories.map(topic => {
      const matchCount = topic.keywords.reduce((count, keyword) => {
        return count + (lowercaseInput.includes(keyword) ? 1 : 0);
      }, 0);

      return {
        category: topic.category,
        relevance: matchCount / topic.keywords.length
      };
    }).filter(result => result.relevance > 0);

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  };

  // Function to detect user context from input
  const detectUserContext = (input) => {
    const lowercaseInput = input.toLowerCase();

    // Detect if user has children
    if (lowercaseInput.includes('child') ||
        lowercaseInput.includes('kid') ||
        lowercaseInput.includes('baby') ||
        lowercaseInput.includes('daughter') ||
        lowercaseInput.includes('son') ||
        lowercaseInput.includes('parent') ||
        lowercaseInput.includes('family')) {
      setUserContext(prev => ({ ...prev, hasChildren: true }));
    }

    // Detect life stage
    const lifeStageKeywords = {
      'newlywed': 'newly married',
      'married': 'married',
      'wedding': 'newly married',
      'just got married': 'newly married',
      'expecting': 'expecting child',
      'pregnant': 'expecting child',
      'baby on the way': 'expecting child',
      'new parent': 'new parent',
      'new baby': 'new parent',
      'toddler': 'young children',
      'preschool': 'young children',
      'elementary': 'school-age children',
      'middle school': 'school-age children',
      'high school': 'teenage children',
      'teenager': 'teenage children',
      'college': 'college-age children',
      'empty nest': 'empty nest',
      'retirement': 'approaching retirement'
    };

    Object.entries(lifeStageKeywords).forEach(([keyword, stage]) => {
      if (lowercaseInput.includes(keyword)) {
        setUserContext(prev => ({ ...prev, lifeStage: stage }));
      }
    });

    // Detect financial goals
    const goalKeywords = {
      'retirement': 'retirement',
      'college': 'education',
      'education': 'education',
      'house': 'home purchase',
      'home': 'home purchase',
      'debt': 'debt freedom',
      'emergency': 'emergency fund',
      'save': 'saving',
      'vacation': 'vacation',
      'travel': 'travel',
      'car': 'vehicle purchase',
      'vehicle': 'vehicle purchase',
      'wedding': 'wedding',
      'business': 'business',
      'startup': 'business',
      'side hustle': 'business',
      'invest': 'investing',
      'investment': 'investing'
    };

    Object.entries(goalKeywords).forEach(([keyword, goal]) => {
      if (lowercaseInput.includes(keyword) && !userContext.financialGoals.includes(goal)) {
        setUserContext(prev => ({
          ...prev,
          financialGoals: [...prev.financialGoals, goal]
        }));
      }
    });

    // Detect financial concerns
    const concernKeywords = {
      'worry': true,
      'worried': true,
      'anxious': true,
      'anxiety': true,
      'stress': true,
      'stressed': true,
      'overwhelm': true,
      'overwhelmed': true,
      'afraid': true,
      'fear': true,
      'scared': true,
      'struggle': true,
      'struggling': true,
      'difficult': true,
      'hard time': true,
      'trouble': true
    };

    Object.entries(concernKeywords).forEach(([keyword, value]) => {
      if (lowercaseInput.includes(keyword)) {
        setUserContext(prev => ({ ...prev, hasFinancialConcerns: true }));
      }
    });

    // Track recent topics
    const searchResults = searchTopics(input);
    if (searchResults.length > 0) {
      const newTopic = searchResults[0].category;
      setUserContext(prev => {
        const updatedTopics = [newTopic, ...prev.recentTopics.filter(t => t !== newTopic)].slice(0, 3);
        return { ...prev, recentTopics: updatedTopics };
      });
    }

    // Detect income level mentions
    const incomeKeywords = {
      'low income': 'low',
      'tight budget': 'low',
      'living paycheck': 'low',
      'paycheck to paycheck': 'low',
      'middle class': 'middle',
      'middle income': 'middle',
      'high income': 'high',
      'high earner': 'high',
      'six figure': 'high'
    };

    Object.entries(incomeKeywords).forEach(([keyword, level]) => {
      if (lowercaseInput.includes(keyword)) {
        setUserContext(prev => ({ ...prev, incomeLevel: level }));
      }
    });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    // Detect user context from input
    detectUserContext(input);

    // Add user message to conversation
    const userMessage = {
      sender: 'user',
      message: input,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowCategories(false);

    try {
      // Try to get response from the API if it's available
      if (apiAvailable) {
        // Format conversation history for the API
        const chatHistory = conversation.map(msg => ({
          sender: msg.sender,
          message: msg.message
        }));

        // Include user context in the API request
        const contextData = {
          hasChildren: userContext.hasChildren,
          lifeStage: userContext.lifeStage,
          financialGoals: userContext.financialGoals,
          recentTopics: userContext.recentTopics,
          hasFinancialConcerns: userContext.hasFinancialConcerns,
          incomeLevel: userContext.incomeLevel
        };

        // Send query to the API
        const response = await sendQuery(input, chatHistory, contextData);

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
    const newOpenState = !open;
    setOpen(newOpenState);

    // Show categories when opening the chat
    if (newOpenState) {
      setShowCategories(true);
    }
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

          {/* Category selection */}
          {showCategories && (
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>
                Popular Financial Topics:
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardActionArea onClick={() => {
                      setInput("How do I create a family budget?");
                      setShowCategories(false);
                      handleSubmit({ preventDefault: () => {} });
                    }}>
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        <AccountBalanceIcon color="primary" />
                        <Typography variant="body2">Budgeting</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardActionArea onClick={() => {
                      setInput("How can I save money?");
                      setShowCategories(false);
                      handleSubmit({ preventDefault: () => {} });
                    }}>
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        <SavingsIcon color="primary" />
                        <Typography variant="body2">Saving</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardActionArea onClick={() => {
                      setInput("How do I pay off debt?");
                      setShowCategories(false);
                      handleSubmit({ preventDefault: () => {} });
                    }}>
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        <CreditCardIcon color="primary" />
                        <Typography variant="body2">Debt</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardActionArea onClick={() => {
                      setInput("How do I save for a house?");
                      setShowCategories(false);
                      handleSubmit({ preventDefault: () => {} });
                    }}>
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        <HomeIcon color="primary" />
                        <Typography variant="body2">Housing</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardActionArea onClick={() => {
                      setInput("How do I save for my child's education?");
                      setShowCategories(false);
                      handleSubmit({ preventDefault: () => {} });
                    }}>
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        <SchoolIcon color="primary" />
                        <Typography variant="body2">Education</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardActionArea onClick={() => {
                      setInput("What are the financial considerations for a family?");
                      setShowCategories(false);
                      handleSubmit({ preventDefault: () => {} });
                    }}>
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        <FamilyRestroomIcon color="primary" />
                        <Typography variant="body2">Family</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

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
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', mb: 1 }}>
              <Button
                size="small"
                startIcon={<InfoIcon />}
                onClick={() => setShowCategories(prev => !prev)}
                sx={{ mr: 1, fontSize: '0.75rem' }}
              >
                {showCategories ? 'Hide Topics' : 'Show Topics'}
              </Button>

              <Tooltip title="SolomonSays helps with your financial questions">
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  Personal Financial Advisor <InfoIcon fontSize="inherit" sx={{ ml: 0.5 }} />
                </Typography>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex' }}>
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
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default ChatBot;
