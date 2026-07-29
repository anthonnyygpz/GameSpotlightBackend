import { Router } from "express";
import * as user from '../controllers/userController';
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.use(verifyToken)

router.get('/sessions', user.getSessions)
router.delete('/sessions/:sessionId', user.revokeSession)
router.put('/:id', user.updateUser)

export default router;
