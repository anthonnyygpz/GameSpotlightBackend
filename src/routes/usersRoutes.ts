import { Router } from "express";
import * as user from '../controllers/userController';
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.use(verifyToken)

router.put('/:id', user.updateUser)

export default router;
