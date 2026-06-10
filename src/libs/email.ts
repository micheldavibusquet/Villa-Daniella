import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Remetente padrão.
 * Sem domínio verificado no Resend: use 'onboarding@resend.dev'
 * Com domínio verificado: use 'noreply@villadaniella.com'
 */
const FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';

/** Envia email de recuperação de senha */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  const recipient = process.env.EMAIL_OVERRIDE_TO ?? to;
  const { error } = await resend.emails.send({
    from: FROM,
    to: recipient,
    subject: 'Recuperação de senha — Villa Daniella',
    html: passwordResetTemplate(resetUrl),
  });
  if (error) throw new Error(error.message);
}

/** Envia email de boas-vindas após cadastro */
export async function sendWelcomeEmail(
  to: string,
  name: string,
): Promise<void> {
  const recipient = process.env.EMAIL_OVERRIDE_TO ?? to;
  const { error } = await resend.emails.send({
    from: FROM,
    to: recipient, // ← troque 'to' por 'recipient'
    subject: 'Bem-vindo à Villa Daniella Beach Homes!',
    html: welcomeTemplate(name),
  });
  if (error) throw new Error(error.message);
}

/** Template: Recuperação de senha */
function passwordResetTemplate(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#0f0e0c;border-radius:12px;overflow:hidden;">

            <tr>
              <td style="background:#1a1814;padding:32px;text-align:center;border-bottom:1px solid #2e2a22;">
                <p style="margin:0;font-size:11px;color:#6b6355;letter-spacing:4px;text-transform:uppercase;">Villa Daniella</p>
                <p style="margin:4px 0 0;font-size:20px;color:#e8e0d0;font-weight:700;letter-spacing:4px;">BEACH HOMES</p>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 48px;">
                <h1 style="margin:0 0 16px;font-size:22px;color:#e8e0d0;font-weight:400;letter-spacing:1px;">Recuperação de Senha</h1>
                <p style="margin:0 0 24px;font-size:14px;color:#8a7f70;line-height:1.8;">
                  Recebemos uma solicitação para redefinir a senha da sua conta.
                  Clique no botão abaixo para criar uma nova senha.
                </p>
                <p style="margin:0 0 32px;font-size:12px;color:#6b6355;">
                  ⏰ Este link expira em <strong style="color:#b8a06a;">1 hora</strong>.
                </p>
                <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                  <tr>
                    <td style="background:#b8a06a;border-radius:8px;padding:14px 32px;">
                      <a href="${resetUrl}" style="color:#0f0e0c;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:1px;">
                        Redefinir minha senha
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:12px;color:#4a4540;line-height:1.6;">
                  Se você não solicitou a recuperação, ignore este email. Sua senha permanece a mesma.
                </p>
                <p style="margin:16px 0 0;font-size:11px;color:#3a3530;word-break:break-all;">
                  Ou copie este link: <span style="color:#6b6355;">${resetUrl}</span>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#1a1814;padding:24px 48px;border-top:1px solid #2e2a22;text-align:center;">
                <p style="margin:0;font-size:11px;color:#4a4540;">Villa Daniella Beach Homes · Florianópolis, SC</p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

/** Template: Boas-vindas */
function welcomeTemplate(name: string): string {
  const firstName = name.split(' ')[0];
  const siteUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#0f0e0c;border-radius:12px;overflow:hidden;">

            <tr>
              <td style="background:#1a1814;padding:32px;text-align:center;border-bottom:1px solid #2e2a22;">
                <p style="margin:0;font-size:11px;color:#6b6355;letter-spacing:4px;text-transform:uppercase;">Villa Daniella</p>
                <p style="margin:4px 0 0;font-size:20px;color:#e8e0d0;font-weight:700;letter-spacing:4px;">BEACH HOMES</p>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 48px;">
                <h1 style="margin:0 0 8px;font-size:22px;color:#b8a06a;font-weight:400;letter-spacing:1px;">
                  Bem-vindo, ${firstName}!
                </h1>
                <p style="margin:0 0 24px;font-size:14px;color:#8a7f70;line-height:1.8;">
                  Sua conta na Villa Daniella Beach Homes foi criada com sucesso.
                  Estamos felizes em ter você conosco!
                </p>
                <div style="background:#1a1814;border:1px solid #2e2a22;border-radius:8px;padding:24px;margin-bottom:32px;">
                  <p style="margin:0 0 12px;font-size:11px;color:#b8a06a;letter-spacing:2px;text-transform:uppercase;">O que você pode fazer agora</p>
                  <p style="margin:0 0 8px;font-size:13px;color:#8a7f70;">🏡 Explorar nossas acomodações exclusivas</p>
                  <p style="margin:0 0 8px;font-size:13px;color:#8a7f70;">📅 Fazer sua reserva online</p>
                  <p style="margin:0;font-size:13px;color:#8a7f70;">⭐ Avaliar sua experiência após a estadia</p>
                </div>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#b8a06a;border-radius:8px;padding:14px 32px;">
                      <a href="${siteUrl}/rooms" style="color:#0f0e0c;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:1px;">
                        Ver acomodações
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="background:#1a1814;padding:24px 48px;border-top:1px solid #2e2a22;text-align:center;">
                <p style="margin:0;font-size:11px;color:#4a4540;">Villa Daniella Beach Homes · Florianópolis, SC</p>
                <p style="margin:8px 0 0;font-size:11px;color:#3a3530;">contato@villadaniella.com · +55 48 3207-7255</p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}
