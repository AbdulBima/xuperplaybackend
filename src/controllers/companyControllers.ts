import { Request, Response } from 'express';
import CompanyModel from '../models/org.model';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 to generate unique IDs

// Create a new project
const createProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { projectName, telegramAuth, telegramAuthStatus, telegramAuthCallbackUrl, teamSize, projectUrl, telegramChatId, email } = req.body;
    
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
      email 
    });
    
    // Save the project to the database
    await newProject.save();

    return res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a project by its ID
const getProjectById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const project = await CompanyModel.findById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    return res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a project
const updateProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedProject = await CompanyModel.findByIdAndUpdate(id, updates, { new: true });
    
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    return res.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a project
const deleteProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const deletedProject = await CompanyModel.findByIdAndDelete(id);
    
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    return res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Telegram authentication details
const updateTelegramAuth = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { telegramAuth, telegramAuthStatus, telegramAuthCallbackUrl } = req.body;
    
    const updatedProject = await CompanyModel.findByIdAndUpdate(
      id,
      { telegramAuth, telegramAuthStatus, telegramAuthCallbackUrl },
      { new: true }
    );
    
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    return res.json({ message: 'Telegram authentication updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Error updating Telegram auth details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Export all controllers as a single object
export default {
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  updateTelegramAuth
};
