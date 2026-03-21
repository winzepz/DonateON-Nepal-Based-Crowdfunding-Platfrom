import dotenv from "dotenv";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import { QueryResult } from "pg";

dotenv.config();

type AuthPayload = { id: string; role: "DONOR" | "CAMPAIGN_CREATOR" | "ADMIN" };

interface DbUser {
  id: string;
  email: string;
  name: string | null;
  role: "DONOR" | "CAMPAIGN_CREATOR" | "ADMIN";
  password_hash?: string;
  kyc_status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

// Generate JWT token
const generateToken = (payload: AuthPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// Centralized error handler
const handleError = (err: unknown, res: Response, action: string) => {
  console.error(`[${action} ERROR]`, err);
  res.status(500).json({
    message: "Internal server error",
    details: process.env.NODE_ENV === "development" ? (err instanceof Error ? err.message : String(err)) : undefined,
  });
};

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required" });
    }

    if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid data types" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser: QueryResult<any> = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if ((existingUser.rowCount ?? 0) > 0) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Default role 'DONOR' if not provided or invalid
    const validRoles = ["DONOR", "CAMPAIGN_CREATOR", "ADMIN"];
    const userRole = validRoles.includes(role) ? role : "DONOR";

    const createdUser: QueryResult<DbUser> = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, kyc_status AS "kycStatus"`,
      [normalizedEmail, hashedPassword, name.trim(), userRole]
    );

    const user = createdUser.rows[0];
    const token = generateToken({ id: user.id, role: user.role });

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        kycStatus: user.kyc_status || 'UNVERIFIED'
      },
    });
  } catch (err) {
    handleError(err, res, "REGISTER");
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userResult: QueryResult<DbUser> = await pool.query(
      `SELECT id, email, name, role, password_hash, kyc_status AS "kycStatus"
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    const user = userResult.rows[0];

    if (!user || !user.password_hash) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken({ id: user.id, role: user.role });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        kycStatus: (user as any).kycStatus || 'UNVERIFIED'
      },
    });
  } catch (err) {
    handleError(err, res, "LOGIN");
  }
};

// GET USER DONATIONS
export const getMyDonations = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const donations = await pool.query(
      `SELECT d.id, d.amount, d.created_at as "createdAt", d.is_anonymous as "isAnonymous",
              c.title as "campaignTitle", c.id as "campaignId"
       FROM donations d
       JOIN campaigns c ON d.campaign_id = c.id
       WHERE d.user_id = $1
         AND d.payment_status = 'SUCCEEDED'
       ORDER BY d.created_at DESC`,
      [userId]
    );

    res.json(donations.rows);
  } catch (error) {
    handleError(error, res, "GET_USER_DONATIONS");
  }
};

// GET USER PROFILE
export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userResult: QueryResult<DbUser> = await pool.query(
      `SELECT id, email, name, role, kyc_status AS "kycStatus"
       FROM users
       WHERE id = $1`,
      [userId]
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    handleError(error, res, "GET_PROFILE");
  }
};
