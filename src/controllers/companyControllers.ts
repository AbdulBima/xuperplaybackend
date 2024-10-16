import { Request, Response } from "express";
import CompanyModel from "../models/org.model";
import { v4 as uuidv4 } from "uuid"; // Import uuidv4 to generate unique IDs
import jwt from "jsonwebtoken";
import TempComp from "../models/tempcomp.model";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Replace with your secret
const generateAlphanumericCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

 

// Create a new project
const createProject = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        projectName,
        firstName,
        lastName,
        email,
        buid,
        teamSize,
        projectUrl,
        telegramChatId
      } = req.body;
  
      const newProjectData = {
        projectName,
        firstName,
        lastName,
        buid,
        email,
        telegramChatId: telegramChatId || "",
        telegramAuth: "",
        telegramAuthStatus: false,
        telegramAuthCallbackUrl: "",
        teamSize: teamSize || 1,
        projectUrl: projectUrl || "",
      };
  
      const newProject = new CompanyModel(newProjectData);
  
      await newProject.save();
  
      return res.status(201).json({
        message: "Project created successfully",
        buid,
        email,
        projectName,
        telegramChatId
      });
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
      const tempCompany = await TempComp.create({
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
      const newTempCompany = await TempComp.create({
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
    const tempCompany = await TempComp.findOne({ email, buid });
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
      const { buid } = req.body;  // Receive 'buid' from request body
      const { telegramAuthCallbackUrl } = req.body;
    
      // Validate the required fields
      if (!buid || !telegramAuthCallbackUrl) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      // Generate 6 alphanumeric code for the URL
      const alphanumericCode = generateAlphanumericCode();
  
      // Construct the full telegram auth URL
      const xuperTelegramAuthUrl = `https://xuperplay.pages.dev/customer/telegram_auth/${buid}`;
      
      // Find the project using 'buid' and update it
      const updatedProject = await CompanyModel.findOneAndUpdate(
        { buid }, // Search by 'buid' instead of '_id'
        {
          telegramAuthStatus: true, 
          telegramAuthCallbackUrl, 
          telegramCode: alphanumericCode
        },
        { new: true } // Return the updated document
      );
    
      if (!updatedProject) {
        return res.status(404).json({ message: "Project with the given buid not found"  });
      }
    
      return res.json({
        message: "Telegram authentication updated successfully",
        auth_url: xuperTelegramAuthUrl
      });
    } catch (error) {
      console.error("Error updating Telegram auth details:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  
  
const resgiterWithTelegram = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { chat_id } = req.body;
  
      // Check if a company with the given Telegram chat_id exists
      let existingCompany = await CompanyModel.findOne({
        telegramChatId: chat_id,
      });
  
      let buid: string;
      let otp: string;
      let token: string;
  
      if (existingCompany) {
        // If company exists, use its buid
        buid = existingCompany.buid;
  
        // Generate a JWT token for the temporary user
        token = jwt.sign(
          { telegramChatId: existingCompany.telegramChatId, buid: existingCompany.buid },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
  
        // Generate a 6-character OTP
        otp = generateAlphanumericCode();
  
        // Create a temporary user with the company's buid and OTP
        const tempUser = await TempComp.create({
          buid: existingCompany.buid,
          telegramChatId: existingCompany.telegramChatId,
          OTP: otp,
          token,
        });
  
        return res.status(200).json({
          message: "Company found. Temporary user created.",
          otp, // Return the generated OTP
        });
      }
  
      // If no company is found, generate a new buid and create a temporary user
      buid = uuidv4(); // Generate a unique buid
  
      // Generate a JWT token for the temporary user
      token = jwt.sign({ buid, telegramChatId: chat_id }, JWT_SECRET, { expiresIn: "1h" });
  
      // Generate a 6-character OTP
      otp = generateAlphanumericCode();
  
      // Create a temporary user with the generated buid and OTP
      const newTempUser = await TempComp.create({
        buid, // Generated new buid
        telegramChatId: chat_id,
        OTP: otp,
        token,
      });
  
      return res.status(200).json({
        message: "No company found. New temporary user created.",
        otp, // Return the generated OTP
      });
    } catch (error) {
      console.error("Error saving chat ID:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const verifyAndRetrieveCompany = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { otp } = req.body; // The OTP sent by the client
  
      if (!otp) {
        return res.status(400).json({ message: "OTP is required" });
      }
  
      // 1. Find the temporary user using the provided OTP
      const tempUser = await TempComp.findOne({ OTP: otp });
  
      if (!tempUser) {
        return res.status(404).json({ message: "Invalid OTP" });
      }
  
      // 2. Retrieve the JWT token from the temporary user
      const { token } = tempUser;
  
      // 3. Verify the JWT token
      let decodedToken: any;
      try {
        decodedToken = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      const { buid, telegramChatId } = decodedToken;
  
      // 4. Check if the company exists in the CompanyModel using telegramChatId
      const existingCompany = await CompanyModel.findOne({ telegramChatId, buid });
  
      if (existingCompany) {
        // If the company exists, return the existing buid and project name
        return res.status(200).json({
          message: "Company found",
          buid: existingCompany.buid, // Return the existing buid
          projectName: existingCompany.projectName, // Return the project name from the existing company
        });
      }
  
      // 5. If no company exists, return the temporary user's buid
      return res.status(200).json({
        message: "No company found. Returning temporary user buid.",
        buid, // Return the buid from the temporary user
        telegramChatId,
      });
    } catch (error) {
      console.error("Error in verifying OTP and checking company:", error);
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
  resgiterWithTelegram,
  verifyAndRetrieveCompany
};
