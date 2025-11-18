'use client';

import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputArea({
  onSend,
  disabled = false,
  placeholder = '메시지를 입력하세요...',
}: InputAreaProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 p-4 shadow-sm">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-gray-50 rounded-2xl px-5 py-3.5 text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none min-h-[52px] max-h-[200px]"
          style={{
            height: 'auto',
            minHeight: '52px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
          }}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          variant="primary"
          size="md"
          className="h-[52px] px-6"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}


