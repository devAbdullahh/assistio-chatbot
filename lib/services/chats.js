import { Chat } from '@/lib/db/models/Chat.js';
import { deleteChromaDocumentsByChat } from '@/lib/services/chroma/index.js';

export async function listChats(userId) {
  return Chat.find({ userId })
    .sort({ updatedAt: -1 })
    .select('title updatedAt createdAt messages')
    .lean()
    .then((chats) =>
      chats.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
        preview: c.messages?.at(-1)?.content?.slice(0, 80) || '',
      }))
    );
}

export async function createChat(userId, title = 'New chat') {
  const chat = await Chat.create({ userId, title, messages: [] });
  return {
    id: chat._id.toString(),
    title: chat.title,
    messages: [],
  };
}

export async function getChatForUser(userId, chatId) {
  const chat = await Chat.findOne({ _id: chatId, userId }).lean();
  if (!chat) return null;

  return {
    id: chat._id.toString(),
    title: chat.title,
    messages: chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
      sources: m.sources || [],
      createdAt: m.createdAt,
    })),
    updatedAt: chat.updatedAt,
  };
}

export async function deleteChatForUser(userId, chatId) {
  const result = await Chat.deleteOne({ _id: chatId, userId });
  if (result.deletedCount === 0) return false;

  await deleteChromaDocumentsByChat(userId, chatId);
  return true;
}

export async function appendChatMessages(userId, chatId, newMessages, titleHint) {
  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat) return null;

  chat.messages.push(...newMessages);

  if (titleHint && chat.title === 'New chat') {
    chat.title = titleHint.slice(0, 60);
  }

  await chat.save();

  return getChatForUser(userId, chatId);
}

export function getHistoryForRag(messages) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-6)
    .map(({ role, content }) => ({ role, content }));
}
