// ============================================
// CONTROLADOR MÓVIL
// Gestiona todas las operaciones accesibles
// desde la aplicación móvil del cliente:
// autenticación propia (no SSO), registro en
// tres pasos con validación de garantía, flujo
// completo de tickets con evidencias, chat
// cifrado, calificaciones y perfil del cliente.
// Las rutas de este controlador están protegidas
// por mobileAuth (token en SecureStore), no por
// el JWT de admin.
// ============================================

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Op } = require("sequelize");
const Customer = require("../models/Customer");
const Warranty = require("../models/Warranty");
const WarrantyPolicy = require("../models/WarrantyPolicy");
const Faq = require("../models/Faqs");
const Category = require("../models/Category");
const Product = require("../models/Product");
const ProductModel = require("../models/ProductModel");
const Ticket = require("../models/Ticket");
const TicketEvidence = require("../models/TicketEvidence");
const TicketComment = require("../models/TicketComment");
const TicketCommentAttachment = require("../models/TicketCommentAttachment");
const TicketStatus = require("../models/TicketStatus");
const TicketAssignment = require("../models/TicketAssignment");
const Rating = require("../models/Rating");
const User = require("../models/User");
const sequelize = require("../config/database");
const { processEvidence } = require("../Middleware/ticketUpload");
const { uploadToFTP } = require("../Utils/ftpClient");
const { encrypt, decrypt } = require("../Utils/encryption");
const fs = require("fs");
const {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendPendingReviewEmail,
} = require("../config/email");

// ============================================
// INCLUDE ESTÁNDAR PARA LISTADOS DE TICKETS
// Usado en tickets activos e historial móvil.
// Solo carga los campos necesarios para la
// vista de lista, sin evidencias ni garantías.
// ============================================
const TICKET_LIST_INCLUDE = [
    {
        model: Category,
        as: "category",
        attributes: ["category_id", "category_name"],
    },
    {
        model: TicketStatus,
        as: "status",
        attributes: ["ticket_status_id", "ticket_status_name"],
    },
    {
        model: User,
        as: "assignedUsers",
        attributes: ["user_id", "nombre_completo", "foto"],
        through: { attributes: [] },
    },
];

