"use client";

import {
  KeyboardEvent,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export type ChatRequest = {
  message: string;
  userId: string;
  sessionId?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string; // bot: markdown
  createdAt: string;
  images?: string[]; // URL ảnh đi kèm câu trả lời
};

type ChatApiResponse = {
  sessionId: string;
  userId: string;
  requestMessage: string;
  reply: string;
  images?: string[];
  raw?: {
    reply?: string;
    images?: string[];
    [key: string]: any;
  };
};

interface ChatLayoutProps {
  open: boolean;
  setOpen: (v: boolean) => void;

  // props cũ - giữ cho đủ type, không dùng
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

  // props gợi ý mới
  userId?: string;
  sessionId?: string;
  apiBaseUrl?: string;
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

export default function ChatLayout(props: ChatLayoutProps) {
  const {
    open,
    setOpen,
    isSpeaking,
    unread = 0,
    // legacy props (bỏ qua)
    chatEndRef: _chatEndRef,
    messages: _oldMessages,
    input: _oldInput,
    setInput: _oldSetInput,
    sendMessage: _oldSendMessage,
    startListening: _oldStartListening,
    listening: _oldListening,
    typing: _oldTyping,
    onQuickAsk: _oldOnQuickAsk,
    // mới
    userId,
    sessionId,
    apiBaseUrl,
  } = props;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const internalChatEndRef = useRef<HTMLDivElement | null>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);

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

  const isEmpty = messages.length === 0;

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  // tự scroll xuống khi đang ở cuối
  useEffect(() => {
    if (!isAtBottom) return;
    scrollToBottom("auto");
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    setIsAtBottom(distanceToBottom < 40);
  };

  // Typing effect cho bot
  const streamBotReply = (fullText: string, images?: string[]) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const createdAt = new Date().toISOString();

    setMessages((prev) => [
      ...prev,
      {
        id,
        role: "bot",
        text: "",
        createdAt,
        images,
      },
    ]);

    if (!fullText) return;

    let index = 0;

    const step = () => {
      index += 2;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, text: fullText.slice(0, index) } : m,
        ),
      );
      if (index < fullText.length) {
        setTimeout(step, 20);
      }
    };

    setTimeout(step, 80);
  };

  /**
   * Gửi message
   * - overrideText: text truyền vào (ví dụ từ gợi ý)
   * - fromSuggestion: true nếu click gợi ý
   */
  const handleSend = async (
    overrideText?: string,
    fromSuggestion: boolean = false,
  ) => {
    const textSource = fromSuggestion
      ? overrideText ?? ""
      : overrideText ?? inputValue;

    const text = textSource.trim();
    if (!text || isSending) return;

    const now = new Date().toISOString();

    const userMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role: "user",
      text,
      createdAt: now,
    };

    // khi gửi thì coi như đang ở cuối
    setIsAtBottom(true);
    setMessages((prev) => [...prev, userMessage]);

    // LUÔN clear input ngay khi gửi (kể cả từ gợi ý)
    setInputValue("");

    const payload: ChatRequest = {
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
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: ChatApiResponse = await res.json();

      const replyText =
        data?.raw?.reply ||
        data?.reply ||
        "Xin lỗi, hiện tại tôi chưa có câu trả lời phù hợp.";

      const replyImages: string[] | undefined =
        data?.raw?.images || data?.images;

      streamBotReply(replyText, replyImages);
    } catch (error) {
      console.error("Chat error", error);

      const errorMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role: "bot",
        text:
          "Xin lỗi, hệ thống đang gặp sự cố. Bạn vui lòng thử lại sau một lúc nhé.",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
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

  const handleClickSuggested = (question: string) => {
    // Không hiển thị câu gợi ý vào input, nhưng vẫn clear input cũ (do handleSend đã clear)
    handleSend(question, true);
  };

  return (
    <>
      {/* Nút nổi */}
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-xl text-white shadow-lg outline-none"
        aria-label={open ? "Đóng chat trợ lý FoodMap" : "Mở chat trợ lý FoodMap"}
      >
        {open ? "×" : "💬"}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </motion.button>

      {/* Cửa sổ chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-24 right-5 z-[9998] flex h-[32rem] w-[23rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8">
                  <img
                    src="https://i.ibb.co/4nmVmX5H/Clean-Shot-2025-11-10-at-15-24-11.png"
                    alt="FoodMap Assistant"
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-slate-50" />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-slate-900">
                    Trợ lý ảo FoodMap
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isSpeaking
                      ? "Đang trò chuyện với bạn…"
                      : "Hỏi tôi về quán ăn, địa điểm, đặt bàn…"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-200/70"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 min-h-0 flex-col bg-slate-50">
              {/* Gợi ý khi chưa có message */}
              {isEmpty && (
                <div className="border-b border-slate-200 bg-white px-3 pt-3 pb-2">
                  <p className="mb-2 text-[11px] font-medium text-slate-600">
                    Bạn có thể bắt đầu với:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleClickSuggested(q)}
                        disabled={isSending}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700 hover:border-slate-300 hover:bg-white disabled:opacity-60"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Danh sách messages */}
              <div className="flex-1 min-h-0">
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex h-full flex-col space-y-3 overflow-y-auto px-3 py-3 text-sm"
                >
                  {isEmpty && (
                    <div className="mt-4 text-center text-[11px] text-slate-400">
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
                          className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                            isUser
                              ? "rounded-br-sm bg-slate-900 text-white"
                              : "rounded-bl-sm bg-white text-slate-900 border border-slate-200"
                          }`}
                        >
                          {/* Text */}
                          {isUser ? (
                            <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                              {m.text}
                            </p>
                          ) : (
                            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-slate-900 prose-a:text-slate-900 prose-a:underline">
                              <ReactMarkdown
                                components={{
                                  p: ({ node, ...props }) => (
                                    <p
                                      {...props}
                                      className="whitespace-pre-wrap text-[13px] leading-relaxed"
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
                                      className="text-[13px] leading-relaxed"
                                    />
                                  ),
                                  a: ({ node, ...props }) => (
                                    <a
                                      {...props}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    />
                                  ),
                                  img: ({ node, ...props }) => (
                                    <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
                                      <div className="aspect-[4/3] w-full">
                                        <img
                                          {...props}
                                          loading="lazy"
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  ),
                                }}
                              >
                                {m.text}
                              </ReactMarkdown>
                            </div>
                          )}

                          {/* Ảnh gợi ý từ API */}
                          {!isUser && m.images && m.images.length > 0 && (
                            <div className="mt-2 flex flex-col gap-2">
                              {m.images.map((src, index) => (
                                <div
                                  key={`${m.id}-img-${index}`}
                                  className="overflow-hidden rounded-xl border border-slate-200"
                                >
                                  <div className="aspect-[4/3] w-full">
                                    <img
                                      src={src}
                                      loading="lazy"
                                      alt={`Ảnh gợi ý ${index + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-500">
                        <span className="flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                          <span
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                            style={{ animationDelay: "0.12s" }}
                          />
                          <span
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                            style={{ animationDelay: "0.24s" }}
                          />
                        </span>
                        <span>Đang trả lời…</span>
                      </div>
                    </div>
                  )}

                  <div ref={internalChatEndRef} />
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 bg-white px-3 py-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập câu hỏi về quán ăn, địa chỉ, đặt bàn..."
                  className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-slate-400 focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={isSending || !inputValue.trim()}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending ? "Đang gửi…" : "Gửi"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
