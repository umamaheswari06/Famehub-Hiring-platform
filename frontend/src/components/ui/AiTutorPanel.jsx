import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, RotateCcw, Bot, User, Loader2, Info } from 'lucide-react';
import api from '../../utils/api';

export default function AiTutorPanel({
  isOpen,
  onClose,
  questionTitle,
  questionDescription,
  code = '',
  language = '',
  errorMessage = '',
  options = [],
  selectedOption = '',
  type = 'CODING',
  onTutorQuery
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize welcome message when type changes or chat is opened
  useEffect(() => {
    if (messages.length === 0) {
      resetChat();
    }
  }, [type]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const resetChat = () => {
    const welcomeMsg = type === 'CODING' 
      ? {
          id: 'welcome',
          sender: 'tutor',
          text: `👋 Hello! I am your **Famehub AI Tutor**.\n\nI can help you review your code, analyze logical errors, explain compile outputs, or discuss time/space complexities for **${questionTitle || 'this challenge'}**.\n\n*Note: I will guide you with hints and advice, but I cannot write the final solution code for you.*`
        }
      : {
          id: 'welcome',
          sender: 'tutor',
          text: `👋 Hello! I am your **Famehub AI Tutor**.\n\nI am here to help you understand the concepts behind this MCQ question. I can explain options or clarify terms, but I cannot tell you the correct option directly.\n\nHow can I help you conceptually?`
        };
    setMessages([welcomeMsg]);
  };

  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    if (!textToSend) {
      setInput('');
    }

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText
    };

    if (onTutorQuery) {
      onTutorQuery(messageText);
    }

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Build chat history for conversational context (filtering out the initial welcome message)
    const history = messages
      .filter(msg => msg.id !== 'welcome')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        content: msg.text
      }));

    try {
      const payload = {
        type,
        questionTitle,
        questionDescription,
        code,
        language,
        errorMessage,
        options,
        selectedOption,
        userMessage: messageText,
        chatHistory: history
      };

      const res = await api.post('/api/candidate/ai-tutor/feedback', payload);
      
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: res.data.response,
        isMock: res.data.mock
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to get tutor feedback', err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: '⚠️ *I am sorry, I encountered a communication error with my tutoring system. Please check your network or try again.*'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Default suggestion chips based on type
  const getSuggestions = () => {
    if (type === 'CODING') {
      return [
        { label: '🔍 Analyze Code Structure', prompt: 'Please review the structure of my code and check if my logic aligns with the problem statement.' },
        { label: '🐞 Explain Compiler Error', prompt: 'Could you help me understand the compiler output/error and how to troubleshoot it?' },
        { label: '💡 Request Logic Hint', prompt: 'I am stuck. Can you give me a conceptual hint on how to structure the algorithm?' },
        { label: '⚡ Complexity Analysis', prompt: 'What is the optimal time and space complexity for this question?' }
      ];
    } else {
      return [
        { label: '📚 Explain Core Concept', prompt: 'What is the primary technical concept tested in this question?' },
        { label: '🤔 Help Clarify Options', prompt: 'Could you break down what the different options mean conceptually?' },
        { label: '💡 Give Concept Hint', prompt: 'Can you give me a conceptual hint to help me deduce the correct choice?' }
      ];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-96 flex-shrink-0 border-l border-secondary/50 bg-surface-muted flex flex-col h-full z-20 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-secondary/50 backdrop-blur-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-white border border-primary/20 shadow-md shadow-primary/10/20 animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-primary">AI Tutor</h3>
            <span className="text-[10px] text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-ping"></span>
              Online Feedback
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={resetChat} 
            title="Clear conversation"
            className="p-1.5 rounded hover:bg-[#08566E] text-slate-600 hover:text-slate-600 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose} 
            title="Close Tutor Panel"
            className="p-1.5 rounded hover:bg-[#08566E] text-slate-600 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-sans text-sm">
        {messages.map((msg) => {
          const isTutor = msg.sender === 'tutor';
          return (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isTutor ? 'self-start' : 'self-end flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                isTutor 
                  ? 'bg-primary/10 border-primary/20 text-white' 
                  : 'bg-primary/10 border-primary/20 text-white'
              }`}>
                {isTutor ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Text Bubble */}
              <div className={`flex flex-col gap-1`}>
                <div className={`p-3 rounded-2xl border leading-relaxed whitespace-pre-line text-xs md:text-sm ${
                  isTutor 
                    ? 'bg-[#08566E] border-secondary/50 text-primary rounded-tl-none' 
                    : 'bg-primary/10 border-primary/20 text-slate-600 rounded-tr-none'
                }`}>
                  {msg.text.split('\n').map((line, idx) => {
                    // Simple Markdown formatting supports bold and code snippets in tutor bubble
                    let renderedLine = line;
                    
                    // Code block parsing (simple check)
                    if (renderedLine.startsWith('```')) {
                      return null; // Handle code blocks cleanly or as standard text
                    }

                    // Format bold texts (**text**)
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    const parts = [];
                    let lastIndex = 0;
                    let match;

                    while ((match = boldRegex.exec(renderedLine)) !== null) {
                      if (match.index > lastIndex) {
                        parts.push(renderedLine.substring(lastIndex, match.index));
                      }
                      parts.push(<strong key={match.index} className="text-primary font-bold">{match[1]}</strong>);
                      lastIndex = boldRegex.lastIndex;
                    }

                    if (lastIndex < renderedLine.length) {
                      parts.push(renderedLine.substring(lastIndex));
                    }

                    return (
                      <p key={idx} className={renderedLine.trim() === '' ? 'h-2' : 'mb-1'}>
                        {parts.length > 0 ? parts : renderedLine}
                      </p>
                    );
                  })}
                </div>
                {isTutor && msg.isMock && (
                  <span className="text-[9px] text-slate-600 flex items-center gap-1 ml-1">
                    <Info className="w-3 h-3 text-primary/70" /> Simulator Response
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/20 text-white">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-[#08566E] border border-secondary/50 text-primary p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-3 h-3 text-primary animate-spin" />
              <span className="text-xs text-slate-600">Tutor is analyzing...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      {!loading && (
        <div className="px-4 py-2 border-t border-secondary/50 flex flex-col gap-1.5 bg-surface-muted/50">
          <span className="text-[10px] text-slate-600 font-semibold">TUTOR QUICK HELP:</span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-thin">
            {getSuggestions().map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.prompt)}
                className="bg-[#08566E] border border-secondary/50 hover:border-primary/50 hover:bg-primary/5 text-slate-600 hover:text-white rounded-full px-2.5 py-1 text-[11px] transition duration-200 text-left font-medium truncate max-w-full"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="p-4 border-t border-secondary/50 flex gap-2 bg-[#08566E]/40"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Ask a question about this problem..."
          className="flex-1 bg-surface-muted border border-secondary/50 text-primary text-xs md:text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary/50 placeholder-[#B4DBDC]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-lg bg-primary hover:bg-primary text-white transition disabled:opacity-50 disabled:hover:bg-primary flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
