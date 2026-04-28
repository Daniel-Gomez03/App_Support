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
// LOGIN MÓVIL
// ============================================
exports.mobileLogin = async (req, res) => {
    try {
        const { customer_email, customer_password } = req.body;

        if (!customer_email || !customer_password) {
            return res
                .status(400)
                .json({ error: "Email y contraseña son requeridos." });
        }

        const cleanEmail = customer_email.trim().toLowerCase();

        const customer = await Customer.findOne({
            where: { customer_email: cleanEmail },
        });

        if (!customer) {
            return res.status(401).json({ error: "Credenciales incorrectas." });
        }

        if (customer.customer_status === 0) {
            return res.status(403).json({
                error:
                    "Tu cuenta está pendiente de revisión. Un administrador debe verificar tu registro antes de que puedas acceder.",
            });
        }

        if (!customer.email_verified) {
            return res.status(403).json({
                error: "Debes verificar tu correo electrónico antes de iniciar sesión.",
            });
        }

        if (!customer.customer_password) {
            return res.status(401).json({
                error:
                    "Esta cuenta no tiene contraseña configurada. Contacta al soporte.",
            });
        }

        const isMatch = await bcrypt.compare(
            customer_password,
            customer.customer_password,
        );
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
            validation_type,
            validation_value,
            // Paso 3
            customer_password,
            // Política
            accepted_policy_version,
        } = req.body;

        const cleanFirst = customer_first_name
            ?.trim()
            .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
        const cleanSecond =
            customer_second_name?.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "") ||
            null;
        const cleanLast = customer_last_name
            ?.trim()
            .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
        const cleanSecLast =
            customer_second_last_name
                ?.trim()
                .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "") || null;
        const cleanEmail = customer_email?.trim().toLowerCase();
        const cleanPhone = customer_phone?.replace(/[^0-9]/g, "");
        const cleanCompany = customer_company?.trim();
        const cleanValue = validation_value?.trim();

        if (
            !cleanFirst ||
            !cleanLast ||
            !cleanEmail ||
            !cleanPhone ||
            !customer_country_code ||
            !cleanCompany ||
            !validation_type ||
            !cleanValue ||
            !customer_password ||
            !accepted_policy_version
        ) {
            return res.status(400).json({ error: "Faltan campos obligatorios." });
        }

        if (!["serie", "factura"].includes(validation_type)) {
            return res.status(400).json({ error: "Tipo de verificación inválido." });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(cleanEmail)) {
            return res
                .status(400)
                .json({ error: "Formato de correo electrónico inválido." });
        }

        if (cleanFirst.length < 2) {
            return res
                .status(400)
                .json({ error: "El primer nombre debe tener al menos 2 caracteres." });
        }

        const pwRegex =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]).{12,}$/;
        if (!pwRegex.test(customer_password)) {
            return res.status(400).json({
                error:
                    "La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
            });
        }

        const emailUsed = await Customer.findOne({
            where: { customer_email: cleanEmail },
        });
        if (emailUsed)
            return res.status(400).json({ error: "Este correo ya está registrado." });

        const phoneUsed = await Customer.findOne({
            where: { customer_phone: cleanPhone },
        });
        if (phoneUsed)
            return res
                .status(400)
                .json({ error: "Este número de teléfono ya está registrado." });

        const warrantyWhere =
            validation_type === "serie"
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
            accepted_policy_version: accepted_policy_version,
        });

        const fullName = `${cleanFirst} ${cleanLast}`;
        if (requiresReview) {
            await sendPendingReviewEmail(
                cleanEmail,
                verificationToken,
                fullName,
                validation_type,
            );
        } else {
            await sendVerificationEmail(
                cleanEmail,
                verificationToken,
                fullName,
                "15 minutos",
            );
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
                    validation_type: validation_type,
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
// ============================================
exports.validateWarranty = async (req, res) => {
    try {
        const { type, value } = req.query;

        if (!type || !value) {
            return res
                .status(400)
                .json({ error: 'Parámetros "type" y "value" requeridos.' });
        }

        if (!["serie", "factura"].includes(type)) {
            return res
                .status(400)
                .json({ error: 'Tipo inválido. Use "serie" o "factura".' });
        }

        const where =
            type === "serie"
                ? { warranty_serial_number: value.trim(), warranty_status: 1 }
                : { warranty_invoice_number: value.trim(), warranty_status: 1 };

        const warranty = await Warranty.findOne({ where });

        if (!warranty) {
            return res.json({
                exists: false,
                message:
                    type === "serie"
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
// FORGOT PASSWORD — genera token y envía email
// ============================================
exports.forgotPassword = async (req, res) => {
    try {
        const { customer_email } = req.body;

        if (!customer_email) {
            return res
                .status(400)
                .json({ error: "El correo electrónico es requerido." });
        }

        const cleanEmail = customer_email.trim().toLowerCase();

        const customer = await Customer.findOne({
            where: { customer_email: cleanEmail },
        });

        if (customer && customer.email_verified) {
            if (
                customer.reset_password_token &&
                customer.reset_password_expires &&
                customer.reset_password_expires > new Date()
            ) {
                return res.status(429).json({
                    error:
                        "Ya tienes un enlace de recuperación activo. Revisa tu correo o espera 15 minutos para solicitar uno nuevo.",
                });
            }

            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

            await customer.update({
                reset_password_token: resetToken,
                reset_password_expires: resetExpires,
            });

            const fullName =
                customer.customer_first_name + " " + customer.customer_last_name;
            await sendPasswordResetEmail(cleanEmail, resetToken, fullName);
        }

        res.json({
            message:
                "Si el correo existe, recibirás un enlace para restablecer tu contraseña.",
        });
    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// ============================================
// RESET PASSWORD — valida token y cambia contraseña
// ============================================
exports.resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) {
            return res
                .status(400)
                .json({ error: "Token y nueva contraseña son requeridos." });
        }

        const pwRegex =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]).{12,}$/;
        if (!pwRegex.test(new_password)) {
            return res.status(400).json({
                error:
                    "La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
            });
        }

        const customer = await Customer.findOne({
            where: { reset_password_token: token },
        });

        if (
            !customer ||
            !customer.reset_password_expires ||
            customer.reset_password_expires < new Date()
        ) {
            return res.status(400).json({
                error: "El enlace de recuperación es inválido o ha expirado.",
            });
        }

        if (customer.customer_password) {
            const isSame = await bcrypt.compare(
                new_password,
                customer.customer_password,
            );
            if (isSame) {
                return res.status(400).json({
                    error:
                        "La nueva contraseña no puede ser igual a la contraseña actual.",
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
// RESET REDIRECT — página HTML que redirige al deep link
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
// ============================================
exports.getWarrantyPolicy = async (req, res) => {
    try {
        const policy = await WarrantyPolicy.findOne({
            where: { policy_is_active: 1 },
            order: [["created_at", "DESC"]],
        });

        if (!policy) {
            return res
                .status(404)
                .json({ error: "No hay política de garantía activa." });
        }

        res.json({
            policy_id: policy.policy_id,
            policy_version: policy.policy_version,
            policy_updated_label: policy.policy_updated_label,
            policy_content: policy.policy_content,
        });
    } catch (error) {
        console.error("Error en getWarrantyPolicy:", error);
        res
            .status(500)
            .json({ error: "Error al obtener la política de garantía." });
    }
};

// ============================================
// FAQs MÓVIL (protegido por mobileAuth)
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
        res
            .status(500)
            .json({ error: "Error al obtener las preguntas frecuentes." });
    }
};

// ============================================
// CATEGORÍAS PARA CREAR TICKET (MÓVIL)
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
// CREAR TICKET MÓVIL (evidencia obligatoria)
// ============================================
exports.createMobileTicket = async (req, res) => {
    const t = await sequelize.transaction();
    const localFilesToCleanup = [];

    try {
        const {
            category_id,
            product_id,
            product_model_id,
            ticket_subject,
            ticket_description,
            ticket_serial_number,
        } = req.body;
        const customer_id = req.customer.customer_id;

        if (!category_id || !ticket_subject || !ticket_description) {
            return res.status(400).json({ error: "Faltan datos obligatorios." });
        }

        if (!req.files || req.files.length === 0) {
            return res
                .status(400)
                .json({ error: "Se requiere al menos una evidencia." });
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

        const newTicket = await Ticket.create(
            {
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
            },
            { transaction: t },
        );

        for (const file of req.files) {
            const processed = await processEvidence(file);
            localFilesToCleanup.push(processed.filePath);
            const ftpUrl = await uploadToFTP(processed.filePath, processed.fileName);
            await TicketEvidence.create(
                {
                    ticket_id: newTicket.ticket_id,
                    ticket_evidence_path: ftpUrl,
                },
                { transaction: t },
            );
        }

        await t.commit();
        localFilesToCleanup.forEach((p) => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });

        const io = req.app.get("io");
        if (io) io.emit("new_ticket_created", newTicket);

        res
            .status(201)
            .json({ message: "Ticket creado correctamente.", ticket: newTicket });
    } catch (error) {
        await t.rollback();
        localFilesToCleanup.forEach((p) => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// TICKETS ACTIVOS DEL CLIENTE (MÓVIL)
// ============================================
exports.getMobileActiveTickets = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;

        const tickets = await Ticket.findAll({
            where: {
                customer_id,
                ticket_status_id: { [Op.notIn]: [9, 10] },
            },
            include: [
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
            ],
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
// ============================================
exports.getMobileHistoryTickets = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;

        const tickets = await Ticket.findAll({
            where: {
                customer_id,
                ticket_status_id: { [Op.in]: [9, 10] },
            },
            include: [
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
            ],
            order: [["created_at", "DESC"]],
        });

        res.json(tickets);
    } catch (error) {
        console.error("Error en getMobileHistoryTickets:", error);
        res.status(500).json({ error: "Error al obtener historial." });
    }
};

// ============================================
// DETALLE DE UN TICKET (MÓVIL)
// ============================================
exports.getMobileTicketDetail = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;
        const { id } = req.params;

        const ticket = await Ticket.findOne({
            where: { ticket_id: id, customer_id },
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["category_id", "category_name"],
                },
                {
                    model: Product,
                    as: "product",
                    attributes: ["product_id", "product_name"],
                },
                {
                    model: ProductModel,
                    as: "productModel",
                    attributes: ["product_model_id", "product_model_name"],
                },
                {
                    model: TicketStatus,
                    as: "status",
                    attributes: ["ticket_status_id", "ticket_status_name"],
                },
                {
                    model: Warranty,
                    as: "warranty",
                    attributes: [
                        "warranty_serial_number",
                        "is_expired",
                        "warranty_expiry_date",
                    ],
                },
                {
                    model: User,
                    as: "assignedUsers",
                    attributes: ["user_id", "nombre_completo", "foto", "cargo"],
                    through: { attributes: [] },
                },
            ],
        });

        if (!ticket)
            return res.status(404).json({ error: "Ticket no encontrado." });
        res.json(ticket);
    } catch (error) {
        console.error("Error en getMobileTicketDetail:", error);
        res.status(500).json({ error: "Error al obtener el ticket." });
    }
};

// ============================================
// COMENTARIOS DE UN TICKET (MÓVIL)
// ============================================
exports.getMobileTicketComments = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;
        const { id } = req.params;

        const ticket = await Ticket.findOne({
            where: { ticket_id: id, customer_id },
        });
        if (!ticket)
            return res.status(404).json({ error: "Ticket no encontrado." });

        const comments = await TicketComment.findAll({
            where: { ticket_id: id },
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["user_id", "nombre_completo", "foto", "rol"],
                },
                {
                    model: Customer,
                    as: "customerAuthor",
                    attributes: [
                        "customer_id",
                        "customer_first_name",
                        "customer_last_name",
                        "customer_image",
                    ],
                },
                { model: TicketCommentAttachment, as: "attachments" },
            ],
            order: [["created_at", "ASC"]],
        });

        const decrypted = comments.map((c) => {
            const plain = c.toJSON();
            try {
                plain.comment_text = decrypt(plain.comment_text);
            } catch {
            }
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
// ============================================
exports.addMobileTicketComment = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;
        const { id } = req.params;
        const { comment_text } = req.body;

        if (!comment_text?.trim()) {
            return res
                .status(400)
                .json({ error: "El mensaje no puede estar vacío." });
        }

        const ticket = await Ticket.findOne({
            where: { ticket_id: id, customer_id },
        });
        if (!ticket)
            return res.status(404).json({ error: "Ticket no encontrado." });

        const comment = await TicketComment.create({
            ticket_id: id,
            customer_id,
            user_id: null,
            comment_text: encrypt(comment_text.trim()),
        });

        const localFilesToCleanup = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const processed = await processEvidence(file);
                localFilesToCleanup.push(processed.filePath);
                const ftpUrl = await uploadToFTP(
                    processed.filePath,
                    processed.fileName,
                );
                await TicketCommentAttachment.create({
                    comment_id: comment.comment_id,
                    file_path: ftpUrl,
                    file_name: file.originalname,
                });
            }
            localFilesToCleanup.forEach((p) => {
                if (fs.existsSync(p)) fs.unlinkSync(p);
            });
        }

        const full = await TicketComment.findByPk(comment.comment_id, {
            include: [
                {
                    model: Customer,
                    as: "customerAuthor",
                    attributes: [
                        "customer_id",
                        "customer_first_name",
                        "customer_last_name",
                        "customer_image",
                    ],
                },
                { model: TicketCommentAttachment, as: "attachments" },
            ],
        });

        const plain = full.toJSON();
        try {
            plain.comment_text = decrypt(plain.comment_text);
        } catch {
            plain.comment_text = comment_text.trim();
        }

        const io = req.app.get("io");
        if (io) {
            io.emit(`ticket_comment_${id}`, plain);
            io.emit("new_comment", { ticket_id: parseInt(id), comment: plain });
        }

        res.status(201).json(plain);
    } catch (error) {
        console.error("Error en addMobileTicketComment:", error);
        res.status(500).json({ error: "Error al enviar el mensaje." });
    }
};

// ============================================
// SOLICITAR CANCELACIÓN DEL TICKET (CLIENTE)
// ============================================
exports.requestTicketCancellation = async (req, res) => {
    try {
        const customer_id = req.customer.customer_id;
        const { id } = req.params;

        const ticket = await Ticket.findOne({
            where: { ticket_id: id, customer_id },
        });
        if (!ticket)
            return res.status(404).json({ error: "Ticket no encontrado." });

        const comment = await TicketComment.create({
            ticket_id: id,
            customer_id,
            user_id: null,
            comment_text:
                "🔴 El cliente ha solicitado la cancelación de este ticket.",
        });

        const io = req.app.get("io");
        if (io) {
            io.emit(`ticket_comment_${id}`, comment);
            io.emit("ticket_cancel_requested", { ticket_id: id, customer_id });
        }

        res.json({ message: "Solicitud de cancelación enviada correctamente." });
    } catch (error) {
        console.error("Error en requestTicketCancellation:", error);
        res.status(500).json({ error: "Error al procesar la solicitud." });
    }
};
