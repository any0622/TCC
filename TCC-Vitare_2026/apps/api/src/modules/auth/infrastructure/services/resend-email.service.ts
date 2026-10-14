import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailServicePort } from '../../application/ports';

@Injectable()
export class ResendEmailService implements EmailServicePort {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(config.get<string>('RESEND_API_KEY'));
    this.fromEmail = config.get<string>('MAIL_FROM') || 'Vitare <onboarding@resend.dev>';
  }

  async sendWelcome(email: string, fullName: string): Promise<void> {
    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Bem-vindo ao Vitare',
      html: `
        <h1>Olá, ${fullName}!</h1>
        <p>Bem-vindo ao Vitare. Sua conta foi criada com sucesso.</p>
        <p>Agora você pode gerenciar suas informações de saúde e configurar contatos de emergência.</p>
      `,
    });
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    const appUrl = this.config.get<string>('APP_URL') || 'http://localhost:5173';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Redefinição de senha - Vitare',
      html: `
        <h1>Redefinição de senha</h1>
        <p>Você solicitou a redefinição de sua senha.</p>
        <p><a href="${resetUrl}">Clique aqui para redefinir sua senha</a></p>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou isso, ignore este email.</p>
      `,
    });
  }
}