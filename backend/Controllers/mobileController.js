const bcrypt         = require('bcrypt');
const crypto         = require('crypto');
const Customer       = require('../models/Customer');
const Warranty       = require('../models/Warranty');
const WarrantyPolicy = require('../models/WarrantyPolicy');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');

// ============================================
// LOGIN MÓVIL
// ============================================
exports.mobileLogin = async (req, res) => {
    try {
        const { customer_email, customer_password } = req.body;

        if (!customer_email || !customer_password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        }

        const cleanEmail = customer_email.trim().toLowerCase();

        const customer = await Customer.findOne({
            where: { customer_email: cleanEmail }
        });

        if (!customer) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        if (customer.customer_status === 0) {
            return res.status(403).json({ error: 'Tu cuenta está desactivada. Contacta al soporte.' });
        }

        if (!customer.email_verified) {
            return res.status(403).json({ error: 'Debes verificar tu correo electrónico antes de iniciar sesión.' });
        }

        if (!customer.customer_password) {
            return res.status(401).json({ error: 'Esta cuenta no tiene contraseña configurada. Contacta al soporte.' });
        }

        const isMatch = await bcrypt.compare(customer_password, customer.customer_password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        res.json({
            message: 'Login exitoso.',
            customer: {
                customer_id:           customer.customer_id,
                customer_first_name:   customer.customer_first_name,
                customer_second_name:  customer.customer_second_name,
                customer_last_name:    customer.customer_last_name,
                customer_email:        customer.customer_email,
                customer_phone:        customer.customer_phone,
                customer_country_code: customer.customer_country_code,
                customer_company:      customer.customer_company,
                customer_image:        customer.customer_image,
                customer_status:       customer.customer_status,
            }
        });

    } catch (error) {
        console.error('Error en mobileLogin:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// ============================================
// REGISTRO MÓVIL (3 pasos)
// ============================================
exports.mobileRegister = async (req, res) => {
    try {
        const {
            // Paso 1
            customer_first_name,
            customer_second_name,
            customer_last_name,
            customer_second_last_name,
            customer_email,
            customer_country_code,
            customer_phone,
            // Paso 2
            customer_company,
            validation_type,    // 'serie' | 'factura'
            validation_value,
            // Paso 3
            customer_password,
            // Política
            accepted_policy_version
        } = req.body;

        // ── Sanitizar ──────────────────────────────────────────────────────
        const cleanFirst    = customer_first_name?.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        const cleanSecond   = customer_second_name?.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') || null;
        const cleanLast     = customer_last_name?.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        const cleanSecLast  = customer_second_last_name?.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') || null;
        const cleanEmail    = customer_email?.trim().toLowerCase();
        const cleanPhone    = customer_phone?.replace(/[^0-9]/g, '');
        const cleanCompany  = customer_company?.trim();
        const cleanValue    = validation_value?.trim();

        // ── Validar requeridos ─────────────────────────────────────────────
        if (!cleanFirst || !cleanLast || !cleanEmail || !cleanPhone ||
            !customer_country_code || !cleanCompany ||
            !validation_type || !cleanValue || !customer_password ||
            !accepted_policy_version) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        if (!['serie', 'factura'].includes(validation_type)) {
            return res.status(400).json({ error: 'Tipo de verificación inválido.' });
        }

        // ── Formato email ──────────────────────────────────────────────────
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
        }

        // ── Longitud mínima del nombre ─────────────────────────────────────
        if (cleanFirst.length < 2) {
            return res.status(400).json({ error: 'El primer nombre debe tener al menos 2 caracteres.' });
        }

        // ── Validar contraseña ─────────────────────────────────────────────
        const pwRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]).{12,}$/;
        if (!pwRegex.test(customer_password)) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
            });
        }

        // ── Unicidad email y teléfono ──────────────────────────────────────
        const emailUsed = await Customer.findOne({ where: { customer_email: cleanEmail } });
        if (emailUsed) return res.status(400).json({ error: 'Este correo ya está registrado.' });

        const phoneUsed = await Customer.findOne({ where: { customer_phone: cleanPhone } });
        if (phoneUsed) return res.status(400).json({ error: 'Este número de teléfono ya está registrado.' });

        // ── Validar garantía ───────────────────────────────────────────────
        const warrantyWhere = validation_type === 'serie'
            ? { warranty_serial_number: cleanValue }
            : { warranty_invoice_number: cleanValue };

        const warrantyExists = await Warranty.findOne({ where: warrantyWhere });

        const customerStatus   = warrantyExists ? 1 : 0;
        const requiresReview   = !warrantyExists;

        // ── Hash contraseña ────────────────────────────────────────────────
        const hashedPassword = await bcrypt.hash(customer_password, 12);

        // ── Token de verificación de email ─────────────────────────────────
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        // ── Crear cliente ──────────────────────────────────────────────────
        const newCustomer = await Customer.create({
            customer_first_name:       cleanFirst,
            customer_second_name:      cleanSecond,
            customer_last_name:        cleanLast,
            customer_second_last_name: cleanSecLast,
            customer_email:            cleanEmail,
            customer_phone:            cleanPhone,
            customer_country_code,
            customer_company:          cleanCompany,
            customer_registration_type:  validation_type,
            customer_registration_value: cleanValue,
            customer_password:         hashedPassword,
            customer_image:            null,
            customer_status:           customerStatus,
            email_verified:            0,
            verification_token:        verificationToken,
            verification_token_expires: tokenExpires,
            accepted_policy_at:        new Date(),
            accepted_policy_version:   accepted_policy_version,
        });

        // ── Enviar email de verificación ───────────────────────────────────
        const fullName = `${cleanFirst} ${cleanLast}`;
        await sendVerificationEmail(cleanEmail, verificationToken, fullName, '15 minutos');

        const io = req.app.get('io');
        if (io) io.emit('customer_created', {
            customer_id: newCustomer.customer_id,
            full_name: fullName,
            status: customerStatus
        });

        res.status(201).json({
            message: requiresReview
                ? 'Cuenta creada. La garantía no pudo verificarse automáticamente y está en revisión. Revisa tu correo para activar tu cuenta.'
                : 'Cuenta creada exitosamente. Revisa tu correo para activar tu cuenta.',
            customer_id: newCustomer.customer_id,
            requires_review: requiresReview,
        });

    } catch (error) {
        console.error('Error en mobileRegister:', error);
        res.status(500).json({ error: 'Error interno al procesar el registro.' });
    }
};