// ============================================
// LOGIN MÓVIL
// Valida email, estado de la cuenta y
// verificación de correo antes de ejecutar
// bcrypt.compare para evitar hashes innecesarios
// en cuentas bloqueadas o no verificadas.
// No emite JWT; el token se gestiona en el
// middleware mobileAuth con SecureStore.
// ============================================
exports.mobileLogin = async (req, res) => {
    try {
        const { customer_email, customer_password } = req.body;

        if (!customer_email || !customer_password) {
            return res.status(400).json({ error: "Email y contraseña son requeridos." });
        }

        const cleanEmail = customer_email.trim().toLowerCase();
        const customer = await Customer.findOne({ where: { customer_email: cleanEmail } });

        if (!customer) {
            return res.status(401).json({ error: "Credenciales incorrectas." });
        }

        if (customer.customer_status === 0) {
            return res.status(403).json({
                error: "Tu cuenta está pendiente de revisión. Un administrador debe verificar tu registro antes de que puedas acceder.",
            });
        }

        if (!customer.email_verified) {
            return res.status(403).json({
                error: "Debes verificar tu correo electrónico antes de iniciar sesión.",
            });
        }

        if (!customer.customer_password) {
            return res.status(401).json({
                error: "Esta cuenta no tiene contraseña configurada. Contacta al soporte.",
            });
        }

        const isMatch = await bcrypt.compare(customer_password, customer.customer_password);
        if (!isMatch) {
            return res.status(401).json({ error: "Credenciales incorrectas." });
        }

        res.json({
            message: "Login exitoso.",
            customer: {
                customer_id: customer.customer_id,
                customer_first_name: customer.customer_first_name,
                customer_second_name: customer.customer_second_name,
                customer_last_name: customer.customer_last_name,
                customer_second_last_name: customer.customer_second_last_name,
                customer_email: customer.customer_email,
                customer_phone: customer.customer_phone,
                customer_country_code: customer.customer_country_code,
                customer_company: customer.customer_company,
                customer_image: customer.customer_image,
                customer_status: customer.customer_status,
            },
        });
    } catch (error) {
        console.error("Error en mobileLogin:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// ============================================
// REGISTRO MÓVIL (3 pasos)
// Flujo:
//  1. Sanitiza y valida campos de los 3 pasos.
//  2. Verifica unicidad de email y teléfono en
//     paralelo con Promise.all.
//  3. Valida garantía (serie o factura activa).
//     Si no existe, el cliente queda en status 0
//     y se envía correo de revisión pendiente.
//  4. Hashea contraseña, genera token de
//     verificación con expiración de 15 min.
//  5. Crea cliente y emite 'customer_created'.
//     Si requiere revisión emite adicionalmente
//     'customer_review_required' para el panel.
// ============================================
exports.mobileRegister = async (req, res) => {
    try {
        const {
            customer_first_name, customer_second_name,
            customer_last_name, customer_second_last_name,
            customer_email, customer_country_code,
            customer_phone, customer_company,
            validation_type, validation_value,
            customer_password, accepted_policy_version,
        } = req.body;

        const cleanFirst = customer_first_name?.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
        const cleanSecond = customer_second_name?.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "") || null;
        const cleanLast = customer_last_name?.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
        const cleanSecLast = customer_second_last_name?.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "") || null;
        const cleanEmail = customer_email?.trim().toLowerCase();
        const cleanPhone = customer_phone?.replace(/[^0-9]/g, "");
        const cleanCompany = customer_company?.trim();
        const cleanValue = validation_value?.trim();

        if (!cleanFirst || !cleanLast || !cleanEmail || !cleanPhone || !customer_country_code ||
            !cleanCompany || !validation_type || !cleanValue || !customer_password || !accepted_policy_version) {
            return res.status(400).json({ error: "Faltan campos obligatorios." });
        }

        if (!["serie", "factura"].includes(validation_type)) {
            return res.status(400).json({ error: "Tipo de verificación inválido." });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ error: "Formato de correo electrónico inválido." });
        }

        if (cleanFirst.length < 2) {
            return res.status(400).json({ error: "El primer nombre debe tener al menos 2 caracteres." });
        }

        const pwRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]).{12,}$/;
        if (!pwRegex.test(customer_password)) {
            return res.status(400).json({
                error: "La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
            });
        }

        // Verificar unicidad de email y teléfono en paralelo
        const [emailUsed, phoneUsed] = await Promise.all([
            Customer.findOne({ where: { customer_email: cleanEmail } }),
            Customer.findOne({ where: { customer_phone: cleanPhone } }),
        ]);
        if (emailUsed) return res.status(400).json({ error: "Este correo ya está registrado." });
        if (phoneUsed) return res.status(400).json({ error: "Este número de teléfono ya está registrado." });

        const warrantyWhere = validation_type === "serie"
            ? { warranty_serial_number: cleanValue, warranty_status: 1 }
            : { warranty_invoice_number: cleanValue, warranty_status: 1 };

        const warrantyExists = await Warranty.findOne({ where: warrantyWhere });
        const customerStatus = warrantyExists ? 1 : 0;
        const requiresReview = !warrantyExists;
        const hashedPassword = await bcrypt.hash(customer_password, 12);
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

        const newCustomer = await Customer.create({
            customer_first_name: cleanFirst,
            customer_second_name: cleanSecond,
            customer_last_name: cleanLast,
            customer_second_last_name: cleanSecLast,
            customer_email: cleanEmail,
            customer_phone: cleanPhone,
            customer_country_code,
            customer_company: cleanCompany,
            customer_registration_type: validation_type,
            customer_registration_value: cleanValue,
            customer_password: hashedPassword,
            customer_image: null,
            customer_status: customerStatus,
            email_verified: 0,
            verification_token: verificationToken,
            verification_token_expires: tokenExpires,
            accepted_policy_at: new Date(),
            accepted_policy_version,
        });

        const fullName = `${cleanFirst} ${cleanLast}`;
        if (requiresReview) {
            await sendPendingReviewEmail(cleanEmail, verificationToken, fullName, validation_type);
        } else {
            await sendVerificationEmail(cleanEmail, verificationToken, fullName, "15 minutos");
        }

        const io = req.app.get("io");
        if (io) {
            io.emit("customer_created", {
                customer_id: newCustomer.customer_id,
                full_name: fullName,
                status: customerStatus,
            });

            if (requiresReview) {
                io.emit("customer_review_required", {
                    customer_id: newCustomer.customer_id,
                    full_name: fullName,
                    validation_type,
                    validation_value: cleanValue,
                });
            }
        }

        res.status(201).json({
            message: requiresReview
                ? "Cuenta creada. La garantía no pudo verificarse automáticamente y está en revisión. Revisa tu correo para activar tu cuenta."
                : "Cuenta creada exitosamente. Revisa tu correo para activar tu cuenta.",
            customer_id: newCustomer.customer_id,
            requires_review: requiresReview,
        });
    } catch (error) {
        console.error("Error en mobileRegister:", error);
        res.status(500).json({ error: "Error interno al procesar el registro." });
    }
};

