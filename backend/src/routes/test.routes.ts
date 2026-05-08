import { Router } from 'express';
import * as testController from '../controllers/test.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { submitTestSchema } from '../schemas/test.schema';

const router = Router();

router.get('/', testController.getAllTests);
router.get('/:id', testController.getTestById);
router.post('/:id/submit', validateRequest(submitTestSchema), testController.submitTest);

export default router;
