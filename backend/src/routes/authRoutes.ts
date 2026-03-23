import { Router } from "express";
import { login, register, getProfile, updateProfileImage, googleLogin } from "../controllers/authController";
import { getMyDonations as getMyDonationHistory } from "../controllers/donationController";
import { authenticateToken } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.get("/me", authenticateToken, getProfile);
router.get("/me/donations", authenticateToken, getMyDonationHistory);
router.post("/me/profile-image", authenticateToken, upload.single('image'), updateProfileImage);

export default router;
