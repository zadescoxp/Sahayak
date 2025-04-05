"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/firebase/config";
import AuthMiddleware from "../../../../utils/middleware";

interface Message {
  type: "user" | "assistant";
  content: string;
}

interface PageParams {
  id: string;
}

export default function Mode({ params }: { params: PageParams }) {
  const { id } = params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { type: "user", content: input }]);
    setInput("");
    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn("User not logged in");
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/mode/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      console.log(data)

      // Add assistant message to chat
      setMessages((prev) => [
        ...prev,
        { type: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthMiddleware>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto p-4">
          {/* Chat Interface */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <div className="h-[calc(100vh-200px)] overflow-y-auto mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.type === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthMiddleware>
  );
}
