import { Router } from "express";
import { login, register, getProfile } from "../controllers/authController";
import { getMyDonations as getMyDonationHistory } from "../controllers/donationController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getProfile);
router.get("/me/donations", authenticateToken, getMyDonationHistory);

export default router;