// ============================================
// VALIDAR GARANTÍA (Paso 2 del registro)
// ============================================
exports.validateWarranty = async (req, res) => {
    try {
        const { type, value } = req.query;

        if (!type || !value) {
            return res.status(400).json({ error: 'Parámetros "type" y "value" requeridos.' });
        }

        if (!['serie', 'factura'].includes(type)) {
            return res.status(400).json({ error: 'Tipo inválido. Use "serie" o "factura".' });
        }

        const where = type === 'serie'
            ? { warranty_serial_number: value.trim(), warranty_status: 1 }
            : { warranty_invoice_number: value.trim(), warranty_status: 1 };

        const warranty = await Warranty.findOne({ where });

        if (!warranty) {
            return res.json({
                exists: false,
                message: type === 'serie'
                    ? 'El número de serie no se encontró en el sistema.'
                    : 'El número de factura no se encontró en el sistema.'
            });
        }

        res.json({
            exists:      true,
            is_expired:  warranty.is_expired,
            expiry_date: warranty.warranty_expiry_date,
            message: warranty.is_expired
                ? 'La garantía existe pero ha expirado.'
                : 'Garantía verificada y vigente.',
        });

    } catch (error) {
        console.error('Error en validateWarranty:', error);
        res.status(500).json({ error: 'Error al validar la garantía.' });
    }
};

// ============================================
// FORGOT PASSWORD — genera token y envía email
// ============================================
exports.forgotPassword = async (req, res) => {
    try {
        const { customer_email } = req.body;

        if (!customer_email) {
            return res.status(400).json({ error: 'El correo electrónico es requerido.' });
        }

        const cleanEmail = customer_email.trim().toLowerCase();

        const customer = await Customer.findOne({ where: { customer_email: cleanEmail } });

        // Solo enviar si existe y tiene email verificado; siempre responder 200 (seguridad)
        if (customer && customer.email_verified) {
            const resetToken   = crypto.randomBytes(32).toString('hex');
            const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

            await customer.update({
                reset_password_token:   resetToken,
                reset_password_expires: resetExpires,
            });

            const fullName = customer.customer_first_name + ' ' + customer.customer_last_name;
            await sendPasswordResetEmail(cleanEmail, resetToken, fullName);
        }

        res.json({ message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' });

    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// ============================================
// RESET PASSWORD — valida token y cambia contraseña
// ============================================
exports.resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) {
            return res.status(400).json({ error: 'Token y nueva contraseña son requeridos.' });
        }

        const pwRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]).{12,}$/;
        if (!pwRegex.test(new_password)) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
            });
        }

        const customer = await Customer.findOne({ where: { reset_password_token: token } });

        if (!customer || !customer.reset_password_expires || customer.reset_password_expires < new Date()) {
            return res.status(400).json({ error: 'El enlace de recuperación es inválido o ha expirado.' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 12);

        await customer.update({
            customer_password:      hashedPassword,
            reset_password_token:   null,
            reset_password_expires: null,
        });

        res.json({ message: 'Contraseña restablecida exitosamente.' });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// ============================================
// RESET REDIRECT — página HTML que redirige al deep link
// ============================================
exports.resetRedirect = (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('<p>Enlace inválido.</p>');
    }

    const deepLink = 'tboxsasupport://auth/reset-password?token=' + token;

    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restableciendo contraseña...</title>
  <style>
    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0B1C0D; }
    .card { background: white; border-radius: 16px; padding: 32px 24px; max-width: 360px; text-align: center; margin: 20px; }
    h2 { color: #1B3A1F; margin-top: 0; font-size: 22px; }
    p { color: #6b7280; font-size: 14px; line-height: 1.6; }
    a.btn { display: inline-block; background: #1B3A1F; color: white; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 16px; }
  </style>
  <script>setTimeout(function(){ window.location.href = '${deepLink}'; }, 500);</script>
</head>
<body>
  <div class="card">
    <h2>Restablecer Contraseña</h2>
    <p>Abriendo la aplicación TBOXSA...</p>
    <p>Si no se abre automáticamente, toca el botón de abajo.</p>
    <a class="btn" href="${deepLink}">Abrir Aplicación</a>
  </div>
</body>
</html>`);
};

// ============================================
// OBTENER POLÍTICA DE GARANTÍA ACTIVA (público)
// ============================================
exports.getWarrantyPolicy = async (req, res) => {
    try {
        const policy = await WarrantyPolicy.findOne({
            where: { policy_is_active: 1 },
            order: [['created_at', 'DESC']],
        });

        if (!policy) {
            return res.status(404).json({ error: 'No hay política de garantía activa.' });
        }

        res.json({
            policy_id:            policy.policy_id,
            policy_version:       policy.policy_version,
            policy_updated_label: policy.policy_updated_label,
            policy_content:       policy.policy_content,
        });
    } catch (error) {
        console.error('Error en getWarrantyPolicy:', error);
        res.status(500).json({ error: 'Error al obtener la política de garantía.' });
    }
};