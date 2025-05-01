import express from "express";
import { body } from "express-validator";
import userController from "../controller/user";
import isAuth from "../middleware/isAuth";

const router = express.Router();

router.get("/getuser/{:username}", isAuth, userController.getUser);

router.get("/friendlist", isAuth, userController.getUserFriendList);

router.post("/addfriend/:id", isAuth, userController.postAddfriend);

router.post(
  "/createuser",
  [
    body("email")
      .isEmail()
      .withMessage("Por favor, insira um email válido.")
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("A senha deve conter no minímo 5 caracteres."),
  ],
  userController.createUser,
);

router.put(
  "/updateuser/:id",
  isAuth,
  [
    body("email")
      .isEmail()
      .withMessage("Por favor, insira um email válido.")
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("A senha deve conter no minímo 5 caracteres."),
  ],
  userController.updateUser,
);

router.delete("/deleteuser/:id", userController.deleteUser);

export default router;
