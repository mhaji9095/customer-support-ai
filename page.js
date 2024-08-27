'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Stack, TextField, Button, Typography, CircularProgress } from '@mui/material';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    const userMessage = { role: 'user', content: message.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, userMessage]),
      });

      if (!response.ok) {
        throw new Error('Error in fetching response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = { role: 'assistant', content: '' };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantResponse.content += decoder.decode(value, { stream: true });
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1] = assistantResponse;
          return updatedMessages;
        });
      }

      setMessages((prevMessages) => [...prevMessages, assistantResponse]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2,
      }}
    >
      <Stack
        width="100%"
        maxWidth={600}
        height="80vh"
        spacing={2}
        sx={{
          borderRadius: 2,
          backgroundColor: '#fff',
          boxShadow: 3,
          padding: 3,
          overflow: 'hidden',
        }}
      >
        <Typography variant="h6" textAlign="center">
          Chat with Assistant
        </Typography>
        <Stack
          spacing={2}
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: 2,
            backgroundColor: '#e0e0e0',
            borderRadius: 2,
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  padding: 1.5,
                  borderRadius: 2,
                  backgroundColor: message.role === 'user' ? '#1976d2' : '#ffffff',
                  color: message.role === 'user' ? '#ffffff' : '#000000',
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            autoFocus
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading || !message.trim()}
            aria-label="Send message"
          >
            {isLoading ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

