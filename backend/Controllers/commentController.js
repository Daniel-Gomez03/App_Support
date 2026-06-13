// ============================================
// CONTROLADOR DE COMENTARIOS
// Gestiona el chat de soporte dentro de cada
// ticket. Los textos se almacenan cifrados y se
// descifran antes de enviarlos al cliente.
// Los archivos adjuntos se procesan localmente
// y se suben al servidor FTP; los temporales se
// eliminan siempre, incluso ante errores.
// ============================================

const TicketComment = require("../models/TicketComment");
const TicketCommentAttachment = require("../models/TicketCommentAttachment");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Customer = require("../models/Customer");
const { processEvidence } = require("../Middleware/ticketUpload");
const { uploadToFTP } = require("../Utils/ftpClient");
const { encrypt, decrypt } = require("../Utils/encryption");
const fs = require("fs");

// ============================================
// HELPER — DESCIFRAR TEXTO DE UN COMENTARIO
// Modifica el objeto plain en su lugar.
// El try/catch silencioso permite que mensajes
// no cifrados (legacy) se muestren tal cual.
// ============================================
const decryptComment = (comment) => {
    try {
        comment.comment_text = decrypt(comment.comment_text);
    } catch { }
    return comment;
};

// ============================================
// OBTENER COMENTARIOS DE UN TICKET
// Devuelve todos los mensajes ordenados por
// fecha ASC junto con su autor (usuario o
// cliente) y los archivos adjuntos de cada uno.
// ============================================
exports.getComments = async (req, res) => {
    try {
        const { id } = req.params;

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
                {
                    model: TicketCommentAttachment,
                    as: "attachments",
                },
            ],
            order: [["created_at", "ASC"]],
        });

        const decrypted = comments.map((c) => {
            const plain = c.toJSON();
            decryptComment(plain);
            return plain;
        });

        res.json(decrypted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// AGREGAR COMENTARIO A UN TICKET
// Cifra el texto antes de guardarlo. Si hay
// adjuntos los procesa y sube al FTP, luego
// elimina los archivos temporales locales.
// Emite cuatro eventos Socket.io:
//   · new_comment         → panel admin global
//   · ticket_comment_{id} → sala del ticket
//   · mobile_notification → app del cliente
//   · ticket_updated      → refresco del tablero
// Optimización: el ticket se consulta una sola
// vez para cubrir la notificación móvil y el
// evento ticket_updated.
// ============================================
exports.addComment = async (req, res) => {
    const localFilesToCleanup = [];

    try {
        const { id } = req.params;
        const { comment_text } = req.body;
        const { user_id } = req.user;

        if (!comment_text?.trim()) {
            return res.status(400).json({ error: "El comentario no puede estar vacío." });
        }

        const encryptedText = encrypt(comment_text.trim());

        const comment = await TicketComment.create({
            ticket_id: id,
            user_id,
            customer_id: null,
            comment_text: encryptedText,
        });

        // Procesar y subir adjuntos al FTP
        if (req.files?.length > 0) {
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
        }

        // Limpiar archivos temporales locales
        localFilesToCleanup.forEach((p) => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });

        // Obtener el comentario completo con relaciones para emitirlo
        const fullComment = await TicketComment.findByPk(comment.comment_id, {
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["user_id", "nombre_completo", "foto", "rol"],
                },
                {
                    model: TicketCommentAttachment,
                    as: "attachments",
                },
            ],
        });

        const plain = fullComment.toJSON();
        decryptComment(plain);

        // Consulta única del ticket para la notificación móvil y ticket_updated
        const ticket = await Ticket.findByPk(id);

        const io = req.app.get("io");
        if (io) {
            io.emit("new_comment", { ticket_id: parseInt(id), comment: plain });
            io.emit(`ticket_comment_${id}`, plain);

            if (ticket?.customer_id) {
                io.emit(`mobile_notification_${ticket.customer_id}`, {
                    type: "message",
                    ticketId: parseInt(id),
                    ticketSubject: ticket.ticket_subject,
                    senderName: plain.author?.nombre_completo ?? "Técnico",
                    messagePreview: comment_text.trim().substring(0, 80),
                    timestamp: new Date().toISOString(),
                });
            }

            if (ticket) io.emit("ticket_updated", ticket);
        }

        res.status(201).json(plain);
    } catch (error) {
        // Garantizar limpieza de temporales aunque haya error
        localFilesToCleanup.forEach((p) => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ELIMINAR COMENTARIO
// Solo el autor del comentario o un Admin pueden
// eliminarlo. Emite 'comment_deleted' con el
// ticket_id y comment_id para que el frontend
// retire el mensaje del chat en tiempo real.
// ============================================
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { user_id, rol } = req.user;

        const comment = await TicketComment.findByPk(commentId);
        if (!comment) return res.status(404).json({ error: "Comentario no encontrado." });

        if (rol !== "Admin" && comment.user_id !== user_id) {
            return res.status(403).json({ error: "No tienes permiso para eliminar este comentario." });
        }

        const ticket_id = comment.ticket_id;
        await comment.destroy();

        const io = req.app.get("io");
        if (io) {
            io.emit("comment_deleted", {
                ticket_id,
                comment_id: parseInt(commentId),
            });
        }

        res.json({ message: "Comentario eliminado correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};