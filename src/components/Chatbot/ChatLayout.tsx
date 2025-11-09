"use client";

import { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, SendHorizonal, Mic } from "lucide-react";

interface ChatLayoutProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  messages: { role: "user" | "bot"; text: string }[];
  input: string;
  setInput: (v: string) => void;
  sendMessage: (text?: string) => void;
  startListening: () => void;
  listening: boolean;
  isSpeaking: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>;
  typing?: boolean;
  unread?: number;
  onQuickAsk?: (text: string) => void;
}

export default function ChatLayout({
  open,
  setOpen,
  messages,
  input,
  setInput,
  sendMessage,
  startListening,
  listening,
  isSpeaking,
  chatEndRef,
  typing,
  unread = 0,
  onQuickAsk,
}: ChatLayoutProps) {
  const quick = [
    "Gợi ý quán gần tôi",
    "Món hợp thời tiết",
    "Quán mở khuya",
    "Ưu đãi hôm nay",
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-br from-rose-500 to-rose-400 text-white shadow-2xl flex items-center justify-center text-2xl font-bold z-[9999] outline-none"
        aria-label={open ? "Đóng chat" : "Mở chat"}
      >
        {open ? "✖" : "💬"}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-xs font-bold ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-28 right-6 z-[9998] w-[22rem] h-[34rem] backdrop-blur-lg bg-white/75 border border-white/40 shadow-2xl rounded-3xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-rose-400 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/pika-avatar.png"
                  alt="Pika"
                  className="w-9 h-9 rounded-full border border-white shadow-md"
                />
                <div>
                  <h4 className="font-semibold text-sm">
                    Pika – Trợ lý ảo FoodMap
                  </h4>
                  <p className="text-xs opacity-90">
                    {isSpeaking ? "Đang nói…" : "Sẵn sàng hỗ trợ"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white text-lg hover:scale-110 transition"
              >
                ✖
              </button>
            </div>

            {/* Quick suggestions */}
            <div className="px-3 pt-2 pb-1 flex flex-wrap gap-2 bg-white/60 border-b border-white/40">
              {quick.map((q) => (
                <button
                  key={q}
                  onClick={() => onQuickAsk?.(q)}
                  className="rounded-full bg-white/80 hover:bg-white text-xs px-3 py-1 border border-gray-200 text-gray-700"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-br from-rose-50/40 to-white/60">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${
                    m.role === "user"
                      ? "ml-auto bg-rose-500 text-white"
                      : "mr-auto bg-white/85 text-gray-800 border border-gray-200"
                  }`}
                >
                  {m.text}
                </motion.div>
              ))}

              {typing && (
                <div className="mr-auto bg-white/85 border border-gray-200 rounded-2xl px-3 py-2 text-sm flex items-center gap-2 text-gray-700">
                  <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                  Pika đang gõ…
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md border-t border-white/40 px-3 py-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Nhập tin nhắn…"
                className="flex-1 rounded-full px-4 py-2 text-sm border border-gray-300 focus:ring-2 focus:ring-rose-400 focus:outline-none bg-white"
              />
              <button
                onClick={() => sendMessage()}
                className="p-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition"
              >
                <SendHorizonal size={18} />
              </button>
              <button
                onClick={startListening}
                className={`p-2 rounded-full transition ${
                  listening ? "bg-red-500" : "bg-emerald-500"
                } text-white`}
                title="Dùng micro"
              >
                <Mic size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
