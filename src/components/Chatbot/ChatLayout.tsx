"use client";

import {
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
  KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export type ChatRequest = {
  message: string;
  userId: string;
  sessionId?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string; // với bot: markdown
  createdAt: string;
};

type ChatApiResponse = {
  sessionId: string;
  userId: string;
  requestMessage: string;
  reply: string;
  raw?: {
    reply?: string;
    [key: string]: any;
  };
};

interface ChatLayoutProps {
  open: boolean;
  setOpen: (v: boolean) => void;

  // props cũ - giữ để không vỡ type, nhưng không dùng
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

  // props mới gợi ý
  userId?: string; // nếu không truyền, sẽ fallback "anonymous"
  sessionId?: string; // nếu không truyền, component tự tạo
  apiBaseUrl?: string; // nếu không truyền, dùng "https://api.food-map.online"
}

const SUGGESTED_QUESTIONS: string[] = [
  "Gợi ý cho tôi vài quán ăn ngon gần đây",
  "Tìm nhà hàng có món bún bò",
  "Có quán nào phù hợp cho 4 người tối nay không?",
  "Sản phẩm do ai làm",
];

function createSessionId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatLayout({
  open,
  setOpen,
  isSpeaking,
  unread = 0,
  chatEndRef,
  // legacy props (không dùng)
  messages: _messagesProp,
  input: _inputProp,
  setInput: _setInputProp,
  sendMessage: _sendMessageProp,
  startListening: _startListening,
  listening: _listening,
  typing: _typing,
  onQuickAsk: _onQuickAsk,
  // mới
  userId,
  sessionId,
  apiBaseUrl,
}: ChatLayoutProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const internalChatEndRef = useRef<HTMLDivElement | null>(null);

  const effectiveUserId = useMemo(
    () => userId || "anonymous",
    [userId],
  );

  const effectiveSessionId = useMemo(
    () => sessionId || createSessionId(),
    [sessionId],
  );

  const resolvedApiBase = useMemo(
    () => apiBaseUrl || "https://api.food-map.online",
    [apiBaseUrl],
  );

  // Auto scroll xuống cuối mỗi khi có message mới
  useEffect(() => {
    const el = chatEndRef?.current || internalChatEndRef.current;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, chatEndRef]);

  // Helper: stream từng ký tự cho bot reply (markdown)
  const streamBotReply = (fullText: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const createdAt = new Date().toISOString();

    // Thêm message bot rỗng
    setMessages((prev) => [
      ...prev,
      {
        id,
        role: "bot",
        text: "",
        createdAt,
      },
    ]);

    if (!fullText) return;

    let index = 0;
    const step = () => {
      index += 1;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, text: fullText.slice(0, index) } : m,
        ),
      );
      if (index < fullText.length) {
        setTimeout(step, 16); // tốc độ chữ
      }
    };

    setTimeout(step, 24);
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? inputValue).trim();
    if (!text || isSending) return;

    // Đẩy message user lên UI trước
    const userMsg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role: "user",
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) {
      setInputValue("");
    }

    const body: ChatRequest = {
      message: text,
      userId: effectiveUserId,
      sessionId: effectiveSessionId,
    };

    setIsSending(true);
    try {
      const res = await fetch(`${resolvedApiBase}/api/v1/chat-ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: ChatApiResponse = await res.json();

      // Lấy reply từ raw.reply hoặc reply (markdown)
      const replyText =
        data?.raw?.reply ||
        data?.reply ||
        "Xin lỗi, hiện tại tôi chưa có câu trả lời phù hợp.";

      // Stream từng chữ (markdown)
      streamBotReply(replyText);
    } catch (err) {
      console.error("Send chat error", err);
      streamBotReply(
        "Xin lỗi, hệ thống đang gặp sự cố. Bạn vui lòng thử lại sau một lúc nhé.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClickSuggested = (q: string) => {
    setInputValue(q);
    handleSend(q);
  };

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
            className="fixed bottom-28 right-6 z-[9998] w-[24rem] h-[34rem] backdrop-blur-xl bg-white/80 border border-white/60 shadow-[0_18px_60px_rgba(15,23,42,0.45)] rounded-3xl overflow-hidden"
          >
            <div className="flex h-full w-full flex-col">
              {/* Header */}
              <div className="shrink-0 bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://i.ibb.co/4nmVmX5H/Clean-Shot-2025-11-10-at-15-24-11.png"
                      alt="Assistant"
                      className="w-9 h-9 rounded-full border border-white/70 shadow-md"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-rose-400" />
                  </div>
                  <div className="leading-tight">
                    <h4 className="font-semibold text-sm">
                      Trợ lý ảo FoodMap
                    </h4>
                    <p className="text-[11px] opacity-95">
                      {isSpeaking ? "Đang nói…" : "Sẵn sàng giúp bạn tìm quán ăn"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/90 text-lg hover:scale-110 hover:text-white transition-transform"
                >
                  ✖
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 min-h-0 bg-gradient-to-b from-slate-50/90 via-slate-50/60 to-slate-100/90 flex flex-col">
                {/* Gợi ý câu hỏi – chỉ hiện KHI CHƯA CÓ message nào */}
                {messages.length === 0 && (
                  <div className="px-4 pt-3 pb-2 border-b border-slate-200/70 bg-white/80">
                    <p className="text-[11px] font-semibold text-slate-500 mb-2">
                      Bạn có thể bắt đầu với một trong các câu hỏi sau:
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {SUGGESTED_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleClickSuggested(q)}
                          className="text-[11px] text-left px-0 py-0 text-slate-600 hover:text-rose-600 hover:underline"
                        >
                          • {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 min-h-0">
                  <div className="h-full overflow-y-auto px-3 py-3 space-y-3 text-sm">
                    {messages.length === 0 && (
                      <div className="mt-4 text-center text-xs text-slate-400">
                        Hãy nhập câu hỏi hoặc chọn một gợi ý phía trên để bắt đầu
                        trò chuyện.
                      </div>
                    )}

                    {messages.map((m) => {
                      const isUser = m.role === "user";
                      return (
                        <div
                          key={m.id}
                          className={`flex ${
                            isUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm ${
                              isUser
                                ? "bg-rose-500 text-white rounded-br-none"
                                : "bg-white/95 text-slate-800 rounded-bl-none border border-slate-100"
                            }`}
                          >
                            {isUser ? (
                              <p className="whitespace-pre-wrap break-words">
                                {m.text}
                              </p>
                            ) : (
                              <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-slate-900">
                                <ReactMarkdown
                                  components={{
                                    p: ({ node, ...props }) => (
                                      <p
                                        {...props}
                                        className="text-sm leading-relaxed whitespace-pre-wrap"
                                      />
                                    ),
                                    ul: ({ node, ...props }) => (
                                      <ul
                                        {...props}
                                        className="list-disc list-inside space-y-0.5"
                                      />
                                    ),
                                    li: ({ node, ...props }) => (
                                      <li
                                        {...props}
                                        className="text-sm leading-relaxed"
                                      />
                                    ),
                                  }}
                                >
                                  {m.text}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div ref={internalChatEndRef} />
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="shrink-0 border-t border-slate-200 bg-white/95 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập câu hỏi về quán ăn, địa chỉ, đặt bàn..."
                    className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent bg-slate-50"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isSending || !inputValue.trim()}
                    className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-600 transition"
                  >
                    {isSending ? "Đang gửi…" : "Gửi"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
