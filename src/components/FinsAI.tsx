import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface Suggestion {
  id: number;
  text: string;
}

const suggestions: Suggestion[] = [
  {
    id: 1,
    text: "What is the difference between a P&L and Balance Sheet report?",
  },
  {
    id: 2,
    text: "How do I create a recurring invoice in Finsfera?",
  },
  {
    id: 3,
    text: "How do I ensure that the expenses I add are included in my accounting reports?",
  },
  {
    id: 4,
    text: "Can you explain the concept of accrual accounting and how it differs from cash accounting?",
  },
];

export function FinsAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setMessage(text);
    setCharCount(text.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // Implementar lógica do chat aqui
    setMessage("");
    setCharCount(0);
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border hover:bg-gray-50"
      >
        <Image src="/fins-ai-logo.png" alt="Fins AI" width={24} height={24} />
        <span className="text-gray-700">Ask Fi</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-[460px] h-[560px] bg-white rounded-lg shadow-xl border flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"
                  />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"
                  />
                </svg>
              </button>
            </div>
            <button
              onClick={toggleChat}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex flex-col items-center text-center mb-8">
              <Image
                src="/fins-ai-logo.png"
                alt="Fins AI"
                width={48}
                height={48}
                className="mb-4"
              />
              <h2 className="text-xl font-semibold mb-1">Hello,</h2>
              <p className="text-gray-600">I'm Fi, your friendly AI advisor</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 mb-3">
                SUGGESTIONS
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={message}
                onChange={handleMessageChange}
                placeholder="Ask about Finsfera, accounting and more..."
                className="w-full pl-4 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={400}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:bg-gray-100 rounded-lg"
                disabled={!message.trim()}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">{charCount}/400</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm1-10c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"
                  />
                </svg>
                <span className="text-xs text-gray-500">
                  AI-generated answers may contain errors.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
