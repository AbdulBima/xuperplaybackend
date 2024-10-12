import express from 'express';
import controllers from '../controllers/companyControllers';

const router = express.Router();

// Routes for managing projects
router.post('/create-company', controllers.createProject); // Create a project
router.get('/retrive/company', controllers.getProjectById); // Get project by ID
router.put('/update', controllers.updateProject); // Update project
router.delete('/del', controllers.deleteProject); // Delete project

// Route for updating Telegram auth details
router.put('/telegram-auth', controllers.updateTelegramAuth); // Update Telegram auth

export default router;
