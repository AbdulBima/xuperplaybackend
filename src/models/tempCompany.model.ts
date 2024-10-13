// models/TemporaryCompany.ts

import { Schema, model } from "mongoose";

const temporaryCompanySchema = new Schema(
  {
    email: {
      type: String,
      required: false,
      unique: true, // Ensure each email is unique
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

const TemporaryCompany = model("TemporaryCompany", temporaryCompanySchema);
export default TemporaryCompany;