// ============================================
// VALIDAR GARANTÍA (Paso 2 del registro)
// Permite al cliente verificar si su número de
// serie o factura existe en el sistema antes de
// completar el registro, mostrando el estado de
// vigencia de la garantía encontrada.
// ============================================
exports.validateWarranty = async (req, res) => {
    try {
        const { type, value } = req.query;

        if (!type || !value) {
            return res.status(400).json({ error: 'Parámetros "type" y "value" requeridos.' });
        }

        if (!["serie", "factura"].includes(type)) {
            return res.status(400).json({ error: 'Tipo inválido. Use "serie" o "factura".' });
        }

        const where = type === "serie"
            ? { warranty_serial_number: value.trim(), warranty_status: 1 }
            : { warranty_invoice_number: value.trim(), warranty_status: 1 };

        const warranty = await Warranty.findOne({ where });

        if (!warranty) {
            return res.json({
                exists: false,
                message: type === "serie"
                    ? "El número de serie no se encontró en el sistema."
                    : "El número de factura no se encontró en el sistema.",
            });
        }

        res.json({
            exists: true,
            is_expired: warranty.is_expired,
            expiry_date: warranty.warranty_expiry_date,
            message: warranty.is_expired
                ? "La garantía existe pero ha expirado."
                : "Garantía verificada y vigente.",
        });
    } catch (error) {
        console.error("Error en validateWarranty:", error);
        res.status(500).json({ error: "Error al validar la garantía." });
    }
};

