"use client";

import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Đồng bộ value bên ngoài => nội dung editor
  useEffect(() => {
    if (!editorRef.current) return;
    // Tránh loop vô hạn
    if (editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const applyCommand = (cmd: string, value?: string) => {
    // dùng execCommand cho nhanh (dù deprecated nhưng vẫn ok cho tool nội bộ)
    document.execCommand(cmd, false, value);
    handleInput();
  };

  const handleClear = () => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = "";
    onChange("");
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => applyCommand("bold")}
          className="px-2 py-1 text-xs rounded-md hover:bg-gray-200"
        >
          <span className="font-bold">B</span>
        </button>
        <button
          type="button"
          onClick={() => applyCommand("italic")}
          className="px-2 py-1 text-xs rounded-md hover:bg-gray-200"
        >
          <span className="italic">I</span>
        </button>
        <button
          type="button"
          onClick={() => applyCommand("underline")}
          className="px-2 py-1 text-xs rounded-md hover:bg-gray-200"
        >
          <span className="underline">U</span>
        </button>

        <span className="h-4 w-px bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => applyCommand("formatBlock", "<h2>")}
          className="px-2 py-1 text-[11px] rounded-md hover:bg-gray-200"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => applyCommand("formatBlock", "<h3>")}
          className="px-2 py-1 text-[11px] rounded-md hover:bg-gray-200"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => applyCommand("formatBlock", "<p>")}
          className="px-2 py-1 text-[11px] rounded-md hover:bg-gray-200"
        >
          P
        </button>

        <span className="h-4 w-px bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => applyCommand("insertUnorderedList")}
          className="px-2 py-1 text-[11px] rounded-md hover:bg-gray-200"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => applyCommand("insertOrderedList")}
          className="px-2 py-1 text-[11px] rounded-md hover:bg-gray-200"
        >
          1. List
        </button>

        <span className="h-4 w-px bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={handleClear}
          className="ml-auto px-2 py-1 text-[11px] rounded-md hover:bg-red-50 text-red-600"
        >
          Xoá hết
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[160px] max-h-[480px] overflow-y-auto px-3 py-2 text-sm focus:outline-none prose prose-sm max-w-none
                   [&_h2]:text-lg [&_h2]:font-semibold
                   [&_h3]:text-base [&_h3]:font-semibold
                   [&_p]:mb-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5"
        data-placeholder={placeholder}
        // CSS cho placeholder via pseudo-element
        style={{ whiteSpace: "pre-wrap" }}
        onBlur={handleInput}
      />
      {/* Placeholder "ảo" */}
      {!value && (
        <div className="pointer-events-none select-none text-xs text-gray-400 px-3 py-2 -mt-[160px]">
          {placeholder}
        </div>
      )}
    </div>
  );
}
