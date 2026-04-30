const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

// ============================================
// ESTADÍSTICAS GENERALES DEL DASHBOARD
// ============================================
exports.getDashboardStats = async (req, res) => {
    try {
        const now          = new Date();
        const thisYear     = now.getFullYear();
        const thisMonth    = now.getMonth() + 1;
        const lastMonth    = thisMonth === 1 ? 12 : thisMonth - 1;
        const lastMonthYr  = thisMonth === 1 ? thisYear - 1 : thisYear;
        const twoAgoMonth  = lastMonth === 1 ? 12 : lastMonth - 1;
        const twoAgoYr     = lastMonth  === 1 ? lastMonthYr - 1 : lastMonthYr;

        const [
            [pendientesNow],
            [pendientesPrev],
            [finalizadosNow],
            [finalizadosPrev],
            [mesActualRow],
            [mesAnteriorRow],
            [dosMesesRow],
            priorities,
            casesByUser,
            [pendingCases],
            recentFeedback,
        ] = await Promise.all([

            // Tickets activos totales (estado 1-8)
            sequelize.query(
                `SELECT COUNT(*) AS count FROM tickets
                 WHERE ticket_status_id BETWEEN 1 AND 8 AND ticket_status = 1`,
                { type: QueryTypes.SELECT }
            ),

            // Activos creados el mes pasado (referencia para % pendientes)
            sequelize.query(
                `SELECT COUNT(*) AS count FROM tickets
                 WHERE ticket_status_id BETWEEN 1 AND 8
                   AND YEAR(created_at) = ${lastMonthYr} AND MONTH(created_at) = ${lastMonth}`,
                { type: QueryTypes.SELECT }
            ),

            // Finalizados (estado 9) este mes
            sequelize.query(
                `SELECT COUNT(*) AS count FROM tickets
                 WHERE ticket_status_id = 9
                   AND YEAR(updated_at) = ${thisYear} AND MONTH(updated_at) = ${thisMonth}`,
                { type: QueryTypes.SELECT }
            ),

            // Finalizados mes anterior
            sequelize.query(
                `SELECT COUNT(*) AS count FROM tickets
                 WHERE ticket_status_id = 9
                   AND YEAR(updated_at) = ${lastMonthYr} AND MONTH(updated_at) = ${lastMonth}`,
                { type: QueryTypes.SELECT }
            ),

            // Tickets creados este mes
            sequelize.query(
                `SELECT COUNT(*) AS count FROM tickets
                 WHERE YEAR(created_at) = ${thisYear} AND MONTH(created_at) = ${thisMonth}`,
                { type: QueryTypes.SELECT }
            ),

            // Tickets creados mes anterior
            sequelize.query(
                `SELECT COUNT(*) AS count FROM tickets
                 WHERE YEAR(created_at) = ${lastMonthYr} AND MONTH(created_at) = ${lastMonth}`,
                { type: QueryTypes.SELECT }
            ),

            // Tickets creados hace dos meses
            sequelize.query(
                `SELECT COUNT(*) AS count FROM tickets
                 WHERE YEAR(created_at) = ${twoAgoYr} AND MONTH(created_at) = ${twoAgoMonth}`,
                { type: QueryTypes.SELECT }
            ),

            // Distribución por prioridad (tickets activos)
            sequelize.query(
                `SELECT ticket_priority, COUNT(*) AS count
                 FROM tickets
                 WHERE ticket_status_id BETWEEN 1 AND 8 AND ticket_status = 1
                 GROUP BY ticket_priority`,
                { type: QueryTypes.SELECT }
            ),

            // Casos por técnico asignado — estados 4 al 10
            sequelize.query(
                `SELECT
                    u.nombre_completo                                                           AS usuario,
                    SUM(CASE WHEN t.ticket_status_id = 4  THEN 1 ELSE 0 END)                  AS asignado,
                    SUM(CASE WHEN t.ticket_status_id = 5  THEN 1 ELSE 0 END)                  AS enProceso,
                    SUM(CASE WHEN t.ticket_status_id = 6  THEN 1 ELSE 0 END)                  AS pendienteInfo,
                    SUM(CASE WHEN t.ticket_status_id = 7  THEN 1 ELSE 0 END)                  AS escalado,
                    SUM(CASE WHEN t.ticket_status_id = 8  THEN 1 ELSE 0 END)                  AS solCancelacion,
                    SUM(CASE WHEN t.ticket_status_id = 9  THEN 1 ELSE 0 END)                  AS finalizado,
                    SUM(CASE WHEN t.ticket_status_id = 10 THEN 1 ELSE 0 END)                  AS cancelado
                 FROM ticket_assignments ta
                 JOIN users   u ON ta.user_id   = u.user_id
                 JOIN tickets t ON ta.ticket_id = t.ticket_id
                 WHERE t.ticket_status = 1
                   AND t.ticket_status_id BETWEEN 4 AND 10
                 GROUP BY u.user_id, u.nombre_completo
                 ORDER BY SUM(CASE WHEN t.ticket_status_id BETWEEN 4 AND 8 THEN 1 ELSE 0 END) DESC`,
                { type: QueryTypes.SELECT }
            ),

            // Resumen global por estado (todos los estados del tablero)
            sequelize.query(
                `SELECT
                    SUM(CASE WHEN ticket_status_id = 1  THEN 1 ELSE 0 END) AS nuevo,
                    SUM(CASE WHEN ticket_status_id = 2  THEN 1 ELSE 0 END) AS revisionGarantia,
                    SUM(CASE WHEN ticket_status_id = 3  THEN 1 ELSE 0 END) AS porAsignar,
                    SUM(CASE WHEN ticket_status_id = 4  THEN 1 ELSE 0 END) AS asignado,
                    SUM(CASE WHEN ticket_status_id = 5  THEN 1 ELSE 0 END) AS enProceso,
                    SUM(CASE WHEN ticket_status_id = 6  THEN 1 ELSE 0 END) AS pendienteInfo,
                    SUM(CASE WHEN ticket_status_id = 7  THEN 1 ELSE 0 END) AS escalado,
                    SUM(CASE WHEN ticket_status_id = 8  THEN 1 ELSE 0 END) AS solCancelacion,
                    SUM(CASE WHEN ticket_status_id = 9  THEN 1 ELSE 0 END) AS finalizado,
                    SUM(CASE WHEN ticket_status_id = 10 THEN 1 ELSE 0 END) AS cancelado
                 FROM tickets
                 WHERE ticket_status = 1`,
                { type: QueryTypes.SELECT }
            ),

            // Promedio de calificaciones por técnico (agrupado para evitar duplicados)
            sequelize.query(
                `SELECT
                    u.user_id,
                    u.nombre_completo                                              AS name,
                    ROUND(AVG(r.rating_score), 1)                                 AS rating,
                    COUNT(DISTINCT r.rating_id)                                    AS totalRatings,
                    CASE
                        WHEN u.foto IS NOT NULL AND u.foto != '' AND u.foto != 'default.jpg'
                        THEN CONCAT('http://localhost:8000/uploads/profiles/', u.foto)
                        ELSE NULL
                    END                                                            AS avatar
                 FROM users u
                 JOIN ticket_assignments ta ON ta.user_id  = u.user_id
                 JOIN ratings            r  ON r.ticket_id = ta.ticket_id
                 GROUP BY u.user_id, u.nombre_completo, u.foto
                 ORDER BY AVG(r.rating_score) DESC
                 LIMIT 5`,
                { type: QueryTypes.SELECT }
            ),
        ]);

        // Función para calcular porcentaje de cambio
        const pct = (current, previous) => {
            const c = parseInt(current) || 0;
            const p = parseInt(previous) || 0;
            if (p === 0) return c > 0 ? 100 : 0;
            return Math.round(((c - p) / p) * 100);
        };

        // Mapear prioridades
        const priorityMap = { Alta: 0, Media: 0, Baja: 0 };
        priorities.forEach(row => {
            if (row.ticket_priority && row.ticket_priority in priorityMap) {
                priorityMap[row.ticket_priority] = parseInt(row.count) || 0;
            }
        });
        const prioritiesData = [
            { name: 'Alta',  value: priorityMap.Alta,  color: '#DC2626' },
            { name: 'Media', value: priorityMap.Media, color: '#EAB308' },
            { name: 'Baja',  value: priorityMap.Baja,  color: '#105030' },
        ];

        const pendientes  = parseInt(pendientesNow.count)  || 0;
        const prevPend    = parseInt(pendientesPrev.count)  || 0;
        const finalizados = parseInt(finalizadosNow.count)  || 0;
        const prevFin     = parseInt(finalizadosPrev.count) || 0;
        const mesActual   = parseInt(mesActualRow.count)    || 0;
        const mesAnterior = parseInt(mesAnteriorRow.count)  || 0;
        const dosMeses    = parseInt(dosMesesRow.count)     || 0;

        res.json({
            cards: {
                pendientes,
                pendientesPct:   pct(pendientes,  prevPend),
                finalizados,
                finalizadosPct:  pct(finalizados, prevFin),
                mesActual,
                mesActualPct:    pct(mesActual,   mesAnterior),
                mesAnterior,
                mesAnteriorPct:  pct(mesAnterior, dosMeses),
            },
            priorities: prioritiesData,
            casesByUser,
            pendingCases: pendingCases || { nuevo: 0, enProceso: 0, pendienteInfo: 0, escalado: 0, resuelto: 0 },
            recentFeedback,
        });
    } catch (error) {
        console.error('getDashboardStats error:', error);
        res.status(500).json({ error: error.message });
    }
};