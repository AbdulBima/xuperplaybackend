import express from 'express';
import controllers from '../controllers/companyControllers';

const router = express.Router();

// Routes for managing projects
router.post('/create-company', controllers.createProject); 
router.post('/retrive/company', controllers.getCompanyByEmail); 
router.put('/update', controllers.updateProject);
router.delete('/del', controllers.deleteProject); 
router.post('/auth/verify-token', controllers.verifyTemporaryCompanyToken); 

router.put('/telegram-auth', controllers.updateTelegramAuth); 

export default router;
