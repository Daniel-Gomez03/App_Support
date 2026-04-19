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

const sendVerificationEmail = async (email, verificationToken, fullName) => {
    try {
        const verificationLink = `http://localhost:8000/api/verify-email?token=${verificationToken}`;

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
                                    <span style="color: #3C6034; font-size: 20px;">✔</span>
                                </div>
                            </div>
                            <h1 style="color: #ffffff; margin-top: 20px; font-size: 24px;">¡Verifica tu cuenta!</h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                                Hola <strong>${fullName}</strong>,
                            </p>
                            <p style="font-size: 15px; color: #555555; line-height: 1.6;">
                                Para completar tu registro en el sistema administrativo de <strong>TBOXSA</strong> y activar tu acceso, por favor haz clic en el botón a continuación para verificar tu dirección de correo electrónico:
                            </p>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${verificationLink}" style="background-color: #3C6034; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                                    Verificar Email
                                </a>
                            </div>
                            
                            <p style="font-size: 13px; color: #888888; text-align: center; border-top: 1px solid #eeeeee; padding-top: 20px;">
                                Este enlace es de un solo uso y expirará en <strong>6 horas</strong>.
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

module.exports = { sendVerificationEmail };