// models/TemporaryCompany.ts

import { Schema, model } from "mongoose";

const tempCompSchema = new Schema(
  {
    email: {
      type: String,
      required: false,
    },
    buid: {
      type: String,
      required: true,
    },

    OTP: {
      type: String,
      required: true,
    },

    
    token: {
      type: String,
      required: true,
    },

    telegramChatId: { type: String, default: "" }, // Default to empty string
  },
  { timestamps: true }
);

const TempComp = model("TempCompany", tempCompSchema);
export default TempComp;
