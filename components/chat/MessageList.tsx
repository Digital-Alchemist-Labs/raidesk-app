'use client';

import { Message } from '@/types';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex gap-3 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
          )}
          
          <div
            className={`max-w-[70%] px-5 py-3.5 ${
              message.role === 'user'
                ? 'message-user'
                : 'message-assistant'
            }`}
          >
            <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
              {message.content}
            </div>
            {message.metadata && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(message.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          {message.role === 'user' && (
            <div className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          )}
        </motion.div>
      ))}
      
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3 justify-start"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="message-assistant px-5 py-3.5">
            <div className="flex gap-1">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 rounded-full bg-blue-500"
              />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-blue-500"
              />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-blue-500"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}


