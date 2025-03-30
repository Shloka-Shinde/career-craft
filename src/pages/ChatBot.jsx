import { useEffect } from "react";

const ChatBot = () => {
  useEffect(() => {
    window.chtlConfig = { chatbotId: "5497116947" };
    
    const script = document.createElement("script");
    script.src = "https://chatling.ai/js/embed.js";
    script.async = true;
    script.setAttribute("data-id", "5497116947");
    script.id = "chatling-embed-script";

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // The script loads the chatbot, so no visible component is needed
};

export default ChatBot;