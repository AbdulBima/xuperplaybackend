import mongoose, { Document, Schema } from "mongoose";

interface ICompany extends Document {
  projectName: string;
  buid: string;
  telegramAuth: string;
  telegramAuthStatus: boolean;
  telegramAuthCallbackUrl: string;
  teamSize: number;
  projectUrl: string;
  telegramChatId: string;
  email: string;
}

const companySchema = new Schema<ICompany>({
  projectName: { type: String, required: true },
  buid: { type: String, required: true },
  telegramAuth: { type: String, required: true },
  telegramAuthStatus: { type: Boolean, required: true },
  telegramAuthCallbackUrl: { type: String, required: true },
  teamSize: { type: Number, required: true },
  projectUrl: { type: String, required: true },
  telegramChatId: { type: String, required: true },
  email: { type: String, required: true }
}, { timestamps: true });

const CompanyModel = mongoose.model<ICompany>("Project", companySchema);

export default CompanyModel;
