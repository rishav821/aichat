// ChatApp.js
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Make sure this matches your backend port

const ChatApp = () => {
 const [channelId, setChannelId] = useState("683b2dbcecf6783b5ca84979"); 
const [userId, setUserId] = useState("683bf8635bc7c0fd68e71072");      
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit("joinChannel", { channelId });

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [channelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (text.trim() === "") return;

    socket.emit("sendMessage", {
      text,
      channelId,
      user: { id: userId }, // match backend `user.id`
    });

    setText("");
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h2>Socket Chat – Channel: {channelId}</h2>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 5,
          height: 300,
          overflowY: "auto",
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <strong>{msg.isAI ? "🤖 AI" : msg.sender || "User"}:</strong> {msg.text}
            {msg.file && (
              <div>
                <a href={msg.file} target="_blank" rel="noreferrer">
                  📎 File
                </a>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message (use @ai to get a bot reply)"
        style={{ width: "80%", padding: 10 }}
      />
      <button onClick={sendMessage} style={{ padding: 10, marginLeft: 10 }}>
        Send
      </button>
    </div>
  );
};

export default ChatApp;
