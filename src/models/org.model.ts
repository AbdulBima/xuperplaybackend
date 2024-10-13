import mongoose, { Document, Schema } from "mongoose";

interface ICompany extends Document {
  projectName: string;
  firstName: string;
  lastName: string;
  buid: string;
  telegramAuth: string;
  telegramAuthStatus: boolean;
  telegramAuthCallbackUrl: string;
  teamSize: number;
  projectUrl: string;
  telegramChatId: string;
  email: string;
}

const companySchema = new Schema<ICompany>(
  {
    projectName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    buid: { type: String, required: true },
    telegramAuth: { type: String, default: "" }, // Default to empty string
    telegramAuthStatus: { type: Boolean, default: false }, // Default to false
    telegramAuthCallbackUrl: { type: String, default: "" }, // Default to empty string
    teamSize: { type: Number, default: 1 }, // Default to 1
    projectUrl: { type: String, required: false },
    telegramChatId: { type: String, default: "" }, // Default to empty string
    email: { type: String, required: true },
  },
  { timestamps: true }
);

const CompanyModel = mongoose.model<ICompany>("Project", companySchema);

export default CompanyModel;
