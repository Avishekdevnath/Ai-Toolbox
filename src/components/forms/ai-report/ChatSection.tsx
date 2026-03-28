'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSectionProps {
  formId: string;
  cachedReport?: { executiveSummary: string; recommendations: string[] };
}

const SUGGESTED_QUESTIONS = [
  'What were the most common themes in open-ended answers?',
  'Which question had the lowest engagement?',
  'What should I improve based on this data?',
];

export default function ChatSection({ formId, cachedReport }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    const userMessage = text.trim();
    if (!userMessage || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`/api/forms/${formId}/ai-report/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });
      const json = await res.json();
      const reply = json.success ? json.reply : 'Something went wrong. Please try again.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: "I'm temporarily unavailable. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
        <Bot size={14} className="text-slate-400" />
        <p className="text-[13px] font-semibold text-slate-700">Ask about this form</p>
      </div>

      {/* Message thread */}
      <div className="min-h-[200px] max-h-[400px] overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-[12px] text-slate-400 mb-3">Suggested questions:</p>
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={loading}
                className="block w-full text-left text-[12px] text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {m.role === 'assistant' && (
                  <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">AI</span>
                )}
                {m.content}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-xl px-3 py-2">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1">AI</span>
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 px-4 py-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
          disabled={loading}
          placeholder="Ask a question about your responses…"
          className="flex-1 text-[13px] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