// ============================================
// OLVIDÉ MI CONTRASEÑA
// Genera un token de reset de 32 bytes con
// vigencia de 15 minutos y envía el correo.
// Si el email no existe o no está verificado,
// se responde con el mismo mensaje genérico
// para evitar enumeración de cuentas.
// Si ya hay un token vigente, responde 429
// con indicación de esperar.
// ============================================
exports.forgotPassword = async (req, res) => {
    try {
        const { customer_email } = req.body;

        if (!customer_email) {
            return res.status(400).json({ error: "El correo electrónico es requerido." });
        }

        const cleanEmail = customer_email.trim().toLowerCase();
        const customer = await Customer.findOne({ where: { customer_email: cleanEmail } });

        if (customer && customer.email_verified) {
            if (customer.reset_password_token && customer.reset_password_expires &&
                customer.reset_password_expires > new Date()) {
                return res.status(429).json({
                    error: "Ya tienes un enlace de recuperación activo. Revisa tu correo o espera 15 minutos para solicitar uno nuevo.",
                });
            }

            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

            await customer.update({
                reset_password_token: resetToken,
                reset_password_expires: resetExpires,
            });

            const fullName = `${customer.customer_first_name} ${customer.customer_last_name}`;
            await sendPasswordResetEmail(cleanEmail, resetToken, fullName);
        }

        res.json({
            message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña.",
        });
    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// ============================================
// RESTABLECER CONTRASEÑA
// Valida el token, verifica que no haya expirado
// y que la nueva contraseña sea distinta a la
// actual antes de persistir el hash bcrypt.
// Invalida el token al completar el proceso.
// ============================================
exports.resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) {
            return res.status(400).json({ error: "Token y nueva contraseña son requeridos." });
        }

        const pwRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]).{12,}$/;
        if (!pwRegex.test(new_password)) {
            return res.status(400).json({
                error: "La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
            });
        }

        const customer = await Customer.findOne({ where: { reset_password_token: token } });

        if (!customer || !customer.reset_password_expires || customer.reset_password_expires < new Date()) {
            return res.status(400).json({ error: "El enlace de recuperación es inválido o ha expirado." });
        }

        if (customer.customer_password) {
            const isSame = await bcrypt.compare(new_password, customer.customer_password);
            if (isSame) {
                return res.status(400).json({
                    error: "La nueva contraseña no puede ser igual a la contraseña actual.",
                });
            }
        }

        const hashedPassword = await bcrypt.hash(new_password, 12);

        await customer.update({
            customer_password: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null,
        });

        res.json({ message: "Contraseña restablecida exitosamente." });
    } catch (error) {
        console.error("Error en resetPassword:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// ============================================
// REDIRECCIÓN AL DEEP LINK DE RESET
// Genera una página HTML intermedia que redirige
// automáticamente al deep link de la app
// (tboxsasupport://auth/reset-password) con el
// token como parámetro. Incluye botón manual
// por si la redirección automática falla.
// ============================================
exports.resetRedirect = (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send("<p>Enlace inválido.</p>");
    }

    const deepLink = "tboxsasupport://auth/reset-password?token=" + token;

    res.send(
        `<!DOCTYPE html>
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
        </html>`,
    );
};

// ============================================
// OBTENER POLÍTICA DE GARANTÍA ACTIVA
// Devuelve la versión vigente de la política
// que el cliente debe aceptar durante el
// registro. Siempre retorna la más reciente
// con policy_is_active = 1.
// ============================================
exports.getWarrantyPolicy = async (req, res) => {
    try {
        const policy = await WarrantyPolicy.findOne({
            where: { policy_is_active: 1 },
            order: [["created_at", "DESC"]],
        });

        if (!policy) {
            return res.status(404).json({ error: "No hay política de garantía activa." });
        }

        res.json({
            policy_id: policy.policy_id,
            policy_version: policy.policy_version,
            policy_updated_label: policy.policy_updated_label,
            policy_content: policy.policy_content,
        });
    } catch (error) {
        console.error("Error en getWarrantyPolicy:", error);
        res.status(500).json({ error: "Error al obtener la política de garantía." });
    }
};

// ============================================
// FAQs MÓVIL
// Devuelve las preguntas frecuentes activas
// con sus relaciones de categoría, producto y
// modelo para que la app muestre los filtros
// correspondientes en la pantalla de FAQs.
// ============================================
exports.getMobileFaqs = async (req, res) => {
    try {
        const faqs = await Faq.findAll({
            where: { faq_status: true },
            include: [
                { model: Category, as: "category" },
                { model: Product, as: "product" },
                { model: ProductModel, as: "product_model" },
            ],
            order: [["faq_id", "ASC"]],
        });
        res.json(faqs);
    } catch (error) {
        console.error("Error en getMobileFaqs:", error);
        res.status(500).json({ error: "Error al obtener las preguntas frecuentes." });
    }
};

// ============================================
// CATEGORÍAS ACTIVAS (MÓVIL)
// Usadas en el formulario de creación de ticket
// para que el cliente clasifique su caso.
// ============================================
exports.getMobileCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { category_status: true },
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener categorías." });
    }
};

