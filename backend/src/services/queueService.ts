import { Queue, Worker, Job } from 'bullmq';
import Redis, { RedisOptions } from 'ioredis';
import { logger } from '../utils/logger';

const redisOptions: RedisOptions = { maxRetriesPerRequest: null };
const connection = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, redisOptions) : undefined;

/**
 * QueueService handles background job processing.
 * Uses BullMQ (Redis) to ensure reliability and retries.
 */
class QueueService {
    public paymentQueue: Queue | null = null;
    public notificationQueue: Queue | null = null;

    constructor() {
        if (connection) {
            this.paymentQueue = new Queue('paymentVerification', { connection: connection as any });
            this.notificationQueue = new Queue('notifications', { connection: connection as any });
            logger.info('queue.bullmq_initialized');
            this.setupWorkers();
        } else {
            logger.info('queue.memory_mode_active');
        }
    }

    private setupWorkers() {
        if (!connection) return;

        const paymentWorker = new Worker('paymentVerification', async (job: Job) => {
            logger.info('worker.payment_verification.executing', { jobId: job.id, data: job.data });
            
            if (job.name === 'reconcile_all') {
                const { runReconciliation } = await import('../reconcile');
                await runReconciliation();
            }
        }, { connection: connection as any });

        const notificationWorker = new Worker('notifications', async (job: Job) => {
            logger.info('worker.notification.executing', { jobId: job.id, data: job.data });
            // Send email/SMS logic
        }, { connection: connection as any });

        paymentWorker.on('failed', (job, err) => {
            logger.error('worker.payment_verification.failed', { jobId: job?.id, error: err.message });
        });
    }

    /**
     * Enqueue a background verification for a pending payment
     */
    async enqueueVerification(donationId: string, delayMs: number = 60000) {
        logger.info('queue.enqueue_verification', { donationId, delayMs });

        if (this.paymentQueue) {
            await this.paymentQueue.add('verify', { donationId }, {
                delay: delayMs,
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 }
            });
        } else {
            setTimeout(() => {
                logger.info('queue.worker_simulated.executing', { donationId });
            }, delayMs);
        }
    }

    /**
     * Enqueue a notification job (Email/SMS)
     */
    async enqueueNotification(type: 'DONATION_SUCCESS' | 'CAMPAIGN_GOAL', data: any) {
        logger.info('queue.enqueue_notification', { type });
        if (this.notificationQueue) {
            await this.notificationQueue.add('send', { type, data }, { attempts: 3 });
        }
    }

    /**
     * Enqueue a reconciliation job for stagnant pending records
     */
    async enqueueReconciliation() {
        logger.info('queue.enqueue_reconciliation');
        if (this.paymentQueue) {
            await this.paymentQueue.add('reconcile_all', {}, { removeOnComplete: true });
        }
    }
}

export const queueService = new QueueService();
