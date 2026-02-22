"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSignOutAlt,
  faBars,
  faTimes,
  faCopy,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

export default function ChatApp() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const userName = "Ashar Khan";
  const firstLetter = userName[0];

  const handleNewChat = () => {
    setMessages([]);
    setRecentChats((prev) => [
      ...prev,
      { id: Date.now(), title: `Chat ${prev.length + 1}` },
    ]);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setMessage("");
    // Simulate AI response
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "This is a simulated AI response." },
      ]);
      setLoading(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 1000);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const renderMessage = (text: string) => <span>{text}</span>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-black text-white flex">
      {/* Sidebar */}
     <aside
  className={`fixed inset-y-0 left-0 z-20 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-5 
    h-screen flex flex-col transform transition-transform duration-300
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
>
  {/* Close button (mobile only) */}
  <div className="md:hidden flex justify-end mb-4">
    <button onClick={() => setSidebarOpen(false)}>
      <FontAwesomeIcon icon={faTimes} className="text-white text-xl" />
    </button>
  </div>

  {/* Header */}
  <h2 className="text-lg text-center font-semibold mb-6 tracking-wide text-white/90">
    My AI Assistant
  </h2>

  {/* New Chat Button */}
  <button
    onClick={handleNewChat}
    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl py-2 px-4 text-sm font-medium hover:scale-105 hover:shadow-lg transition-all w-full justify-center mb-3"
  >
    <FontAwesomeIcon icon={faPlus} className="text-white text-sm" />
    New Chat
  </button>

  {/* Conversation List */}
  <div className="flex-1 overflow-y-auto space-y-2 text-sm">
    {recentChats.length === 0 ? (
      <div className="p-2 text-gray-400">No recent conversations</div>
    ) : (
      recentChats.map((chat) => (
        <div
          key={chat.id}
          className="p-2 rounded-lg hover:bg-white/10 cursor-pointer transition"
          onClick={() => {
            const storedMessages = JSON.parse(
              localStorage.getItem("chatHistory") || "[]"
            );
            setMessages(storedMessages);
            setSidebarOpen(false);
          }}
        >
          {chat.title}
        </div>
      ))
    )}
  </div>

  {/* Logout Button */}
  <div className="mt-auto">
    <button
      onClick={async () => {
        await fetch("/api/logout", { method: "POST" });
        toast.success("Logged out successfully!");
        router.push("/login");
      }}
      className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white rounded-xl py-2 px-4 text-sm font-medium w-full justify-center transition-all shadow-md mt-3"
    >
      <FontAwesomeIcon icon={faSignOutAlt} className="text-white text-sm" />
      Logout
    </button>
  </div>
</aside>

      {/* Main Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center">
          {/* Hamburger mobile button */}
          <div className="md:hidden">
            <button onClick={() => setSidebarOpen(true)}>
              <FontAwesomeIcon icon={faBars} className="text-white text-xl" />
            </button>
          </div>

          <h1 className="text-xl font-semibold tracking-wide">
            My AI Assistant
          </h1>

          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 
                flex items-center justify-center text-sm font-bold shadow-lg 
                hover:scale-110 transition duration-300"
              >
                {firstLetter}
              </div>

              <div
                className="absolute right-0 mt-2 px-3 py-1 text-xs bg-black/80 rounded-lg opacity-0 
                group-hover:opacity-100 transition backdrop-blur-md border border-white/10"
              >
                {userName}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 max-w-4xl w-full mx-auto">
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <h2 className="text-3xl font-semibold mb-4">
                How can I help you today?
              </h2>
              <p className="text-gray-400">
                Ask anything about development, business, or AI.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className="flex gap-4 items-start group">
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold
                ${
                  msg.role === "user"
                    ? "bg-blue-600"
                    : "bg-gradient-to-br from-indigo-600 to-purple-600"
                }`}
              >
                {msg.role === "user" ? firstLetter : "AI"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 mb-1 flex justify-between items-center">
                  <span>{msg.role === "user" ? "You" : "AI Assistant"}</span>

                  {msg.role !== "user" && (
                    <button
                      onClick={() => handleCopy(msg.text, index)}
                      className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white"
                    >
                      <FontAwesomeIcon
                        icon={copiedIndex === index ? faCheck : faCopy}
                        className="text-sm"
                      />
                    </button>
                  )}
                </div>

                <div className="relative bg-white/10 border border-white/10 backdrop-blur-xl p-4 rounded-2xl leading-relaxed text-sm shadow-lg overflow-hidden max-w-full">
                  {renderMessage(msg.text)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 items-start">
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold">
                AI
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-xl p-4 rounded-2xl flex gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Section */}
        <div className="sticky bottom-0 border-t border-white/10 backdrop-blur-xl bg-white/5 p-5">
          <div className="max-w-4xl mx-auto flex items-center gap-4 bg-white/10 border border-white/10 rounded-2xl px-5 py-3 shadow-xl focus-within:ring-2 focus-within:ring-blue-600 transition">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
            />

            <button
              onClick={sendMessage}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 rounded-xl text-sm font-semibold hover:scale-105 active:scale-95 transition shadow-md"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
