import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef , useState} from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { socket } from "../lib/socket";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

useEffect(() => {
  socket.on("userTyping", ({ from }) => {
    if (from === selectedUser._id) setIsTyping(true);
  });

  socket.on("userStoppedTyping", ({ from }) => {
    if (from === selectedUser._id) setIsTyping(false);
  });

  return () => {
    socket.off("userTyping");
    socket.off("userStoppedTyping");
  };
}, [selectedUser]);

 useEffect(() => {
   console.log("selectedUser in ChatContainer:", selectedUser);
  console.log("authUser in ChatContainer:", authUser);
  if (!selectedUser?._id || !authUser?._id) return;
console.log("Calling getMessages for:", selectedUser._id);
 getMessages(selectedUser._id, authUser._id);
  subscribeToMessages();

  return () => unsubscribeFromMessages();
}, [
  selectedUser?._id,
  authUser?._id,
  getMessages,
  subscribeToMessages,
  unsubscribeFromMessages,
]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {messages.map((message) => (
  <div
    key={message._id}
    className={`chat ${
      message.sender._id === authUser._id ? "chat-end" : "chat-start"
    }`}
    ref={messageEndRef}
  >
    <div className="chat-image avatar">
      <div className="size-10 rounded-full border">
        <img
          src={
            message.sender._id === authUser._id
              ? authUser.profilePic || "/avatar.png"
              : selectedUser.profilePic || "/avatar.png"
          }
          alt="profile pic"
        />
      </div>
    </div>
    <div className="chat-header mb-1">
      <time className="text-xs opacity-50 ml-1">
        {formatMessageTime(message.createdAt)}
      </time>
    </div>
    <div className="chat-bubble flex flex-col">
      {message.attachments && message.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {message.attachments.map((file) => (
            <img
              key={file._id}
              src={`http://localhost:3000${file.url}`}
              alt="Attachment"
              className="sm:max-w-[200px] rounded-md"
            />
          ))}
        </div>
      )}
      {message.content && <p>{message.content}</p>}
    </div>
    {message.sender._id === authUser._id && (
  <span className="text-xs text-gray-400 self-end mt-1">
    {message.status === "seen"
      ? "👁 Seen"
      : message.status === "delivered"
      ? "✅ Delivered"
      : "🕓 Sent"}
  </span>
)}
  </div>
))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;