// ============================================
// PRODUCTOS POR CATEGORÍA (MÓVIL)
// Filtra los productos activos de la categoría
// seleccionada en el paso 2 del formulario de
// creación de ticket.
// ============================================
exports.getMobileProductsByCategory = async (req, res) => {
    try {
        const { category_id } = req.params;
        const products = await Product.findAll({
            where: { category_id, product_status: true },
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener productos." });
    }
};

// ============================================
// MODELOS POR PRODUCTO (MÓVIL)
// Filtra los modelos activos del producto
// seleccionado para el paso 3 del formulario.
// ============================================
exports.getMobileModelsByProduct = async (req, res) => {
    try {
        const { product_id } = req.params;
        const models = await ProductModel.findAll({
            where: { product_id, product_model_status: true },
        });
        res.json(models);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener modelos." });
    }
};

// ============================================
// CREAR TICKET MÓVIL
// Requiere al menos una evidencia adjunta.
// Valida la garantía del número de serie para
// determinar el estado inicial (1=Nuevo /
// 2=Revisión Garantía). Sube evidencias al FTP
// dentro de la misma transacción; si falla hace
// rollback y limpia los archivos temporales.
// Emite 'new_ticket_created' al panel admin.
// ============================================
exports.createMobileTicket = async (req, res) => {
    const t = await sequelize.transaction();
    const localFilesToCleanup = [];

    try {
        const {
            category_id, product_id, product_model_id,
            ticket_subject, ticket_description, ticket_serial_number,
        } = req.body;
        const customer_id = req.customer.customer_id;

        if (!category_id || !ticket_subject || !ticket_description) {
            return res.status(400).json({ error: "Faltan datos obligatorios." });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "Se requiere al menos una evidencia." });
        }

        let finalStatus = 1;
        if (ticket_serial_number) {
            const warranty = await Warranty.findOne({
                where: { warranty_serial_number: ticket_serial_number },
            });
            if (!warranty || warranty.is_expired) finalStatus = 2;
        } else {
            finalStatus = 2;
        }

        const newTicket = await Ticket.create({
            customer_id,
            category_id,
            product_id: product_id || null,
            product_model_id: product_model_id || null,
            ticket_status_id: finalStatus,
            ticket_subject,
            ticket_description,
            ticket_serial_number: ticket_serial_number || null,
            ticket_priority: null,
            ticket_status: 1,
        }, { transaction: t });

        for (const file of req.files) {
            const processed = await processEvidence(file);
            localFilesToCleanup.push(processed.filePath);
            const ftpUrl = await uploadToFTP(processed.filePath, processed.fileName);
            await TicketEvidence.create({
                ticket_id: newTicket.ticket_id,
                ticket_evidence_path: ftpUrl,
            }, { transaction: t });
        }

        await t.commit();
        localFilesToCleanup.forEach((p) => { if (fs.existsSync(p)) fs.unlinkSync(p); });

        const io = req.app.get("io");
        if (io) io.emit("new_ticket_created", newTicket);

        res.status(201).json({ message: "Ticket creado correctamente.", ticket: newTicket });
    } catch (error) {
        await t.rollback();
        localFilesToCleanup.forEach((p) => { if (fs.existsSync(p)) fs.unlinkSync(p); });
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// TICKETS ACTIVOS DEL CLIENTE (MÓVIL)
// Excluye estados 9 (Finalizado) y 10 (Cancelado)
// para mostrar únicamente los casos en curso.
// Usa TICKET_LIST_INCLUDE para evitar cargar
// datos innecesarios en la vista de lista.
// ============================================
exports.getMobileActiveTickets = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;

        const tickets = await Ticket.findAll({
            where: {
                customer_id,
                ticket_status_id: { [Op.notIn]: [9, 10] },
            },
            include: TICKET_LIST_INCLUDE,
            order: [["created_at", "DESC"]],
        });

        res.json(tickets);
    } catch (error) {
        console.error("Error en getMobileActiveTickets:", error);
        res.status(500).json({ error: "Error al obtener tickets activos." });
    }
};

// ============================================
// HISTORIAL DE TICKETS DEL CLIENTE (MÓVIL)
// Devuelve únicamente los tickets en estados
// 9 (Finalizado) y 10 (Cancelado) del cliente
// autenticado para la vista de historial.
// ============================================
exports.getMobileHistoryTickets = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;

        const tickets = await Ticket.findAll({
            where: {
                customer_id,
                ticket_status_id: { [Op.in]: [9, 10] },
            },
            include: TICKET_LIST_INCLUDE,
            order: [["created_at", "DESC"]],
        });

        res.json(tickets);
    } catch (error) {
        console.error("Error en getMobileHistoryTickets:", error);
        res.status(500).json({ error: "Error al obtener historial." });
    }
};

