import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with a dummy key if not provided so the app doesn't crash on boot.
// Real usage requires a GEMINI_API_KEY in the .env file.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');

export const getAiProvider = () => {
  // Use gemini-1.5-flash for fast chat responses
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const generateResponse = async (prompt, systemInstruction) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "⚠️ The AI is currently offline. Please add a `GEMINI_API_KEY` to the `.env` file to enable smart features.";
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "I'm having trouble connecting to my neural network right now. Please try again later!";
  }
};

export const generateStreamResponse = async (history, systemInstruction, onChunk) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      onChunk("⚠️ The AI is currently offline. Please add a `GEMINI_API_KEY` to the `.env` file to enable smart features.");
      return;
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });
    
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    });

    const result = await chat.sendMessageStream(history[history.length - 1].content);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      onChunk(chunkText);
    }
  } catch (error) {
    console.error("AI Stream Error:", error);
    onChunk("\n\n[Error: Connection interrupted.]");
  }
};
