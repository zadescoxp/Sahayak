"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/firebase/config";
import AuthMiddleware from "../../../../utils/middleware";
import Link from "next/link";

interface Message {
  type: "user" | "assistant";
  content: string;
  audioUrl?: string;
}

interface PageParams {
  id: string;
}

export default function Mode({ params }: { params: PageParams }) {
  const { id } = params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<{[key: number]: boolean}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAudio = async (text: string, messageIndex: number) => {
    try {
      setIsGeneratingAudio(prev => ({...prev, [messageIndex]: true}));
      const user = auth.currentUser;
      if (!user) {
        console.warn("User not logged in");
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate audio");
      }

      const data = await response.json();
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          audioUrl: data.audioUrl
        };
        return newMessages;
      });
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setIsGeneratingAudio(prev => ({...prev, [messageIndex]: false}));
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

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
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ input }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const newMessage = { type: "assistant" as const, content: data.response };
      setMessages((prev) => [...prev, newMessage]);
      
      // Generate audio for the new message
      await generateAudio(data.response, messages.length);
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
      <div className="w-full h-screen">
        <div className="h-full">
          <div className="bg-white rounded-lg shadow-lg h-full text-black">
            <div className="h-full overflow-y-auto p-4 py-24 relative">
              <span className="flex items-center justify-between fixed top-0 left-1/2 w-[20vw] -translate-x-1/2 bg-white p-5 rounded-lg max-sm:w-screen">
                <Link href={"/"} className="text-blue-500">Back</Link>
                <h2 className="text-2xl">{id}</h2>
              </span>
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
                    <div className="text-lg">{message.content}</div>
                    {message.type === "assistant" && (
                      <div className="mt-2 flex items-center gap-2">
                        {!message.audioUrl && !isGeneratingAudio[index] && (
                          <button
                            onClick={() => generateAudio(message.content, index)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Listen to this message"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        {isGeneratingAudio[index] && (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                        )}
                        {message.audioUrl && (
                          <audio controls className="h-8">
                            <source src={message.audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        )}
                      </div>
                    )}
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

            <div className="flex gap-2 absolute bottom-2 left-1/2 -translate-x-1/2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-3 border rounded-lg text-lg outline-none bg-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 text-lg flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthMiddleware>
  );
}
