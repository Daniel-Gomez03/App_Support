const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendVerificationEmail = async (email, verificationToken, fullName, expiryText = '6 horas') => {
    try {
        const baseUrl = process.env.APP_URL || 'http://localhost:8000';
        const verificationLink = baseUrl + '/api/verify-email?token=' + verificationToken;

        const mailOptions = {
            from: `"TBOXSA" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verifica tu cuenta - TBOXSA',
            html: `
            <div style="font-family: Poppins, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center" style="background-color: #0d1a0d; padding: 40px 0;">
                            <div style="margin-top: 20px;">
                                <div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                                    <span style="color: #3C6034; font-size: 20px;">✉️</span>
                                </div>
                            </div>
                            <h1 style="color: #ffffff; margin-top: 20px; font-size: 24px;">Verificar Correo Electrónico</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                                Hola <strong>${fullName}</strong>,
                            </p>
                            <p style="font-size: 15px; color: #555555; line-height: 1.6;">
                                Gracias por registrarte en <strong>TBOXSA</strong>. Para activar tu cuenta haz clic en el botón a continuación para verificar tu dirección de correo electrónico:
                            </p>

                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${verificationLink}" style="background-color: #3C6034; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                                    Verificar Email
                                </a>
                            </div>

                            <p style="font-size: 14px; color: #555555; line-height: 1.6;">
                                Si no creaste esta cuenta, puedes ignorar este correo.
                            </p>

                            <p style="font-size: 13px; color: #888888; text-align: center; border-top: 1px solid #eeeeee; padding-top: 20px;">
                                Este enlace es de un solo uso y expirará en <strong>${expiryText}</strong>.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 30px; background-color: #fafafa; border-top: 1px solid #eeeeee;">
                            <p style="font-size: 12px; color: #999999; margin: 0;">
                                Este es un mensaje automático, por favor no respondas a este correo.
                            </p>
                            <p style="font-size: 12px; color: #999999; margin: 10px 0;">
                                ¿Necesitas ayuda? Escríbenos a <a href="mailto:administracion@tboxsa.com" style="color: #3C6034; text-decoration: none;">administracion@tboxsa.com</a>
                            </p>
                            <p style="font-size: 12px; color: #999999; margin: 0;">
                                &copy; 2026 TBOXSA - Think Outside The Box. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error enviando email:', error.message);
        return false;
    }
};

const sendPasswordResetEmail = async (email, resetToken, fullName) => {
    try {
        const baseUrl = process.env.APP_URL || 'http://localhost:8000';
        const resetLink = baseUrl + '/api/mobile/reset-redirect?token=' + resetToken;

        const mailOptions = {
            from: `"TBOXSA" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Restablece tu contraseña - TBOXSA',
            html: `
            <div style="font-family: Poppins, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center" style="background-color: #0d1a0d; padding: 40px 0;">
                            <div style="margin-top: 20px;">
                                <div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                                    <span style="color: #3C6034; font-size: 20px;">🔐</span>
                                </div>
                            </div>
                            <h1 style="color: #ffffff; margin-top: 20px; font-size: 24px;">Restablecer Contraseña</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                                Hola <strong>${fullName}</strong>,
                            </p>
                            <p style="font-size: 15px; color: #555555; line-height: 1.6;">
                                Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>TBOXSA</strong>. Haz clic en el botón a continuación para crear una nueva contraseña:
                            </p>

                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${resetLink}" style="background-color: #3C6034; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                                    Restablecer Contraseña
                                </a>
                            </div>

                            <p style="font-size: 14px; color: #555555; line-height: 1.6;">
                                Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo la misma.
                            </p>

                            <p style="font-size: 13px; color: #888888; text-align: center; border-top: 1px solid #eeeeee; padding-top: 20px;">
                                Este enlace es de un solo uso y expirará en <strong>15 minutos</strong>.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 30px; background-color: #fafafa; border-top: 1px solid #eeeeee;">
                            <p style="font-size: 12px; color: #999999; margin: 0;">
                                Este es un mensaje automático, por favor no respondas a este correo.
                            </p>
                            <p style="font-size: 12px; color: #999999; margin: 10px 0;">
                                ¿Necesitas ayuda? Escríbenos a <a href="mailto:administracion@tboxsa.com" style="color: #3C6034; text-decoration: none;">administracion@tboxsa.com</a>
                            </p>
                            <p style="font-size: 12px; color: #999999; margin: 0;">
                                &copy; 2026 TBOXSA - Think Outside The Box. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error enviando email de reset:', error.message);
        return false;
    }
};

const sendPendingReviewEmail = async (email, verificationToken, fullName, validationType) => {
    try {
        const baseUrl = process.env.APP_URL || 'http://localhost:8000';
        const verificationLink = baseUrl + '/api/verify-email?token=' + verificationToken;
        const typeLabel = validationType === 'factura' ? 'número de factura' : 'número de serie';

        const mailOptions = {
            from: `"TBOXSA" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Registro recibido - Revisión pendiente | TBOXSA',
            html: `
            <div style="font-family: Poppins, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center" style="background-color: #0d1a0d; padding: 40px 0;">
                            <div style="margin-top: 20px;">
                                <div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 20px;">⏳</span>
                                </div>
                            </div>
                            <h1 style="color: #ffffff; margin-top: 20px; font-size: 24px;">Registro en Revisión</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                                Hola <strong>${fullName}</strong>,
                            </p>
                            <p style="font-size: 15px; color: #555555; line-height: 1.6;">
                                Hemos recibido tu solicitud de registro en <strong>TBOXSA</strong>. Sin embargo, el <strong>${typeLabel}</strong> que ingresaste no pudo ser verificado automáticamente en nuestro sistema.
                            </p>
                            <p style="font-size: 15px; color: #555555; line-height: 1.6;">
                                Para continuar, primero verifica tu correo electrónico con el botón de abajo. Tu cuenta quedará <strong>pendiente de activación</strong> hasta que un administrador valide tu registro manualmente.
                            </p>

                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${verificationLink}" style="background-color: #3C6034; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                                    Verificar Email
                                </a>
                            </div>

                            <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-top: 10px;">
                                <p style="font-size: 13px; color: #92400e; margin: 0;">
                                    ⚠️ Tu cuenta no estará disponible para iniciar sesión hasta que un administrador complete la revisión. Te notificaremos cuando tu cuenta sea activada.
                                </p>
                            </div>

                            <p style="font-size: 13px; color: #888888; text-align: center; border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px;">
                                Este enlace de verificación expirará en <strong>15 minutos</strong>.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 30px; background-color: #fafafa; border-top: 1px solid #eeeeee;">
                            <p style="font-size: 12px; color: #999999; margin: 0;">
                                Este es un mensaje automático, por favor no respondas a este correo.
                            </p>
                            <p style="font-size: 12px; color: #999999; margin: 10px 0;">
                                ¿Necesitas ayuda? Escríbenos a <a href="mailto:administracion@tboxsa.com" style="color: #3C6034; text-decoration: none;">administracion@tboxsa.com</a>
                            </p>
                            <p style="font-size: 12px; color: #999999; margin: 0;">
                                &copy; 2026 TBOXSA - Think Outside The Box. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error enviando email de revisión pendiente:', error.message);
        return false;
    }
};

const sendAccountActivatedEmail = async (email, fullName) => {
    try {
        const mailOptions = {
            from: `"TBOXSA" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '¡Tu cuenta ha sido activada! - TBOXSA',
            html: `
            <div style="font-family: Poppins, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center" style="background-color: #0d1a0d; padding: 40px 0;">
                            <div style="margin-top: 20px;">
                                <div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 20px;">✅</span>
                                </div>
                            </div>
                            <h1 style="color: #ffffff; margin-top: 20px; font-size: 24px;">¡Cuenta Activada!</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                                Hola <strong>${fullName}</strong>,
                            </p>
                            <p style="font-size: 15px; color: #555555; line-height: 1.6;">
                                Nos complace informarte que tu cuenta en <strong>TBOXSA</strong> ha sido revisada y <strong>activada exitosamente</strong> por nuestro equipo.
                            </p>
                            <p style="font-size: 15px; color: #555555; line-height: 1.6;">
                                Ya puedes iniciar sesión en la aplicación con el correo y contraseña que registraste.
                            </p>

                            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-top: 24px;">
                                <p style="font-size: 14px; color: #166534; margin: 0;">
                                    ✔ Tu registro ha sido validado correctamente. Bienvenido a TBOXSA Support.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 30px; background-color: #fafafa; border-top: 1px solid #eeeeee;">
                            <p style="font-size: 12px; color: #999999; margin: 0;">
                                Este es un mensaje automático, por favor no respondas a este correo.
                            </p>
                            <p style="font-size: 12px; color: #999999; margin: 10px 0;">
                                ¿Necesitas ayuda? Escríbenos a <a href="mailto:administracion@tboxsa.com" style="color: #3C6034; text-decoration: none;">administracion@tboxsa.com</a>
                            </p>
                            <p style="font-size: 12px; color: #999999; margin: 0;">
                                &copy; 2026 TBOXSA - Think Outside The Box. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error enviando email de activación:', error.message);
        return false;
    }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendPendingReviewEmail, sendAccountActivatedEmail };