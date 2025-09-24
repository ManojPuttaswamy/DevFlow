
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

interface BackupResult {
    success: boolean;
    filename?: string;
    size?: number;
    duration?: number;
    error?: string;
}

export class BackupService {
    private backupDir = '/app/backups';

    constructor() {
        this.ensureBackupDirectory();
    }

    private async ensureBackupDirectory() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
        } catch (error) {
            logger.error('Failed to create backup directory', error);
        }
    }

    async createDatabaseBackup(): Promise<BackupResult> {
        const startTime = Date.now();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_${timestamp}.sql`;
        const filepath = path.join(this.backupDir, filename);

        try {
            logger.info('Starting database backup', { filename });

            // PostgreSQL backup command
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl) {
                throw new Error('DATABASE_URL not configured');
            }

            // Extract connection details from DATABASE_URL
            const url = new URL(dbUrl);
            const command = `pg_dump -h ${url.hostname} -p ${url.port} -U ${url.username} -d ${url.pathname.slice(1)} > ${filepath}`;

            // Set password via environment variable to avoid interactive prompt
            const env = {
                ...process.env,
                PGPASSWORD: url.password
            };

            await execAsync(command, { env });

            // Check if backup file was created and get its size
            const stats = await fs.stat(filepath);
            const duration = Date.now() - startTime;

            logger.info('Database backup completed', {
                filename,
                size: `${Math.round(stats.size / 1024)}KB`,
                duration: `${duration}ms`
            });

            return {
                success: true,
                filename,
                size: stats.size,
                duration
            };

        } catch (error) {
            const duration = Date.now() - startTime;
            logger.error('Database backup failed', error, { filename, duration: `${duration}ms` });

            // Clean up failed backup file
            try {
                await fs.unlink(filepath);
            } catch (unlinkError) {
                logger.error('Failed to clean up backup file', unlinkError);
            }

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown backup error',
                duration
            };
        }
    }

    async listBackups(): Promise<Array<{ filename: string, size: number, created: Date }>> {
        try {
            const files = await fs.readdir(this.backupDir);
            const backupFiles = files.filter(file => file.startsWith('backup_') && file.endsWith('.sql'));

            const backups = await Promise.all(
                backupFiles.map(async (filename) => {
                    const filepath = path.join(this.backupDir, filename);
                    const stats = await fs.stat(filepath);
                    return {
                        filename,
                        size: stats.size,
                        created: stats.birthtime
                    };
                })
            );

            return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
        } catch (error) {
            logger.error('Failed to list backups', error);
            return [];
        }
    }

    async deleteOldBackups(keepCount: number = 7): Promise<number> {
        try {
            const backups = await this.listBackups();
            const toDelete = backups.slice(keepCount);

            let deletedCount = 0;
            for (const backup of toDelete) {
                try {
                    const filepath = path.join(this.backupDir, backup.filename);
                    await fs.unlink(filepath);
                    deletedCount++;
                    logger.info('Deleted old backup', { filename: backup.filename });
                } catch (error) {
                    logger.error('Failed to delete backup', error, { filename: backup.filename });
                }
            }

            if (deletedCount > 0) {
                logger.info('Cleanup completed', { deletedCount, remainingCount: keepCount });
            }

            return deletedCount;
        } catch (error) {
            logger.error('Failed to cleanup old backups', error);
            return 0;
        }
    }

    async getBackupStats(): Promise<{
        totalBackups: number;
        totalSize: number;
        latestBackup?: Date;
        oldestBackup?: Date;
    }> {
        try {
            const backups = await this.listBackups();

            return {
                totalBackups: backups.length,
                totalSize: backups.reduce((total, backup) => total + backup.size, 0),
                latestBackup: backups[0]?.created,
                oldestBackup: backups[backups.length - 1]?.created
            };
        } catch (error) {
            logger.error('Failed to get backup stats', error);
            return { totalBackups: 0, totalSize: 0 };
        }
    }
}