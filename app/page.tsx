"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faCheck,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(Date.now()); // unique chat session

  // Inside your component
  const [recentChats, setRecentChats] = useState<any>([]);

  useEffect(() => {
    // Load messages from localStorage
    const storedMessages = localStorage.getItem("chatHistory");
    if (storedMessages) {
      const parsed = JSON.parse(storedMessages);

      // Extract recent conversation titles (first user message or custom title)
      const uniqueConversations = parsed.reduce(
        (acc: any[], msg: any, idx: number) => {
          if (msg.role === "user") {
            // use first 20 chars as title
            const title =
              msg.text.slice(0, 20) + (msg.text.length > 20 ? "..." : "");
            acc.push({ id: idx, title });
          }
          return acc;
        },
        [],
      );

      setRecentChats(uniqueConversations);
    }
  }, []);

  const router = useRouter();

  const handleCopy = (text: any, index: any) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);

    setTimeout(() => {
      setCopiedIndex(null);
    }, 1500);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleNewChat = () => {
    const newId = Date.now(); // unique session ID
    setCurrentChatId(newId);
    setMessages([]); // clear main chat area
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const now = Date.now();
    const userMessage = { role: "user", text: message, timestamp: now };

    // Load previous chats from localStorage
    const storedAllChats = JSON.parse(localStorage.getItem("allChats") || "{}");

    // Append message to current chat
    const currentMessages = storedAllChats[currentChatId] || [];
    const updatedCurrentMessages = [...currentMessages, userMessage];
    storedAllChats[currentChatId] = updatedCurrentMessages;

    setMessages(updatedCurrentMessages);
    localStorage.setItem("allChats", JSON.stringify(storedAllChats));

    setMessage("");
    setLoading(true);

    // Fetch AI response
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    const aiMessage = {
      role: "assistant",
      text: data.reply,
      timestamp: Date.now(),
    };
    const updatedMessages = [...updatedCurrentMessages, aiMessage];

    storedAllChats[currentChatId] = updatedMessages;
    setMessages(updatedMessages);
    localStorage.setItem("allChats", JSON.stringify(storedAllChats));

    setLoading(false);

    // Update recent chats
    setRecentChats((prev: any) => [
      { id: currentChatId, title: message.slice(0, 20) + "..." },
      ...prev.filter((c: any) => c.id !== currentChatId),
    ]);
  };
  useEffect(() => {
    const storedMessages = localStorage.getItem("chatHistory");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);
  const firstLetter =
    userName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "U";

  const renderMessage = (text: any) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const match = codeBlockRegex.exec(text);

    if (match) {
      const language = match[1] || "javascript";
      const code = match[2];

      return (
        <div className="max-w-full overflow-x-auto">
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            wrapLongLines={true}
            customStyle={{
              borderRadius: "16px",
              padding: "16px",
              fontSize: "13px",
              maxWidth: "100%",
              overflowX: "auto",
            }}
            codeTagProps={{
              style: { whiteSpace: "pre-wrap", wordBreak: "break-word" },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }

    return <p>{text}</p>;
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-black text-white flex">
      <aside className="hidden md:flex flex-col w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-5 h-screen sticky top-0">
        {/* Header */}
        <h2 className="text-lg text-center font-semibold mb-6 tracking-wide text-white/90">
          My AI Assistant
        </h2>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat} // <-- attach here
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl py-2 px-4 text-sm font-medium hover:scale-105 hover:shadow-lg transition-all w-full justify-center"
        >
          <FontAwesomeIcon icon={faPlus} className="text-white text-sm" />
          New Chat
        </button>

        {/* Conversation List */}
        <div className="mt-3 flex-1 space-y-2 text-sm overflow-y-auto">
          {recentChats.length === 0 ? (
            <div className="p-2 text-gray-400">No recent conversations</div>
          ) : (
            recentChats.map((chat: any) => (
              <div
                key={chat.id}
                className="p-2 rounded-lg hover:bg-white/10 cursor-pointer transition"
                onClick={() => {
                  const storedMessages = JSON.parse(
                    localStorage.getItem("chatHistory") || "[]",
                  );
                  setMessages(storedMessages);
                }}
              >
                {chat.title}
              </div>
            ))
          )}
        </div>

        {/* Logout Button at bottom */}
        <div className="mt-auto">
          <button
            onClick={async () => {
              await fetch("/api/logout", { method: "POST" });
              toast.success("Logged out successfully!");
              router.push("/login");
            }}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white rounded-xl py-2 px-4 text-sm font-medium w-full justify-center transition-all shadow-md"
          >
            <FontAwesomeIcon
              icon={faSignOutAlt}
              className="text-white text-sm"
            />
            Logout
          </button>
        </div>
      </aside>
      {/* Main Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center">
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

        {/* Chat Area (scrollable) */}
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
              {/* Avatar */}
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

              {/* Message */}
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

        {/* Fixed Input Section */}
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
