import mongoose, { Schema, model, models } from "mongoose"

const ChatSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true })

const Chat = models.Chat || model("Chat", ChatSchema)
export default Chat