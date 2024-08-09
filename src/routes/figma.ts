import express from "express";
import {
  oauth2Callback,
  authenticate,
  getFile,
  getFileComments,
} from "../controller/figma";
import { authHandler } from "../middleware/auth";

const router = express.Router();

router.use(authHandler);

router.get("/oauth2/callback", oauth2Callback);
router.get("/authenticate", authenticate);
router.get("/file", getFile);
router.get("/file-comments", getFileComments);

export default router;
