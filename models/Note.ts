import mongoose, { Schema } from "mongoose";

const NoteSchema = new Schema(
  {
    title:      { type: String,   default: "Untitled" },
    content:    { type: String,   default: "" },
    isFavorite: { type: Boolean,  default: false },
    isTrashed:  { type: Boolean,  default: false },
    isPinned:   { type: Boolean,  default: false },
    tags:       { type: [String], default: [] },
    emoji:      { type: String,   default: "📄" },
    color:      { type: String,   default: "" },
    userId:     { type: String,   default: "local" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(_doc: any, ret: any) {
        ret.id = ret._id?.toString();
        if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.toISOString();
        if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.toISOString();
        ret._id = undefined;
        ret.__v = undefined;
        return ret;
      }
    }
  }
);

export default mongoose.models["Note"] || mongoose.model("Note", NoteSchema);