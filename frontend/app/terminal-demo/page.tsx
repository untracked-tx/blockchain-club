"use client";
import React, { useRef, useState } from "react";
import TerminalWindow from "@/components/TerminalWindow";

const BlankTerminalDemo: React.FC = () => {
  // Minimal state for demo
  const [history, setHistory] = useState<
    { type: "output" | "input"; value: string }[]
  >([
    { type: "output", value: "Welcome to the TerminalWindow demo!" },
    { type: "output", value: "Type a command below to see output." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);


  // Handle Enter key for demo
  const onInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      const cmdLine = input;
      setInput("");
      setHistory((h) => [...h, { type: "input", value: `$ ${cmdLine}` }]);
      setLoading(true);
      await new Promise((r) => setTimeout(r, 500));
      setHistory((h) => [
        ...h,
        { type: "output", value: `Echo: ${cmdLine}` },
      ]);
      setLoading(false);
      setLastScan(new Date());
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <TerminalWindow
        history={history}
        input={input}
        setInput={setInput}
        loading={loading}
        onInputKeyDown={onInputKeyDown}
        inputRef={inputRef as React.RefObject<HTMLInputElement>}
        outputRef={outputRef as React.RefObject<HTMLDivElement>}
        lastScan={lastScan}
      />
    </div>
  );
};

export default BlankTerminalDemo;
