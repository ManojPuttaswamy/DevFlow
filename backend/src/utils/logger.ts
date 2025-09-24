import { Response, Request } from 'express';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    meta?: Record<string, any>;
}


class Logger {
    private formatLog(level: LogLevel, message: string, meta?: Record<string, any>): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...(meta && { meta })
        };
    }

    info(message: string, meta?: Record<string, any>) {
        const log = this.formatLog('info', message, meta);
        console.log(JSON.stringify(log));
    }

    warn(message: string, meta?: Record<string, any>) {
        const log = this.formatLog('warn', message, meta);
        console.warn(JSON.stringify(log));
    }

    error(message: string, error?: Error | any, meta?: Record<string, any>) {
        const log = this.formatLog('error', message, {
            ...meta,
            error: error?.message,
            stack: error?.stack
        });
        console.error(JSON.stringify(log));
    }

    debug(message: string, meta?: Record<string, any>) {
        if (process.env.NODE_ENV === 'development') {
            const log = this.formatLog('debug', message, meta);
            console.debug(JSON.stringify(log));
        }
    }


    logRequest(req: Request, res: Response, duration: number) {
        this.info('HTTP Request', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    }
}

export const logger = new Logger();