// ============================================
// CAMBIAR CONTRASEÑA (MÓVIL)
// Verifica la contraseña actual antes de
// aceptar la nueva. Valida que la nueva sea
// distinta a la actual y cumpla los requisitos
// de seguridad antes de hashear y persistir.
// ============================================
exports.changeMobilePassword = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ error: "Se requieren la contraseña actual y la nueva." });
        }

        const customer = await Customer.findByPk(customer_id);

        const isMatch = await bcrypt.compare(current_password, customer.customer_password);
        if (!isMatch) {
            return res.status(400).json({ error: "La contraseña actual es incorrecta." });
        }

        const isSame = await bcrypt.compare(new_password, customer.customer_password);
        if (isSame) {
            return res.status(400).json({ error: "La nueva contraseña debe ser diferente a la actual." });
        }

        const pwRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]).{12,}$/;
        if (!pwRegex.test(new_password)) {
            return res.status(400).json({ error: "La contraseña no cumple los requisitos de seguridad." });
        }

        const hashed = await bcrypt.hash(new_password, 12);
        await customer.update({ customer_password: hashed });

        res.json({ message: "Contraseña actualizada correctamente." });
    } catch (error) {
        console.error("Error en changeMobilePassword:", error);
        res.status(500).json({ error: "Error al cambiar la contraseña." });
    }
};

// ============================================
// ACTUALIZAR PERFIL DEL CLIENTE (MÓVIL)
// Solo actualiza los campos presentes en el body
// mediante un objeto dinámico, evitando
// sobrescribir campos no enviados. Si se adjunta
// imagen, la sube al FTP y limpia el temporal.
// Emite 'customer_updated' con los datos nuevos.
// ============================================
exports.updateMobileProfile = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;
        const {
            customer_first_name, customer_second_name,
            customer_last_name, customer_second_last_name,
            customer_phone, customer_country_code,
        } = req.body;

        const updates = {};
        if (customer_first_name?.trim()) updates.customer_first_name = customer_first_name.trim();
        if (customer_second_name !== undefined) updates.customer_second_name = customer_second_name?.trim() || null;
        if (customer_last_name?.trim()) updates.customer_last_name = customer_last_name.trim();
        if (customer_second_last_name !== undefined) updates.customer_second_last_name = customer_second_last_name?.trim() || null;
        if (customer_phone) updates.customer_phone = customer_phone.replace(/[^0-9]/g, "");
        if (customer_country_code) updates.customer_country_code = customer_country_code;

        if (req.file) {
            const processed = await processEvidence(req.file);
            const ftpUrl = await uploadToFTP(processed.filePath, processed.fileName);
            if (fs.existsSync(processed.filePath)) fs.unlinkSync(processed.filePath);
            updates.customer_image = ftpUrl;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No hay cambios para guardar." });
        }

        await Customer.update(updates, { where: { customer_id } });

        const updated = await Customer.findByPk(customer_id, {
            attributes: [
                "customer_id", "customer_first_name", "customer_second_name",
                "customer_last_name", "customer_second_last_name",
                "customer_email", "customer_phone", "customer_country_code",
                "customer_company", "customer_image", "customer_status",
            ],
        });

        const customerData = updated.toJSON();

        const io = req.app.get("io");
        if (io) io.emit("customer_updated", customerData);

        res.json({ customer: customerData });
    } catch (error) {
        console.error("Error en updateMobileProfile:", error);
        res.status(500).json({ error: "Error al actualizar el perfil." });
    }
};

// ============================================
// DETALLE DE UN TICKET (MÓVIL)
// Verifica que el ticket pertenezca al cliente
// autenticado antes de retornarlo. Carga la
// cadena completa: categoría, producto, modelo,
// estado, garantía y técnicos asignados.
// ============================================
exports.getMobileTicketDetail = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;
        const { id } = req.params;

        const ticket = await Ticket.findOne({
            where: { ticket_id: id, customer_id },
            include: [
                { model: Category, as: "category", attributes: ["category_id", "category_name"] },
                { model: Product, as: "product", attributes: ["product_id", "product_name"] },
                { model: ProductModel, as: "productModel", attributes: ["product_model_id", "product_model_name"] },
                { model: TicketStatus, as: "status", attributes: ["ticket_status_id", "ticket_status_name"] },
                { model: Warranty, as: "warranty", attributes: ["warranty_serial_number", "is_expired", "warranty_expiry_date"] },
                { model: User, as: "assignedUsers", attributes: ["user_id", "nombre_completo", "foto", "cargo"], through: { attributes: [] } },
            ],
        });

        if (!ticket) return res.status(404).json({ error: "Ticket no encontrado." });
        res.json(ticket);
    } catch (error) {
        console.error("Error en getMobileTicketDetail:", error);
        res.status(500).json({ error: "Error al obtener el ticket." });
    }
};

