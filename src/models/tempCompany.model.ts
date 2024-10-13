import { Schema, model } from "mongoose";

const temporaryCompanySchema = new Schema(
  {
    email: {
      type: String,
      required: false,
    },
    buid: {
      type: String,
      required: true,
      unique: true, // Ensure each buid is unique
    },
    token: {
      type: String,
      required: true,
    },
    telegramChatId: { type: String, required: false }, // Default to empty string
  },
  { timestamps: true }
);

// Create a sparse, unique index for the 'email' field
temporaryCompanySchema.index({ email: 1 }, { unique: true, sparse: true });

const TemporaryCompany = model("TemporaryCompany", temporaryCompanySchema);
export default TemporaryCompany;
