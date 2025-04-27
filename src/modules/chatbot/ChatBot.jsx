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
  Fade
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import { getFinancialResponse } from './chatbotResponses';

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
  const messagesEndRef = useRef(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // Add user message to conversation
    const userMessage = {
      sender: 'user',
      message: input,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);

    // Get bot response
    setTimeout(() => {
      const botResponse = {
        sender: 'bot',
        message: getFinancialResponse(input),
        timestamp: new Date()
      };
      setConversation(prev => [...prev, botResponse]);
    }, 500); // Small delay to make it feel more natural

    // Clear input
    setInput('');
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
              label="Preview Mode"
              size="small"
              color="warning"
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
              sx={{ mr: 1 }}
            />
            <IconButton
              color="primary"
              type="submit"
              disabled={input.trim() === ''}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default ChatBot;
