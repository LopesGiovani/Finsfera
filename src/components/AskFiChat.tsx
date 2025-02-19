import { useState } from "react";
import {
  XMarkIcon,
  Squares2X2Icon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

interface AskFiChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestions = [
  "What is the difference between a P&L and Balance Sheet report?",
  "How do I create a recurring invoice in Fiskl?",
  "How do I ensure that the expenses I add are included in my accounting reports?",
  "Can you explain the concept of accrual accounting and how it differs from cash accounting?",
];

export function AskFiChat({ isOpen, onClose }: AskFiChatProps) {
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-4 z-50 w-[400px] shadow-2xl">
      <div className="bg-white rounded-t-lg flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex gap-2">
            <Squares2X2Icon className="w-5 h-5 text-gray-400" />
            <LightBulbIcon className="w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Chat content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-4">
              AI
            </div>
            <h2 className="text-xl font-semibold mb-2">Hello,</h2>
            <p className="text-gray-600">
              I'm Fins AI, your friendly AI advisor
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs text-gray-500 font-medium">SUGGESTIONS</h3>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t bg-white">
          <div className="relative">
            <textarea
              placeholder="Ask about Fiskl, accounting and more..."
              className="w-full p-3 pr-12 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={1}
              maxLength={400}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setCharCount(e.target.value.length);
              }}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2 text-xs text-gray-400">
              <span>{charCount}/400</span>
              <button
                className="p-1 rounded-full bg-blue-500 text-white disabled:opacity-50"
                disabled={!message.trim()}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            AI-generated answers may contain errors.
          </p>
        </div>
      </div>
    </div>
  );
}
