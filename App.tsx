
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, MessageSquare, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Message, ChatState } from './types';
import { sendMessageToGemini } from './services/geminiService';
import LoadingAnimation from './components/LoadingAnimation';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    error: null,
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || chatState.isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
      error: null,
    }));
    setInput('');

    try {
      const history = chatState.messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const aiResponse = await sendMessageToGemini(text, history);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse || "I couldn't process that. Please try again.",
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false,
      }));
    } catch (err) {
      setChatState(prev => ({
        ...prev,
        isTyping: false,
        error: "Failed to connect to the AI. Check your API key or connection.",
      }));
    }
  };

  const suggestions = [
    "What can I ask you to do?",
    "What projects should I be concerned about right now?"
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full items-center justify-center p-6 lg:p-12 gap-12 max-w-7xl mx-auto">
      
      {/* Left Content Area */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 lg:w-1/2">
        <div className="bg-white px-10 py-6 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-white/50 inline-block transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            AI Chatbot UI
          </h1>
        </div>
        
        <div className="glass-pill px-8 py-3 rounded-full border-blue-200 shadow-sm inline-flex items-center gap-2 group cursor-default">
          <span className="text-gray-600 font-medium tracking-wide">with loading animation</span>
          <div className="flex gap-1">
             <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>

      {/* Right Chat Card */}
      <div className="w-full lg:w-[500px] h-[650px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white/60 relative overflow-hidden flex flex-col group">
        
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/40 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-purple-200/40 transition-colors duration-500"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-100/40 rounded-full blur-3xl -ml-20 -mb-20 group-hover:bg-pink-200/40 transition-colors duration-500"></div>

        {/* Chat Header (Conditional Empty State) */}
        {chatState.messages.length === 0 && !chatState.isTyping && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 relative z-10 animate-in fade-in zoom-in duration-700">
            <div className="p-4 bg-gray-50 rounded-2xl mb-2">
              <Sparkles className="w-8 h-8 text-gray-800" />
            </div>
            <h2 className="text-xl font-medium text-gray-800">Ask our AI anything</h2>
          </div>
        )}

        {/* Chat History Area */}
        <div 
          ref={scrollRef}
          className={`flex-1 overflow-y-auto p-6 space-y-4 relative z-10 no-scrollbar transition-all duration-300 ${chatState.messages.length === 0 ? 'hidden' : 'block'}`}
        >
          {chatState.messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-none' 
                  : 'bg-white/80 border border-purple-100 text-gray-700 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {chatState.isTyping && (
            <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
              <LoadingAnimation />
            </div>
          )}
        </div>

        {/* Error State */}
        {chatState.error && (
          <div className="mx-6 mb-2 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs text-red-600 animate-in shake duration-500">
            <AlertCircle className="w-4 h-4" />
            <span>{chatState.error}</span>
            <button onClick={() => handleSend(chatState.messages[chatState.messages.length-1]?.content)} className="ml-auto underline font-bold">Retry</button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 pt-0 relative z-10">
          
          {/* Suggestions Layer */}
          <div className="mb-6">
            <p className="text-[10px] font-bold text-purple-700/60 uppercase tracking-widest mb-3 ml-1">
              Suggestions on what to ask Our AI
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(suggestion)}
                  disabled={chatState.isTyping}
                  className="px-4 py-2.5 bg-purple-50/60 border border-purple-100/50 rounded-xl text-xs text-gray-700 hover:bg-purple-100 transition-all duration-200 text-left hover:border-purple-200 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Actual Input Field */}
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your projects"
              className="w-full pl-5 pr-12 py-4 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all shadow-sm placeholder-gray-400"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || chatState.isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Send className="w-5 h-5 transform rotate-0 hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
