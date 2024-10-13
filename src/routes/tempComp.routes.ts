// routes/temporaryCompanyRoutes.ts

import { Router } from 'express';
import { createTempComp } from '../controllers/tempCompanyControllers';

const router = Router();

// Route to create a temporary company
router.post('/create-temporary-company', createTempComp);

export default router;
