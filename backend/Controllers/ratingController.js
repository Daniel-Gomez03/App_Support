const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

// ============================================
// OBTENER TODAS LAS CALIFICACIONES
// ============================================
exports.getRatings = async (req, res) => {
    try {
        const ratings = await sequelize.query(`
            SELECT
                r.rating_id,
                r.rating_score,
                r.rating_comment,
                r.rating_createdAt,
                r.ticket_id,
                t.ticket_subject,
                c.customer_first_name,
                c.customer_last_name,
                c.customer_image,
                c.customer_company,
                (
                    SELECT GROUP_CONCAT(u2.nombre_completo ORDER BY u2.nombre_completo SEPARATOR '|||')
                    FROM ticket_assignments ta2
                    JOIN users u2 ON ta2.user_id = u2.user_id
                    WHERE ta2.ticket_id = t.ticket_id
                ) AS tech_names,
                (
                    SELECT GROUP_CONCAT(COALESCE(u2.foto, '') ORDER BY u2.nombre_completo SEPARATOR '|||')
                    FROM ticket_assignments ta2
                    JOIN users u2 ON ta2.user_id = u2.user_id
                    WHERE ta2.ticket_id = t.ticket_id
                ) AS tech_fotos
            FROM ratings r
            JOIN tickets  t ON r.ticket_id   = t.ticket_id
            JOIN customers c ON r.customer_id = c.customer_id
            ORDER BY r.rating_createdAt DESC
        `, { type: QueryTypes.SELECT });

        res.json(ratings);
    } catch (error) {
        console.error('getRatings error:', error);
        res.status(500).json({ error: error.message });
    }
};