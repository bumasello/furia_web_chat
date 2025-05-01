import { Router } from "express";
import chatController from "../controller/chat";
import isAuth from "../middleware/isAuth";

const router = Router();

router.post("/createchat/{:id}", isAuth, chatController.createChat);
router.get("/getchat/{:name}", isAuth, chatController.getChat);
router.get("/getuserchat/{:id}", isAuth, chatController.getUserChat);
router.post("/joinchat/{:id}", isAuth, chatController.joinChat);
router.delete("/deletechat/{:id}", isAuth, chatController.deleteChat);

export default router;
