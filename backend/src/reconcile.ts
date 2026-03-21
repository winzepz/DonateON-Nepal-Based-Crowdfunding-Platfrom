import pool from './db';
import { verifyEsewaByUuid, verifyKhaltiPayment, logPaymentError } from './services/paymentService';
import { logger } from './utils/logger';

/**
 * Reconciliation script to find and fix "stuck" pending payments.
 * Ideal for running as a Cron Job every 30 minutes in production.
 */
async function runReconciliation() {
  logger.info('reconcile.job_start');
  
  try {
    // Find payments that have been PENDING for more than 15 minutes but less than 24 hours
    const res = await pool.query(`
      SELECT 
        pt.id as transaction_id,
        pt.gateway,
        pt.gateway_reference,
        pt.amount,
        d.id as donation_id
      FROM payment_transactions pt
      JOIN donations d ON pt.donation_id = d.id
      WHERE pt.verification_status = 'PENDING'
        AND pt.created_at < NOW() - INTERVAL '5 minutes'
        AND pt.created_at > NOW() - INTERVAL '24 hours'
      LIMIT 50
    `);

    logger.info('reconcile.stale_count', { count: res.rows.length });

    for (const record of res.rows) {
      try {
        logger.info('reconcile.processing_item', { 
          donationId: record.donation_id, 
          gateway: record.gateway 
        });

        if (record.gateway === 'ESEWA' && record.gateway_reference) {
          await verifyEsewaByUuid(record.gateway_reference, Number(record.amount), {}, 'SYSTEM_RECONCILE');
        } else if (record.gateway === 'KHALTI' && record.gateway_reference) {
          await verifyKhaltiPayment(record.gateway_reference, 'SYSTEM_RECONCILE');
        }

        logger.info('reconcile.item_success', { donationId: record.donation_id });
      } catch (err: any) {
        logPaymentError('reconcile.item_failed', { 
          donationId: record.donation_id, 
          error: err.message 
        });
      }
    }
  } catch (err: any) {
    logger.error('reconcile.fatal_error', { error: err.message });
  } finally {
    logger.info('reconcile.job_complete');
  }
}

// Check if run directly
if (require.main === module) {
  runReconciliation().then(() => process.exit(0));
}

export { runReconciliation };
