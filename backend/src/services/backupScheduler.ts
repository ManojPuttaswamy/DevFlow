import { BackupService } from './backupService';
import { logger } from '../utils/logger';

export class BackupScheduler {
  private backupService: BackupService;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.backupService = new BackupService();
  }

  start() {
    // Run backup every 24 hours (86400000 ms)
    const intervalMs = 24 * 60 * 60 * 1000; // 24 hours
    
    logger.info('Starting backup scheduler', { 
      interval: '24 hours',
      nextBackup: new Date(Date.now() + intervalMs).toISOString()
    });

    this.intervalId = setInterval(async () => {
      await this.performScheduledBackup();
    }, intervalMs);

    setTimeout(() => {
      this.performScheduledBackup();
    }, 30000); // Wait 30 seconds after startup
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Backup scheduler stopped');
    }
  }

  private async performScheduledBackup() {
    try {
      logger.info('Performing scheduled backup');
      
      const result = await this.backupService.createDatabaseBackup();
      
      if (result.success) {
        logger.info('Scheduled backup completed successfully', {
          filename: result.filename,
          size: result.size,
          duration: result.duration
        });
        
        // Clean up old backups (keep last 7)
        await this.backupService.deleteOldBackups(7);
        
      } else {
        logger.error('Scheduled backup failed', null, { error: result.error });
      }
    } catch (error) {
      logger.error('Scheduled backup process failed', error);
    }
  }
}