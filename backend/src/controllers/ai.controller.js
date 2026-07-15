import AIConversation from '../models/AIConversation.js';
import AIMessage from '../models/AIMessage.js';
import AISummary from '../models/AISummary.js';
import AISettings from '../models/AISettings.js';
import { generateResponse, generateStreamResponse } from '../services/ai.service.js';
import { buildUserContext } from '../services/context.service.js';

export const getConversations = async (req, res) => {
  try {
    const conversations = await AIConversation.find({ owner: req.user._id }).sort({ updatedAt: -1 });
    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createConversation = async (req, res) => {
  try {
    const convo = new AIConversation({
      title: req.body.title || 'New Chat',
      owner: req.user._id,
      relationship: req.user.relationship
    });
    await convo.save();
    res.status(201).json({ conversation: convo });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await AIMessage.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const convo = await AIConversation.findById(req.params.id);
    if (!convo || convo.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await AIMessage.deleteMany({ conversationId: convo._id });
    await convo.deleteOne();
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Main SSE Stream Endpoint
export const chatStream = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    
    // Save User Message
    const userMsg = new AIMessage({
      conversationId,
      role: 'user',
      content,
      owner: req.user._id
    });
    await userMsg.save();

    // Fetch conversation history
    const history = await AIMessage.find({ conversationId }).sort({ createdAt: 1 });

    // Build Context
    const systemInstruction = await buildUserContext(req.user._id, req.user.relationship);

    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullAssistantResponse = "";

    await generateStreamResponse(history, systemInstruction, (chunkText) => {
      fullAssistantResponse += chunkText;
      // Send SSE chunk
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    });

    // Save Assistant Message
    const assistantMsg = new AIMessage({
      conversationId,
      role: 'assistant',
      content: fullAssistantResponse,
      owner: req.user._id
    });
    await assistantMsg.save();

    // End stream
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error('Chat Stream Error:', error);
    res.write(`data: [ERROR]\n\n`);
    res.end();
  }
};

// Generate a daily summary
export const generateSummary = async (req, res) => {
  try {
    const { type } = req.body; // 'morning' or 'night'
    const today = new Date().toISOString().split('T')[0];

    // Check if already generated today
    let summary = await AISummary.findOne({ owner: req.user._id, type, date: today });
    if (summary) {
      return res.json({ summary });
    }

    const systemInstruction = await buildUserContext(req.user._id, req.user.relationship);
    const prompt = type === 'morning' 
      ? "Generate a quick, encouraging morning summary and preview of today's goals. Keep it under 4 sentences. Make it sweet for a couple."
      : "Generate a quick night-time reflection on today's completed tasks and habits. Keep it under 4 sentences. Include a sweet prompt for tomorrow.";

    const content = await generateResponse(prompt, systemInstruction);

    summary = new AISummary({
      date: today,
      type,
      content,
      owner: req.user._id,
      relationship: req.user.relationship
    });
    await summary.save();

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
