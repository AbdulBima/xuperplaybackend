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
  telegramAuth: { type: String, required: false },
  telegramAuthStatus: { type: Boolean, required: false },
  telegramAuthCallbackUrl: { type: String, required: false },
  teamSize: { type: Number, required: false },
  projectUrl: { type: String, required: true },
  telegramChatId: { type: String, required: false },
  email: { type: String, required: true }
}, { timestamps: true });

const CompanyModel = mongoose.model<ICompany>("Project", companySchema);

export default CompanyModel;