// ============================================
// COMENTARIOS DE UN TICKET (MÓVIL)
// Verifica la titularidad del ticket antes de
// retornar los comentarios. Descifra cada
// mensaje de forma silenciosa para mantener
// compatibilidad con mensajes históricos no
// cifrados.
// ============================================
exports.getMobileTicketComments = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;
        const { id } = req.params;

        const ticket = await Ticket.findOne({ where: { ticket_id: id, customer_id } });
        if (!ticket) return res.status(404).json({ error: "Ticket no encontrado." });

        const comments = await TicketComment.findAll({
            where: { ticket_id: id },
            include: [
                { model: User, as: "author", attributes: ["user_id", "nombre_completo", "foto", "rol"] },
                { model: Customer, as: "customerAuthor", attributes: ["customer_id", "customer_first_name", "customer_last_name", "customer_image"] },
                { model: TicketCommentAttachment, as: "attachments" },
            ],
            order: [["created_at", "ASC"]],
        });

        const decrypted = comments.map((c) => {
            const plain = c.toJSON();
            try { plain.comment_text = decrypt(plain.comment_text); } catch { }
            return plain;
        });

        res.json(decrypted);
    } catch (error) {
        console.error("Error en getMobileTicketComments:", error);
        res.status(500).json({ error: "Error al obtener comentarios." });
    }
};

// ============================================
// AGREGAR COMENTARIO AL TICKET (CLIENTE)
// Cifra el mensaje antes de persistirlo.
// Si el chat estaba pausado lo reanuda.
// Si el ticket estaba en "Pendiente de Info",
// lo avanza automáticamente a "En Proceso"
// consultando los estados en paralelo para
// evitar dependencia de IDs hardcodeados.
// Sube adjuntos al FTP y limpia temporales.
// Emite ticket_comment_{id}, new_comment y
// ticket_updated al panel administrativo.
// ============================================
exports.addMobileTicketComment = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;
        const { id } = req.params;
        const { comment_text } = req.body;

        if (!comment_text?.trim()) {
            return res.status(400).json({ error: "El mensaje no puede estar vacío." });
        }

        const ticket = await Ticket.findOne({ where: { ticket_id: id, customer_id } });
        if (!ticket) return res.status(404).json({ error: "Ticket no encontrado." });

        const comment = await TicketComment.create({
            ticket_id: id,
            customer_id,
            user_id: null,
            comment_text: encrypt(comment_text.trim()),
        });

        if (ticket.chat_paused) {
            await ticket.update({ chat_paused: 0 });
        }

        // Consultar estados "Pendiente Info" y "En Proceso" en paralelo para
        // avanzar el ticket automáticamente cuando el cliente responde,
        // sin depender de IDs hardcodeados en el código.
        const [pendingInfoStatus, procesoStatus] = await Promise.all([
            TicketStatus.findOne({
                where: sequelize.where(
                    sequelize.fn("LOWER", sequelize.col("ticket_status_name")),
                    { [Op.like]: "%pendiente%info%" }
                ),
            }),
            TicketStatus.findOne({
                where: sequelize.where(
                    sequelize.fn("LOWER", sequelize.col("ticket_status_name")),
                    { [Op.like]: "%proceso%" }
                ),
            }),
        ]);

        if (pendingInfoStatus && Number(ticket.ticket_status_id) === Number(pendingInfoStatus.ticket_status_id)) {
            if (procesoStatus) {
                await ticket.update({ ticket_status_id: procesoStatus.ticket_status_id });
            }
        }

        const localFilesToCleanup = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const processed = await processEvidence(file);
                localFilesToCleanup.push(processed.filePath);
                const ftpUrl = await uploadToFTP(processed.filePath, processed.fileName);
                await TicketCommentAttachment.create({
                    comment_id: comment.comment_id,
                    file_path: ftpUrl,
                    file_name: file.originalname,
                });
            }
            localFilesToCleanup.forEach((p) => { if (fs.existsSync(p)) fs.unlinkSync(p); });
        }

        const full = await TicketComment.findByPk(comment.comment_id, {
            include: [
                { model: Customer, as: "customerAuthor", attributes: ["customer_id", "customer_first_name", "customer_last_name", "customer_image"] },
                { model: TicketCommentAttachment, as: "attachments" },
            ],
        });

        const plain = full.toJSON();
        try { plain.comment_text = decrypt(plain.comment_text); } catch { plain.comment_text = comment_text.trim(); }

        const io = req.app.get("io");
        if (io) {
            io.emit(`ticket_comment_${id}`, plain);
            io.emit("new_comment", { ticket_id: parseInt(id), comment: plain });
            const updatedTicket = await Ticket.findByPk(id);
            if (updatedTicket) io.emit("ticket_updated", updatedTicket);
        }

        res.status(201).json(plain);
    } catch (error) {
        console.error("Error en addMobileTicketComment:", error);
        res.status(500).json({ error: "Error al enviar el mensaje." });
    }
};

