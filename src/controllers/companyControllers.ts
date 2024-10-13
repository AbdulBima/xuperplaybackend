import { Request, Response } from "express";
import CompanyModel from "../models/org.model";
import { v4 as uuidv4 } from "uuid"; // Import uuidv4 to generate unique IDs
import TemporaryCompany from "../models/tempCompany.model";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Replace with your secret

// Create a new project
const createProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      projectName,
      telegramAuth,
      telegramAuthStatus,
      telegramAuthCallbackUrl,
      teamSize,
      projectUrl,
      telegramChatId,
      email,
    } = req.body;

    // Generate a unique buid using UUID
    const buid = uuidv4();

    // Create a new project object with the generated buid
    const newProject = new CompanyModel({
      projectName,
      buid,
      telegramAuth,
      telegramAuthStatus,
      telegramAuthCallbackUrl,
      teamSize,
      projectUrl,
      telegramChatId,
      email,
    });

    // Save the project to the database
    await newProject.save();

    return res
      .status(201)
      .json({ message: "Project created successfully", project: newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCompanyByEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    // Check if company exists by email
    const existingCompany = await CompanyModel.findOne({ email });

    if (existingCompany) {
      // Company exists, create a temporary company entry with JWT token
      const buid = existingCompany.buid; // Use existing buid
      const token = jwt.sign({ email, buid }, JWT_SECRET, { expiresIn: "1h" }); // Generate JWT token

      // Create temporary company
      const tempCompany = await TemporaryCompany.create({
        email: existingCompany.email,
        buid: existingCompany.buid,
        token, // Save the generated JWT token
      });

      return res.json({
        message: "Temporary company created.",
        token: tempCompany.token, // Return the generated token
      });
    } else {
      // Company does not exist, generate buid and JWT token
      const buid = uuidv4(); // Generate a unique buid using uuidv4
      const token = jwt.sign({ email, buid }, JWT_SECRET, { expiresIn: "1h" }); // Generate JWT token

      // Create a new temporary company
      const newTempCompany = await TemporaryCompany.create({
        email, // Use the email from request
        buid, // Generated buid
        token, // Generated JWT token
      });

      return res.json({
        message: "Company not found. Temporary company created.",
        token: newTempCompany.token, // Return the generated token
      });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyTemporaryCompanyToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { token } = req.body;

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        email: string;
        buid: string;
      };
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const { email, buid } = decoded;

    // Check if the temporary company exists
    const tempCompany = await TemporaryCompany.findOne({ email, buid });
    if (!tempCompany) {
      return res.status(404).json({ message: "Temporary company not found." });
    }

    // Check if the company exists in the CompanyModel
    const existingCompany = await CompanyModel.findOne({ buid });
    if (existingCompany) {
      // Company exists, return the existing buid
      return res.json({
        message: "Company already exists.",
        buid: existingCompany.buid,
        projectName: existingCompany.projectName,
        email: existingCompany.email,


      });
    } else {
      // Company does not exist, create a new company

      // Return the new company's buid
      return res.json({
        message: "New company created, complete registeration",
        buid: buid,
      });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a project
const updateProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProject = await CompanyModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a project
const deleteProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const deletedProject = await CompanyModel.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update Telegram authentication details
const updateTelegramAuth = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { telegramAuth, telegramAuthStatus, telegramAuthCallbackUrl } =
      req.body;

    const updatedProject = await CompanyModel.findByIdAndUpdate(
      id,
      { telegramAuth, telegramAuthStatus, telegramAuthCallbackUrl },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json({
      message: "Telegram authentication updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating Telegram auth details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Export all controllers as a single object
export default {
  createProject,
  getCompanyByEmail,
  updateProject,
  deleteProject,
  updateTelegramAuth,
  verifyTemporaryCompanyToken,
};
