// routes/temporaryCompanyRoutes.ts

import { Router } from 'express';
import { createTemporaryCompany } from '../controllers/tempCompanyControllers';

const router = Router();

// Route to create a temporary company
router.post('/create-temporary-company', createTemporaryCompany);

export default router;
