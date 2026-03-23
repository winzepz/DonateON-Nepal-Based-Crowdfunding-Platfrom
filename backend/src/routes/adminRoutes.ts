import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import {
    getPendingKYC,
    approveKYC,
    rejectKYC,
    getPendingCampaigns,
    approveCampaign,
    rejectCampaign,
    getAuditLogs,
    exportAuditLogs,
    getAdminDonations,
    exportDonationsCSV,
    getAdminStats,
    getKYCDetails,
    getCampaignDetails,
} from '../controllers/adminController';
import {
    getAllSupportTickets,
    getSupportTicketDetails,
    updateTicketStatus,
    adminReplyToTicket
} from '../controllers/adminSupportController';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken, authorizeRole(['ADMIN']));

// Stats
router.get('/stats', getAdminStats);

// Audit Logs
router.get('/audit-logs', getAuditLogs);
router.get('/audit-logs/export', exportAuditLogs);

// KYC Routes
router.get('/kyc', getPendingKYC);
router.get('/kyc/:id', getKYCDetails);
router.post('/kyc/:id/approve', approveKYC);
router.post('/kyc/:id/reject', rejectKYC);

// Campaign Routes
router.get('/campaigns', getPendingCampaigns);
router.get('/campaigns/:id', getCampaignDetails);
router.post('/campaigns/:id/approve', approveCampaign);
router.post('/campaigns/:id/reject', rejectCampaign);

// Donations Routes
router.get('/donations', getAdminDonations);
router.get('/donations/export', exportDonationsCSV);

// Support Routes
router.get('/support', getAllSupportTickets);
router.get('/support/:id', getSupportTicketDetails);
router.put('/support/:id', updateTicketStatus); // Backward-compatible alias
router.put('/support/:id/status', updateTicketStatus);
router.post('/support/:id/reply', adminReplyToTicket);

export default router;
