const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const { Op, Sequelize } = require('sequelize');
const Customer = require('../models/Customer');
const { uploadToFTP, deleteFromFTP } = require('../Utils/ftpClient');
const { sendVerificationEmail } = require('../config/email');
const Warranty = require('../models/Warranty');

const cleanupFile = (path) => {
    if (path && fs.existsSync(path)) fs.unlinkSync(path);
};

// ============================================
// ENVIAR CORREO DE VERIFICACIÓN (Admin)
// ============================================
exports.sendVerificationEmailAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id);

        if (!customer) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        if (customer.verification_token && customer.verification_token_expires > new Date()) {
            const remainingTime = Math.ceil((customer.verification_token_expires - new Date()) / (1000 * 60)); // Minutos restantes
            return res.status(429).json({
                error: `Ya existe un correo de verificación vigente. Intente de nuevo en ${remainingTime} minutos.`
            });
        }

        const newToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 6);

        await customer.update({
            verification_token: newToken,
            verification_token_expires: expires
        });

        const fullName = `${customer.customer_first_name} ${customer.customer_last_name}`;

        await sendVerificationEmail(customer.customer_email, newToken, fullName);

        res.status(200).json({
            message: `Correo de verificación enviado a ${customer.customer_email}. Válido por 6 horas.`
        });

    } catch (error) {
        console.error("Error enviando email:", error);
        res.status(500).json({ error: 'Error al procesar el envío del correo de verificación.' });
    }
};

// ============================================
// VALIDAR TOKEN DE EMAIL 
// ============================================
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).send('<h1>Token no proporcionado</h1>');
        }

        const customer = await Customer.findOne({
            where: {
                verification_token: token,
                verification_token_expires: { [Op.gt]: new Date() }
            }
        });

        if (!customer) {
            return res.status(400).send(`
                <div style="font-family: Poppins; text-align: center; padding: 50px;">
                    <h1 style="color: #cf1322;">Enlace inválido o expirado</h1>
                    <p>El enlace de verificación ha caducado o ya ha sido utilizado.</p>
                </div>
            `);
        }

        await customer.update({
            email_verified: 1,
            verification_token: null,
            verification_token_expires: null,
            customer_status: 1
        });

        res.status(200).send(`
            <div style="font-family: Poppins; text-align: center; padding: 50px;">
                <h1 style="color: #3C6034;">¡Correo verificado con éxito!</h1>
                <p>Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión.</p>
            </div>
        `);

    } catch (error) {
        console.error("Error verificando email:", error);
        res.status(500).send('<h1>Error interno del servidor</h1>');
    }
};

// ============================================
// REGISTRO DE CLIENTE (Panel Administrativo)
// ============================================
exports.registerAdmin = async (req, res) => {
    const tempFilePath = req.file?.path;

    try {
        const {
            customer_first_name,
            customer_second_name,
            customer_last_name,
            customer_second_last_name,
            customer_email,
            customer_country_code,
            customer_phone,
            customer_company,
            validation_type,
            validation_value
        } = req.body;


        const cleanFirstName = customer_first_name?.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
        const cleanSecondName = customer_second_name?.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '') || null;
        const cleanLastName = customer_last_name?.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
        const cleanSecondLastName = customer_second_last_name?.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '') || null;

        const cleanEmail = customer_email?.replace(/\s+/g, '').toLowerCase();
        const cleanValidationValue = validation_value?.replace(/\s+/g, '');

        const cleanPhone = customer_phone?.replace(/[^0-9]/g, '');

        if (!cleanFirstName || !cleanLastName || !cleanEmail || !cleanPhone || !customer_country_code || !customer_company || !validation_type || !cleanValidationValue) {
            cleanupFile(tempFilePath);
            return res.status(400).json({ error: 'Faltan campos obligatorios para procesar el registro.' });
        }

        const countryRules = { '+504': 8, '+505': 8, '+503': 8, '+502': 8 };
        const expectedLength = countryRules[customer_country_code];
        if (expectedLength && cleanPhone.length !== expectedLength) {
            cleanupFile(tempFilePath);
            return res.status(400).json({ error: `El número de teléfono para ${customer_country_code} debe tener exactamente ${expectedLength} dígitos.` });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(cleanEmail)) {
            cleanupFile(tempFilePath);
            return res.status(400).json({ error: 'El formato del correo electrónico es inválido.' });
        }

        if (cleanFirstName.length < 3) {
            cleanupFile(tempFilePath);
            return res.status(400).json({ error: 'El primer nombre debe tener mínimo 3 caracteres.' });
        }

        const existingEmail = await Customer.findOne({ where: { customer_email: cleanEmail } });
        if (existingEmail) {
            cleanupFile(tempFilePath);
            return res.status(400).json({ error: 'El email ya está registrado.' });
        }

        const existingPhone = await Customer.findOne({ where: { customer_phone: cleanPhone } });
        if (existingPhone) {
            cleanupFile(tempFilePath);
            return res.status(400).json({ error: 'Este número de teléfono ya está registrado.' });
        }

        const warrantyQuery = validation_type === 'serie'
            ? { warranty_serial_number: cleanValidationValue }
            : { warranty_invoice_number: cleanValidationValue };

        const warrantyExists = await Warranty.findOne({ where: warrantyQuery });

        let initialStatus = 1;
        let responseMessage = 'Cliente registrado exitosamente.';

        if (!warrantyExists) {
            initialStatus = 0;
            responseMessage = `Cliente creado (Inactivo). La ${validation_type} no existe en nuestra base de datos y requiere revisión manual.`;
        }

        let customer_image = null;
        if (req.file) {
            try {
                const remoteUrl = await uploadToFTP(tempFilePath, req.file.filename);
                customer_image = remoteUrl;
            } catch (ftpError) {
                console.error("Error FTP:", ftpError);
            }
            cleanupFile(tempFilePath);
        }

        const newCustomer = await Customer.create({
            customer_first_name: cleanFirstName,
            customer_second_name: cleanSecondName,
            customer_last_name: cleanLastName,
            customer_second_last_name: cleanSecondLastName,
            customer_email: cleanEmail,
            customer_phone: cleanPhone,
            customer_country_code,
            customer_company: customer_company.trim(),
            customer_registration_type: validation_type,
            customer_registration_value: cleanValidationValue,
            customer_password: null,
            customer_image,
            customer_status: initialStatus,
            email_verified: 0,
            verification_token: null
        });

        const io = req.app.get('io');
        if (io) {
            io.emit('customer_created', {
                customer_id: newCustomer.customer_id,
                full_name: `${newCustomer.customer_first_name} ${newCustomer.customer_last_name}`,
                status: initialStatus
            });
        }

        res.status(201).json({
            message: responseMessage,
            customer_id: newCustomer.customer_id,
            requires_manual_review: !warrantyExists
        });

    } catch (error) {
        cleanupFile(tempFilePath);
        console.error("Error en registro:", error);
        res.status(500).json({ error: "Ocurrió un error interno al procesar el registro." });
    }
};

