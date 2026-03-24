const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// ✅ Probar conexión al iniciar
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error en configuración de email:', error);
    } else {
        console.log('✅ Email configurado correctamente');
    }
});

const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const verificationLink = `http://localhost:8000/api/verify-email?token=${verificationToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '✅ Verificar tu email - TBOXSA',
            html: `
        <h2>¡Bienvenido a TBOXSA!</h2>
        <p>Haz clic en el siguiente enlace para verificar tu email:</p>
        <a href="${verificationLink}" style="background-color: #3C6034; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verificar Email
        </a>
        <p>Este enlace expira en 15 minutos.</p>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de verificación enviado a ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email:', error.message);
        return false;
    }
};

module.exports = { sendVerificationEmail };