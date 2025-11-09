"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Live2DModel } from "pixi-live2d-display/cubism4";
import { setupAudioMouthSync } from "./useLive2D";
import { useLocationStore } from "@/stores/locationStore";
import ChatLayout from "./ChatLayout";

export default function ChatControls({
  modelRef,
}: {
  modelRef?: RefObject<Live2DModel | null>;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const { lat, lng } = useLocationStore();

  const greetOnce = useRef(false);
  useEffect(() => {
    if (open && !greetOnce.current) {
      greetOnce.current = true;
      (async () => {
        setTyping(true);
        try {
          const hour = new Date().getHours();
          const timeGreeting =
            hour < 10
              ? "Chào buổi sáng"
              : hour < 18
              ? "Chào buổi chiều"
              : "Chào buổi tối";
          const city = "khu vực của bạn";
          const greet = `${timeGreeting} ạ! Em là Pika – trợ lý ảo của FoodMap. Em có thể gợi ý món hợp thời tiết, tìm quán ngon quanh ${city}, hoặc chỉ đường nhanh. Anh/chị muốn em giúp gì trước nè?`;
          await new Promise((r) => setTimeout(r, 500));
          setMessages([{ role: "bot", text: greet }]);
        } finally {
          setTyping(false);
        }
      })();
    }
  }, [open]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!open) {
      // tăng unread khi có tin nhắn mới lúc đóng
      const unsub = new MutationObserver(() => setUnread((n) => n + 1));
      const el = chatEndRef.current;
      if (el) unsub.observe(el, { childList: true });
      return () => unsub.disconnect();
    } else {
      setUnread(0);
    }
  }, [open]);

  const sendMessage = async (customText?: string) => {
    const text = (customText ?? input).trim();
    if (!text) return;
    setMessages((msgs) => [...msgs, { role: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"
        }/chat/ask`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            lat: lat ?? null,
            lng: lng ?? null,
          }),
        }
      );
      const { reply, audioUrl } = await res.json();

      const clean = String(reply || "").replace(/\*/g, "");
      setMessages((msgs) => [...msgs, { role: "bot", text: clean }]);

      if (audioUrl && modelRef?.current) {
        const audioEl = new Audio(audioUrl);
        setupAudioMouthSync(
          audioEl,
          modelRef.current as any,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
        audioEl.play().catch(() =>
          document.addEventListener("click", () => audioEl.play(), {
            once: true,
          })
        );
      }
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "bot",
          text: "Xin lỗi, server đang bận. Bạn thử lại giúp mình nhé.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Trình duyệt không hỗ trợ micro.");
    const rec = new SpeechRecognition();
    rec.lang = "vi-VN";
    rec.interimResults = false;
    setListening(true);
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      if (transcript) sendMessage(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  };

  return (
    <ChatLayout
      open={open}
      setOpen={setOpen}
      messages={messages}
      input={input}
      setInput={setInput}
      sendMessage={sendMessage}
      startListening={startListening}
      listening={listening}
      isSpeaking={isSpeaking}
      chatEndRef={chatEndRef}
      typing={typing}
      unread={unread}
      onQuickAsk={(t) => sendMessage(t)}
    />
  );
}
