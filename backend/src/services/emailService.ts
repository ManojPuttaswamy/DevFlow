import nodemailer from 'nodemailer';


class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
        });
    }

    async sendNotificationEmail(to: string, title: string, message: string) {
        try {
            if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
                console.log('Email service not configured');
                return;
            }

            const mailOptions = {
                from: `"DevFlow" <${process.env.SMTP_USER}>`,
                to: to,
                subject: title,
                html: this.getNotificationEmailTemplate(title, message)
            }
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Notification Email sent:', result);
            return result;
        }
        catch (error) {
            console.error('Error sending notification email', error);
            throw error;
        }
    }

    async sendWelcomeEmail(to: string, name: string) {
        try {
            if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
                console.log('Email service not configured');
                return;
            }

            const mailOptions = {
                from: `"DevFlow" <${process.env.SMTP_USER}>`,
                to: to,
                subject: "Welcome to Devflow!",
                html: this.getWelcomeEmailTemplate(name)
            }

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Welcome email sent: ', result);
            return result;
        }
        catch (error) {
            console.error('Error sending welcome email: ', error);
            throw error;
        }
    }

    private getNotificationEmailTemplate(title: string, message: string) : string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .footer { padding: 20px; text-align: center; color: #666; }
                .button { 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background: #3B82F6; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>DevFlow</h1>
                </div>
                <div class="content">
                    <h2>${title}</h2>
                    <p>${message}</p>
                    <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
                        View on DevFlow
                    </a>
                </div>
                <div class="footer">
                    <p>This is an automated notification from DevFlow.</p>
                    <p>
                        <a href="${process.env.FRONTEND_URL}/settings/notifications">
                            Manage notification preferences
                        </a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    private getWelcomeEmailTemplate(name: string) : string{
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Welcome to DevFlow!</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .footer { padding: 20px; text-align: center; color: #666; }
                .button { 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background: #3B82F6; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }
                .feature { 
                    padding: 15px; 
                    margin: 10px 0; 
                    background: white; 
                    border-radius: 5px; 
                    border-left: 4px solid #3B82F6;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to DevFlow! </h1>
                </div>
                <div class="content">
                    <h2>Hello ${name}!</h2>
                    <p>Welcome to DevFlow - the platform where developers showcase their projects, receive peer code reviews, and discover career opportunities!</p>
                    
                    <div class="feature">
                        <h3> Showcase Your Projects</h3>
                        <p>Upload your projects with demos, code snippets, and detailed descriptions.</p>
                    </div>
                    
                    <div class="feature">
                        <h3> Get Peer Reviews</h3>
                        <p>Receive constructive feedback from fellow developers to improve your code.</p>
                    </div>
                    
                    <div class="feature">
                        <h3> Discover Opportunities</h3>
                        <p>Connect with potential employers and find your next career opportunity.</p>
                    </div>
                    
                    <a href="${process.env.FRONTEND_URL}/profile/new" class="button">
                        Create Your First Project
                    </a>
                </div>
                <div class="footer">
                    <p>Ready to get started? Log in to your DevFlow account and begin your journey!</p>
                    <p>
                        <a href="${process.env.FRONTEND_URL}">Visit DevFlow</a> | 
                        <a href="${process.env.FRONTEND_URL}/settings/notifications">
                            Notification Settings
                        </a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

export const emailService = new EmailService();
export default EmailService;