import { Router } from "express";
import * as platforms from '../controllers/platformsController';

const router = Router();

router.get("/:id", platforms.getGamesPlatform)

router.get("/", platforms.getPlatforms)

export default router;
