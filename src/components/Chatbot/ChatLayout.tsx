"use client";

import { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatLayoutProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  messages: { role: "user" | "bot"; text: string }[]; // không dùng, giữ để tương thích
  input: string; // không dùng
  setInput: (v: string) => void; // không dùng
  sendMessage: (text?: string) => void; // không dùng
  startListening: () => void; // không dùng
  listening: boolean; // không dùng
  isSpeaking: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>; // không dùng
  typing?: boolean; // không dùng
  unread?: number;
  onQuickAsk?: (text: string) => void; // không dùng
}

export default function ChatLayout({
  open,
  setOpen,
  isSpeaking,
  unread = 0,
}: ChatLayoutProps) {
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
            className="fixed bottom-28 right-6 z-[9998] w-[22rem] h-[34rem] backdrop-blur-lg bg-white/75 border border-white/40 shadow-2xl rounded-3xl overflow-hidden"
          >
            <div className="flex h-full w-full flex-col">
              <div className="shrink-0 bg-gradient-to-r from-rose-500 to-rose-400 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://i.ibb.co/4nmVmX5H/Clean-Shot-2025-11-10-at-15-24-11.png"
                    alt="Pika"
                    className="w-9 h-9 rounded-full border border-white shadow-md"
                  />
                  <div>
                    <h4 className="font-semibold text-sm">
                      Trợ lý ảo FoodMap
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

              <div className="flex-1 min-h-0"> 
                <iframe
                  src="https://interlink-orderly.htq-nxt.space"
                  title="Interlink Orderly"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
