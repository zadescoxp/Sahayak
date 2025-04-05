"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/firebase/config";
import AuthMiddleware from "../../../../utils/middleware";
import { motion } from "framer-motion";

interface Message {
  type: "user" | "assistant";
  content: string;
}

interface PageParams {
  id: string;
}

const VoiceBar = ({ delay }: { delay: number }) => (
  <motion.div
    className="w-[2px] bg-blue-400/80"
    animate={{
      height: [8, 24, 8],
      opacity: [0.3, 0.8, 0.3],
    }}
    transition={{
      duration: 0.8,
      repeat: Infinity,
      delay: delay * 0.03,
      ease: "easeInOut",
    }}
  />
);

const VoiceVisualizer = () => (
  <div className="flex items-center gap-[2px] h-24">
    {[...Array(60)].map((_, i) => (
      <VoiceBar key={i} delay={i} />
    ))}
  </div>
);

export default function Mode({ params }: { params: PageParams }) {
  const { id } = params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      console.log(data);

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

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    // Add actual recording logic here
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Add stop recording logic here
  };

  return (
    <AuthMiddleware>
      <div className="flex h-screen bg-white">
        <div className="flex-1 flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto">
              {messages.length === 0 && (
                <div className="text-center py-20">
                  <h1 className="text-4xl font-medium text-gray-900 mb-2">
                    How can I help you today?
                  </h1>
                  <p className="text-gray-500 text-lg">
                    Send a message or use voice to begin
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index}
                  className={`border-b border-gray-100 ${
                    message.type === "assistant" ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="max-w-3xl mx-auto px-4 py-6 flex gap-6">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0">
                      {message.type === "assistant" ? (
                        <div className="w-full h-full bg-[#10a37f] rounded-lg flex items-center justify-center shadow-sm">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-white"
                          >
                            <path
                              d="M9 21c0-.6.4-1 1-1h4c.6 0 1 .4 1 1s-.4 1-1 1h-4c-.6 0-1-.4-1-1z"
                              fill="currentColor"
                            />
                            <path
                              d="M12 3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2s2-.9 2-2V5c0-1.1-.9-2-2-2z"
                              fill="currentColor"
                            />
                            <path
                              d="M7.1 8.2C8.3 6.9 10.1 6 12 6s3.7.9 4.9 2.2c.2.2.2.5 0 .7-.2.2-.5.2-.7 0-1-1.1-2.5-1.8-4.2-1.8s-3.2.7-4.2 1.8c-.2.2-.5.2-.7 0-.2-.2-.2-.5 0-.7z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-white"
                          >
                            <path
                              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="prose max-w-none text-gray-800">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="py-6 px-4 max-w-3xl mx-auto">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-gray-100 bg-white shadow-sm">
            <div className="max-w-3xl mx-auto p-4">
              <div className="relative flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Message..."
                  rows={1}
                  className="w-full py-3 px-4 pr-24 bg-white rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-300 focus:ring-0 resize-none"
                  style={{ maxHeight: "200px" }}
                />
                <div className="absolute right-1.5 flex gap-1 items-center">
                  <motion.button
                    onClick={() => setIsVoiceModalOpen(true)}
                    className="p-2 text-gray-500 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-75"
                    >
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                  </motion.button>
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className={`p-2 rounded-xl flex items-center justify-center ${
                      !input.trim() || isLoading
                        ? "opacity-30 cursor-not-allowed"
                        : "text-gray-500 hover:text-gray-600 hover:bg-gray-50"
                    } transition-all duration-200`}
                    whileHover={
                      input.trim() && !isLoading ? { scale: 1.02 } : {}
                    }
                    whileTap={input.trim() && !isLoading ? { scale: 0.98 } : {}}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-75"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h8" />
                      <path d="m12 8 4 4-4 4" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Modal */}
        {isVoiceModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white flex items-center justify-center z-50"
          >
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <motion.button
                onClick={() => setIsVoiceModalOpen(false)}
                className="absolute top-6 right-6 text-gray-600 hover:text-gray-900"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>

              <div className="flex flex-col items-center justify-center space-y-12 max-w-lg w-full mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-medium text-gray-900"
                >
                  {isRecording ? "Listening..." : "Speak your message"}
                </motion.div>

                <div className="relative w-48 h-48">
                  {/* Large gradient circle */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-300 to-blue-500 blur-xl opacity-20" />

                  {/* Main circle button */}
                  <motion.button
                    onClick={isRecording ? stopRecording : startRecording}
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isRecording ? (
                      <div className="w-8 h-8 bg-white rounded-lg" />
                    ) : (
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-white"
                      >
                        <path
                          d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                          fill="currentColor"
                        />
                        <path
                          d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                          fill="currentColor"
                        />
                      </svg>
                    )}

                    {/* Pulsing rings */}
                    {isRecording && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-blue-400"
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.6, 0, 0.6],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-blue-400"
                          animate={{
                            scale: [1, 1.8, 1],
                            opacity: [0.4, 0, 0.4],
                          }}
                          transition={{
                            duration: 2,
                            delay: 0.3,
                            repeat: Infinity,
                          }}
                        />
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="w-full max-w-md flex justify-center">
                  {isRecording ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-100/20 to-transparent blur-lg"></div>
                      <VoiceVisualizer />
                    </div>
                  ) : (
                    <div className="h-24 flex items-center">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-gray-500 text-lg font-light"
                      >
                        Click the microphone to start
                      </motion.div>
                    </div>
                  )}
                </div>

                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl text-gray-900 font-medium tracking-wider"
                  >
                    {Math.floor(recordingTime / 60)}:
                    {(recordingTime % 60).toString().padStart(2, "0")}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AuthMiddleware>
  );
}
