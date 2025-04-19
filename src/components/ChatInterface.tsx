
import { useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { McqOption } from "./McqOption";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  options?: string[];
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to the MCQ Quiz! Let's start with a question:",
      isBot: true
    },
    {
      id: 2,
      text: "What is the capital of France?",
      isBot: true,
      options: ["London", "Berlin", "Paris", "Madrid"]
    }
  ]);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setShowResult(true);
    
    // Simulate response after selection
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: option === "Paris" ? "Correct! 🎉" : "Sorry, that's incorrect. The correct answer is Paris.",
        isBot: true
      }]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-[80vh] bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} content={message.text} isBot={message.isBot}>
            {message.options && (
              <div className="mt-4">
                {message.options.map((option) => (
                  <McqOption
                    key={option}
                    text={option}
                    onClick={() => handleOptionSelect(option)}
                    isSelected={selectedOption === option}
                    isCorrect={
                      showResult
                        ? option === "Paris"
                          ? true
                          : option === selectedOption
                          ? false
                          : null
                        : null
                    }
                  />
                ))}
              </div>
            )}
          </MessageBubble>
        ))}
      </div>
    </div>
  );
};
