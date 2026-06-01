import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    chromaDocumentId: { type: String, required: true },
    source: { type: String, required: true },
    chunkCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

documentSchema.index({ userId: 1, chatId: 1, chromaDocumentId: 1 }, { unique: true });
documentSchema.index({ userId: 1, chatId: 1 });

export const Document =
  mongoose.models.Document || mongoose.model('Document', documentSchema);
