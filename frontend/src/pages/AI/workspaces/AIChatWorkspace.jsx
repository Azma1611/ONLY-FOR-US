import { useEffect, useState, useRef } from 'react';
import { Send, Bot, User, Loader2, Plus } from 'lucide-react';
import useAIStore from '@/store/aiStore';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

export default function AIChatWorkspace() {
  const { 
    conversations, 
    activeConversation, 
    messages, 
    isStreaming, 
    streamedText,
    fetchConversations,
    createConversation,
    setActiveConversation,
    sendMessage 
  } = useAIStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedText]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    // Create convo if none active
    if (!activeConversation) {
      createConversation(input.slice(0, 20) + '...').then(() => {
         sendMessage(input);
      });
    } else {
      sendMessage(input);
    }
    setInput('');
  };

  return (
    <div className="flex h-full">
      {/* Sidebar - Chat History */}
      <div className="w-64 border-r border-[var(--border-color)] p-4 flex flex-col hidden md:flex">
        <button 
          onClick={() => createConversation()}
          className="flex items-center justify-center space-x-2 w-full py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-[var(--text-primary)] transition-colors mb-4"
        >
          <Plus className="w-4 h-4" />
          <span className="font-semibold text-sm">New Chat</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
          {conversations.map(conv => (
            <button
              key={conv._id}
              onClick={() => setActiveConversation(conv._id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm truncate transition-colors ${
                activeConversation === conv._id 
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-semibold' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {conv.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 && !isStreaming ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-[var(--text-secondary)]">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-indigo-500" />
              </div>
              <p className="max-w-sm">
                How can I help you today? I can analyze your relationship goals, review your finances, or suggest date ideas!
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} role={msg.role} content={msg.content} />
              ))}
              {isStreaming && (
                <MessageBubble role="assistant" content={streamedText} streaming />
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
          <form 
            onSubmit={handleSend}
            className="max-w-4xl mx-auto relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isStreaming}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl py-3 pl-4 pr-12 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="absolute right-2 p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 transition-colors"
            >
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          <div className="text-center mt-2 text-xs text-[var(--text-tertiary)]">
            AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ role, content, streaming }) {
  const isUser = role === 'user';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full max-w-4xl mx-auto`}
    >
      <div className={`flex space-x-3 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-gray-200 dark:bg-gray-700' : 'bg-indigo-100 dark:bg-indigo-900/30'
          }`}>
            {isUser ? <User className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          </div>
        </div>

        {/* Content */}
        <div className={`px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-indigo-500 text-white rounded-tr-sm' 
            : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-sm'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
              {streaming && <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse" />}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