// ============================================
// OBTENER TODOS LOS CLIENTES
// ============================================
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            attributes: [
                'customer_id',
                'customer_first_name',
                'customer_second_name',
                'customer_last_name',
                'customer_second_last_name',
                [Sequelize.fn('CONCAT_WS', ' ', Sequelize.col('customer_first_name'), Sequelize.col('customer_last_name')), 'full_name'],
                'customer_email',
                'email_verified',
                'customer_country_code',
                'customer_phone',
                [Sequelize.fn('CONCAT', Sequelize.col('customer_country_code'), ' ', Sequelize.col('customer_phone')), 'full_phone'],
                'customer_company',
                'customer_registration_type',
                'customer_registration_value',
                'customer_status',
                'customer_image',
                'created_at'
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// ============================================
// OBTENER CLIENTE POR ID
// ============================================
exports.getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id, {
            attributes: [
                'customer_id', 'customer_first_name', 'customer_second_name',
                'customer_last_name', 'customer_second_last_name', 'customer_email',
                'customer_country_code', 'customer_phone', 'customer_company',
                'customer_registration_type', 'customer_registration_value',
                'customer_status', 'customer_image', 'email_verified', 'created_at'
            ]
        });

        if (!customer) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR CLIENTE (Panel Administrativo)
// ============================================
exports.updateCustomer = async (req, res) => {
    const tempFilePath = req.file?.path;
    const { id } = req.params;

    try {
        const customer = await Customer.findByPk(id);
        if (!customer) {
            cleanupFile(tempFilePath);
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        const body = req.body || {};

        const {
            customer_first_name,
            customer_second_name,
            customer_last_name,
            customer_second_last_name,
            customer_email,
            customer_phone,
            customer_company,
            customer_country_code
        } = body;

        const cleanEmail = customer_email?.replace(/\s+/g, '').toLowerCase();
        const cleanPhone = customer_phone?.replace(/[^0-9]/g, '');

        if (cleanEmail && cleanEmail !== customer.customer_email) {
            const emailExists = await Customer.findOne({
                where: { customer_email: cleanEmail, customer_id: { [Op.ne]: id } }
            });
            if (emailExists) {
                cleanupFile(tempFilePath);
                return res.status(400).json({ error: 'El nuevo correo ya está en uso.' });
            }
            customer.email_verified = 0; 
        }

        let customer_image = customer.customer_image;
        if (req.file) {
            try {
                if (customer.customer_image) {
                    const oldFileName = customer.customer_image.split('/').pop();
                    await deleteFromFTP(oldFileName).catch(err => console.error("Error eliminando foto vieja FTP:", err));
                }
                const remoteUrl = await uploadToFTP(tempFilePath, req.file.filename);
                customer_image = remoteUrl;
            } catch (ftpErr) {
                console.error("Error al subir a FTP:", ftpErr);
            } finally {
                cleanupFile(tempFilePath); 
            }
        }

        await customer.update({
            customer_first_name: customer_first_name?.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '') || customer.customer_first_name,
            customer_second_name: customer_second_name?.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '') || null,
            customer_last_name: customer_last_name?.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '') || customer.customer_last_name,
            customer_second_last_name: customer_second_last_name?.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '') || null,
            customer_email: cleanEmail || customer.customer_email,
            customer_phone: cleanPhone || customer.customer_phone,
            customer_country_code: customer_country_code || customer.customer_country_code,
            customer_company: customer_company?.trim() || customer.customer_company,
            customer_image,
            email_verified: customer.email_verified
        });

        res.status(200).json({ message: 'Cliente actualizado correctamente.' });

    } catch (error) {
        cleanupFile(tempFilePath);
        console.error("Error en updateCustomer:", error);
        res.status(500).json({ error: 'Error interno al actualizar el cliente.' });
    }
};

// ============================================
// CAMBIAR ESTADO DEL CLIENTE (Toggle)
// ============================================
exports.toggleCustomerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id);
        if (!customer) return res.status(404).json({ error: 'Cliente no encontrado' });

        const newStatus = customer.customer_status === 1 ? 0 : 1;
        await customer.update({ customer_status: newStatus });

        const io = req.app.get('io');
        if (io) {
            io.emit('customer_status_updated', { customer_id: id, new_status: newStatus });
        }

        res.status(200).json({ message: `Estado actualizado a ${newStatus === 1 ? 'Activo' : 'Inactivo'}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};