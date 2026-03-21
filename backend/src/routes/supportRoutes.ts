import express from 'express';
import { createTicket, getMyTickets, getTicketDetails, replyToTicket } from '../controllers/supportController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken); // All endpoints require login

router.post('/', createTicket);
router.get('/', getMyTickets);
router.get('/:id', getTicketDetails);
router.post('/:id/reply', replyToTicket);

export default router;
