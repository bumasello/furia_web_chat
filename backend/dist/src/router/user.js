"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const user_1 = __importDefault(require("../controller/user"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const router = express_1.default.Router();
router.get("/getuser/{:username}", isAuth_1.default, user_1.default.getUser);
router.get("/friendlist", isAuth_1.default, user_1.default.getUserFriendList);
router.post("/addfriend/:id", isAuth_1.default, user_1.default.postAddfriend);
router.post("/createuser", [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Por favor, insira um email válido.")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 5 })
        .withMessage("A senha deve conter no minímo 5 caracteres."),
], user_1.default.createUser);
router.put("/updateuser/:id", isAuth_1.default, [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Por favor, insira um email válido.")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 5 })
        .withMessage("A senha deve conter no minímo 5 caracteres."),
], user_1.default.updateUser);
router.delete("/deleteuser/:id", user_1.default.deleteUser);
exports.default = router;
