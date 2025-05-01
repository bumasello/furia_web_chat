import { Router } from "express";
import messageController from "../controller/message";
import isAuth from "../middleware/isAuth";

const router = Router();

router.post("/createmessage/{:id}", isAuth, messageController.createMessage);
router.get("/getchatmessage/{:id}", isAuth, messageController.getChatMessage);

export default router;
