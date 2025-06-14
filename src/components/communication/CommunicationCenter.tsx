
import { useState } from 'react';
import { MessageList } from './MessageList';
import { ChatWindow } from './ChatWindow';

export const CommunicationCenter = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(1);

  return (
    <div className="h-[calc(100vh-200px)] flex gap-4">
      <div className="w-full md:w-1/3 lg:w-1/4">
        <MessageList 
          onChatSelect={setSelectedChat}
          selectedChat={selectedChat}
        />
      </div>
      
      <div className="hidden md:block md:w-2/3 lg:w-3/4">
        <ChatWindow chatId={selectedChat} />
      </div>
    </div>
  );
};
