const bcrypt = require('bcrypt');
const crypto = require('crypto')
const Customer = require('../models/Customer');

// ============================================
// VALIDAR CONTRASEÑA
// ============================================
const validatePassword = (password) => {
    const errors = [];

    if (password.length < 12) {
        errors.push('La contraseña debe tener mínimo 12 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('La contraseña debe contener al menos una mayúscula (A-Z)');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('La contraseña debe contener al menos una minúscula (a-z)');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('La contraseña debe contener al menos un número (0-9)');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*)');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// ============================================
// REGISTRO DE CLIENTE
// ============================================
exports.register = async (req, res) => {
    try {
        const { customer_name, customer_email, customer_phone, customer_country_code, customer_company, customer_password } = req.body;

        if (!customer_name || !customer_email || !customer_phone || !customer_country_code || !customer_company || !customer_password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customer_email)) {
            return res.status(400).json({ error: 'Email inválido' });
        }

        if (customer_name.length < 3) {
            return res.status(400).json({ error: 'El nombre debe tener mínimo 3 caracteres' });
        }

        if (customer_company.length < 3) {
            return res.status(400).json({ error: 'La empresa debe tener mínimo 3 caracteres' });
        }

        const passwordValidation = validatePassword(customer_password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: 'La contraseña no cumple los requisitos',
                details: passwordValidation.errors
            });
        }

        const existingEmail = await Customer.findOne({ where: { customer_email } });
        if (existingEmail) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        //Genera token de verificacion
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); //15 minutos maximo

        //Hashea Contraseña
        const hashedPassword = await bcrypt.hash(customer_password, 15);

        const newCustomer = await Customer.create({
            customer_name,
            customer_email,
            customer_phone,
            customer_country_code,
            customer_company,
            customer_password: hashedPassword,
            customer_status: 1,
            email_verified: false,
            verification_token: verificationToken,
            verification_token_expires: tokenExpires,
        });

        const { sendVerificationEmail } = require('../config/email');
        await sendVerificationEmail(customer_email, verificationToken);

        const io = req.app.get('io');
        io.emit('customer_created', newCustomer);

        res.status(201).json({
            message: 'Usuario registrado. Por favor, verifica tu email para continuar.',
            customer_id: newCustomer.customer_id,
            customer_email: newCustomer.customer_email,
            note: 'Revisa tu email para el enlace de verificación'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// VERIFICAR EMAIL
// ============================================
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Token no proporcionado' });
        }

        const customer = await Customer.findOne({
            where: { verification_token: token }
        });

        if (!customer) {
            return res.status(400).json({ error: 'Token inválido' });
        }


        if (new Date() > customer.verification_token_expires) {
            return res.status(400).json({ error: 'El token ha expirado' });
        }

        await customer.update({
            email_verified: true,
            verification_token: null,
            verification_token_expires: null
        });

        res.status(200).json({
            message: 'Email verificado correctamente. Ahora puedes iniciar sesión.',
            customer_email: customer.customer_email
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// LOGIN
// ============================================
exports.login = async (req, res) => {
    try {
        const { customer_email, customer_password } = req.body;

        if (!customer_email || !customer_password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const customer = await Customer.findOne({ where: { customer_email } });

        if (!customer) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        if (!customer.email_verified) {
            return res.status(403).json({ 
                error: 'Por favor, verifica tu email antes de iniciar sesión',
                message: 'Se envió un enlace de verificación a tu correo'
            });
        }

        const isPasswordValid = await bcrypt.compare(customer_password, customer.customer_password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        res.status(200).json({
            message: 'Login exitoso',
            customer_id: customer.customer_id,
            customer_name: customer.customer_name,
            customer_email: customer.customer_email,
            customer_company: customer.customer_company
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER TODOS LOS CLIENTES
// ============================================
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            attributes: { exclude: ['customer_password'] }
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER CLIENTE POR ID
// ============================================
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id, {
            attributes: { exclude: ['customer_password'] }
        });

        if (!customer) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR CLIENTE
// ============================================
exports.updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        const { customer_name, customer_phone, customer_company, customer_image } = req.body;

        // Actualizar solo los campos permitidos
        await customer.update({
            customer_name: customer_name || customer.customer_name,
            customer_phone: customer_phone || customer.customer_phone,
            customer_company: customer_company || customer.customer_company,
            customer_image: customer_image !== undefined ? customer_image : customer.customer_image
        });

        const io = req.app.get('io');
        io.emit('customer_updated', customer);

        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ELIMINAR CLIENTE
// ============================================
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        const customerId = customer.customer_id;
        await customer.destroy();

        // ✅ Emitir evento con Socket.io
        const io = req.app.get('io');
        io.emit('customer_deleted', {
            customer_id: customerId
        });

        res.json({ message: 'Cliente eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CAMBIAR ESTADO DEL CLIENTE
// ============================================
exports.toggleCustomerStatus = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        customer.customer_status = !customer.customer_status;
        await customer.save();

        const io = req.app.get('io');
        io.emit('customer_status_updated', {
            customer_id: customer.customer_id,
            new_status: customer.customer_status
        });

        res.json({
            message: 'Estado actualizado',
            customer_name: customer.customer_name,
            new_status: customer.customer_status
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};