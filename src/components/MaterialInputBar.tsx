import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, X, Sparkles } from 'lucide-react';

interface MaterialInputBarProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const MaterialInputBar: React.FC<MaterialInputBarProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading || disabled) return;
    onSendMessage(trimmed);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto-adjust height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="shrink-0 p-3 bg-[#1e1f25] border-t border-[#2d2f38] relative z-10">
      {/* Listening Status Banner */}
      {isListening && (
        <div className="mb-2 flex items-center justify-center gap-2 py-1 px-3 rounded-full bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-500/30 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <span>Listening... Speak to ask a question</span>
        </div>
      )}

      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        {/* Material 3 Input Field Container */}
        <div className="flex-1 min-h-[48px] bg-[#292a33] hover:bg-[#2d2e38] focus-within:bg-[#2d2e38] border border-slate-700/70 focus-within:border-indigo-400/80 rounded-3xl px-4 py-2 flex items-center gap-2 shadow-inner transition-colors">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 select-none opacity-80" />

          <textarea
            ref={textareaRef}
            id="chat-input-textarea"
            rows={1}
            value={inputText}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            placeholder={
              isLoading
                ? 'Gemini is generating response...'
                : 'Ask anything about Suraj Yadav...'
            }
            className="flex-1 bg-transparent text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none resize-none max-h-[120px] py-1"
          />

          {inputText && (
            <button
              onClick={() => {
                setInputText('');
                if (textareaRef.current) textareaRef.current.style.height = 'auto';
              }}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-full hover:bg-slate-700/50 cursor-pointer"
              title="Clear input"
              aria-label="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Voice Input Mic Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            id="btn-voice-input"
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isListening
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-700/50'
            }`}
            title={isListening ? 'Stop listening' : 'Dictate question with voice'}
            aria-label={isListening ? 'Stop listening' : 'Dictate question with voice'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Material 3 Send FAB */}
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isLoading || disabled}
          id="btn-send-message"
          className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg ${
            !inputText.trim() || isLoading || disabled
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-tr from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-indigo-600/30 active:scale-95'
          }`}
          title="Send message"
          aria-label="Send message"
        >
          <Send className={`w-4 h-4 ${inputText.trim() && !isLoading ? 'translate-x-0.5' : ''}`} />
        </button>
      </div>
    </div>
  );
};
