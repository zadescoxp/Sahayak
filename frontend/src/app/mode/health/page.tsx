"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/firebase/config";
import AuthMiddleware from "../../../../utils/middleware";
import Image from "next/image";

interface Message {
  type: "user" | "assistant";
  content: string;
  imageUrl?: string;
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
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
              setSelectedImage(file);
              setPreviewUrl(URL.createObjectURL(blob));
            }
          }, 'image/jpeg');
        }
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleSpeechToText(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSpeechToText = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn("User not logged in");
        return;
      }

      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/speech-to-text`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      setInput(data.text);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

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

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn("User not logged in");
        return;
      }

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        const idToken = await user.getIdToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/mode/health/analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ image: base64Image }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to analyze image");
        }

        const data = await response.json();
        const newMessage = { 
          type: "assistant" as const, 
          content: data.data.analysis,
          imageUrl: data.data.imageUrl
        };
        
        setMessages((prev) => [...prev, newMessage]);
        await generateAudio(data.data.analysis, messages.length);

        setSelectedImage(null);
        setPreviewUrl(null);
      };
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "Sorry, there was an error analyzing your image.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { 
      type: "user", 
      content: input,
      imageUrl: previewUrl || undefined
    }]);
    setInput("");
    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn("User not logged in");
        return;
      }

      const idToken = await user.getIdToken();

      if (selectedImage) {
        // If there's an image, analyze it first
        await analyzeImage();
      } else {
        // Otherwise, send chat message
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/mode/health/chat`,
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
        await generateAudio(data.response, messages.length);
      }
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
                    {message.imageUrl && (
                      <div className="mt-2">
                        <Image
                          src={message.imageUrl}
                          alt="Uploaded prescription"
                          width={200}
                          height={200}
                          className="rounded-lg"
                        />
                      </div>
                    )}
                    {message.type === "assistant" && (
                      <div className="mt-2 flex items-center gap-2">
                        {!message.audioUrl && !isGeneratingAudio[index] && (
                          <button
                            onClick={() => generateAudio(message.content, index)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        {isGeneratingAudio[index] && (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
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

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`${
                    isRecording ? 'bg-red-500' : 'bg-green-500'
                  } text-white px-4 py-2 rounded-lg hover:bg-green-600 text-lg flex items-center gap-2`}
                  disabled={isTranscribing}
                >
                  {isRecording ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      Speak
                    </>
                  )}
                </button>
                {isTranscribing && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                    Converting speech to text...
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message or speak..."
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 text-lg flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthMiddleware>
  );
}