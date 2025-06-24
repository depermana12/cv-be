import nodemailer from "nodemailer";

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type EmailVerificationData = {
  email: string;
  username: string;
  verificationToken: string;
};

type PasswordResetData = {
  email: string;
  username: string;
  resetToken: string;
};

export interface IEmailService {
  sendEmailVerification(data: EmailVerificationData): Promise<void>;
  sendPasswordReset(data: PasswordResetData): Promise<void>;
  sendWelcomeEmail(email: string, username: string): Promise<void>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly frontendUrl: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL!;
    this.fromName = process.env.FROM_NAME!;
    this.frontendUrl = process.env.FRONTEND_URL!;
    this.transporter = this.initTransporter();

    this.testConnection();
  }

  private initTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST!,
      port: Number(process.env.MAILTRAP_PORT!),
      auth: {
        user: process.env.MAILTRAP_USER!,
        pass: process.env.MAILTRAP_PASS!,
      },
    });
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: `${this.fromName} <${this.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
  }
  async sendEmailVerification(data: EmailVerificationData): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email/${data.verificationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CV Builder!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">Hi ${data.username}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Thank you for signing up! Please verify your email address to complete your registration and start building amazing CVs.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This verification link will expire in 24 hours for security reasons.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
              If you didn't create an account, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Welcome to CV Builder!
      
      Hi ${data.username}!
      
      Thank you for signing up! Please verify your email address by clicking the link below:
      ${verificationUrl}
      
      This verification link will expire in 24 hours.
      
      If you didn't create an account, please ignore this email.
    `;

    await this.sendEmail({
      to: data.email,
      subject: "Please verify your email address",
      html,
      text,
    });
  }
  async sendPasswordReset(data: PasswordResetData): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password/${data.resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">Hi ${data.username}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #f5576c; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This reset link will expire in 1 hour for security reasons.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Password Reset Request
      
      Hi ${data.username}!
      
      We received a request to reset your password. Click the link below to reset it:
      ${resetUrl}
      
      This reset link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email.
    `;

    await this.sendEmail({
      to: data.email,
      subject: "Reset your password",
      html,
      text,
    });
  }

  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CV Builder! 🎉</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">Hi ${username}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Your email has been successfully verified! You're all set to start creating professional CVs.
            </p>
              <div style="text-align: center; margin: 30px 0;">
              <a href="${this.frontendUrl}/dashboard" 
                 style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block;">
                Start Building Your CV
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Get started by creating your first CV and showcasing your skills to potential employers.
            </p>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: "Welcome! Your email is verified",
      html,
    });
  }
  private async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("Email service is ready");
      return true;
    } catch (error) {
      console.error("Email service connection failed:", error);
      return false;
    }
  }
}