// ============================================
// SOLICITAR CANCELACIÓN DEL TICKET (CLIENTE)
// Mueve el ticket al estado 8 (Solicitud de
// Cancelación) guardando el estado anterior
// para poder restaurarlo si el admin rechaza.
// Crea un comentario de sistema cifrado visible
// en el chat para informar al técnico.
// Emite ticket_comment, ticket_cancel_requested
// y ticket_updated al panel administrativo.
// ============================================
exports.requestTicketCancellation = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;
        const { id } = req.params;

        const ticket = await Ticket.findOne({ where: { ticket_id: id, customer_id } });
        if (!ticket) return res.status(404).json({ error: "Ticket no encontrado." });

        await ticket.update({
            ticket_status_id: 8,
            cancellation_requested: 1,
            cancellation_prev_status_id: ticket.ticket_status_id,
        });

        const CANCEL_MSG = "🔴 El cliente ha solicitado la cancelación de este ticket.";
        const comment = await TicketComment.create({
            ticket_id: id,
            customer_id,
            user_id: null,
            comment_text: encrypt(CANCEL_MSG),
        });

        const cancelCommentPayload = {
            ...comment.toJSON(),
            comment_text: CANCEL_MSG,
            attachments: [],
            author: null,
            customerAuthor: null,
        };

        const io = req.app.get("io");
        if (io) {
            io.emit(`ticket_comment_${id}`, cancelCommentPayload);
            io.emit("ticket_cancel_requested", { ticket_id: id, customer_id });
            io.emit("ticket_updated", ticket);
        }

        res.json({ message: "Solicitud de cancelación enviada correctamente." });
    } catch (error) {
        console.error("Error en requestTicketCancellation:", error);
        res.status(500).json({ error: "Error al procesar la solicitud." });
    }
};

// ============================================
// CALIFICAR TICKET (CLIENTE)
// Valida que el puntaje esté entre 1 y 5.
// La restricción de unicidad en la BD garantiza
// que un cliente no pueda calificar el mismo
// ticket más de una vez; el error de Sequelize
// se mapea a un 409 descriptivo.
// ============================================
exports.submitRating = async (req, res) => {
    try {
        const { id } = req.params;
        const customer_id = req.customer.customer_id;
        const { rating_score, rating_comment } = req.body;

        if (!rating_score || rating_score < 1 || rating_score > 5) {
            return res.status(400).json({ error: "Puntaje inválido (1-5)." });
        }

        await Rating.create({
            ticket_id: id,
            customer_id,
            rating_score: parseInt(rating_score),
            rating_comment: rating_comment?.trim() || null,
        });

        res.json({ message: "Calificación enviada correctamente." });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ error: "Ya calificaste este ticket." });
        }
        res.status(500).json({ error: error.message });
    }
};