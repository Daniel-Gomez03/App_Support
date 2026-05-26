// ============================================
// CONTEXT: TICKET CONTEXT
// Proveedor global de contadores de tickets en tiempo real.
// Alimenta los badges del sidebar ("Asignar Tickets" y "Tickets Activos").
//
// VALOR DEL CONTEXTO:
//   unassignedCount      — número de tickets sin asignar
//   fetchUnassignedCount — recarga el contador desde el servidor
//   setUnassignedCount   — actualización optimista del contador (sin fetch)
//   activeCount          — número de tickets activos
//   fetchActiveCount     — recarga el contador desde el servidor
//   setActiveCount       — actualización optimista del contador (sin fetch)
//
// FLUJO:
//   - Los contadores solo se cargan si el usuario tiene permissions_read === 1
//     en el módulo correspondiente ("Asignar Tickets" / "Tickets Activos").
//     Esto evita llamadas innecesarias al API para usuarios sin acceso.
//   - Los listeners de socket se registran solo si el usuario tiene al menos
//     uno de los dos permisos. El cleanup desregistra los handlers exactos
//     (no solo el nombre del evento) para evitar que queden handlers huérfanos
//     si el efecto se re-ejecuta por cambio de user o socket.
//
// EVENTOS SOCKET:
//   new_ticket_created — incrementa unassignedCount (+1 optimista) si el ticket
//                        tiene status 1/2/3; recarga activeCount si aplica.
//   ticket_updated     — recarga ambos contadores (cambio de estado/asignación).
// ============================================

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getUnassignedTicketCount, getActiveTicketCount } from '../services/Ticketservice';
import { useAuth } from './AuthContext';

const TicketContext = createContext();

export const useTickets = () => useContext(TicketContext);

export const TicketProvider = ({ children }) => {
    const [unassignedCount, setUnassignedCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);

    const { user, socket } = useAuth();

    const fetchUnassignedCount = useCallback(async () => {
        try {
            const data = await getUnassignedTicketCount();
            if (data?.count !== undefined) {
                setUnassignedCount(data.count);
            }
        } catch (error) {
            console.error("Error al obtener tickets no asignados:", error);
        }
    }, []);

    const fetchActiveCount = useCallback(async () => {
        try {
            const data = await getActiveTicketCount();
            if (data?.count !== undefined) {
                setActiveCount(data.count);
            }
        } catch (error) {
            console.error("Error al obtener conteo de tickets activos:", error);
        }
    }, []);

    useEffect(() => {
        const canAssign = user?.Permissions?.some(p =>
            p.Seccion?.module_name === "Asignar Tickets" && p.permissions_read === 1
        );
        const canViewActive = user?.Permissions?.some(p =>
            p.Seccion?.module_name === "Tickets Activos" && p.permissions_read === 1
        );

        if (canAssign) fetchUnassignedCount();
        if (canViewActive) fetchActiveCount();

        if (socket && (canAssign || canViewActive)) {
            const handleNewTicket = (newTicket) => {
                if (canAssign && [1, 2, 3].includes(newTicket.ticket_status_id)) {
                    setUnassignedCount(prev => prev + 1);
                }
                if (canViewActive) {
                    fetchActiveCount();
                }
            };

            const handleTicketUpdate = () => {
                if (canAssign) fetchUnassignedCount();
                if (canViewActive) fetchActiveCount();
            };

            socket.on('new_ticket_created', handleNewTicket);
            socket.on('ticket_updated', handleTicketUpdate);

            return () => {
                socket.off('new_ticket_created', handleNewTicket);
                socket.off('ticket_updated', handleTicketUpdate);
            };
        }
    }, [user, socket, fetchUnassignedCount, fetchActiveCount]);

    return (
        <TicketContext.Provider value={{
            unassignedCount, fetchUnassignedCount, setUnassignedCount,
            activeCount, fetchActiveCount, setActiveCount
        }}>
            {children}
        </TicketContext.Provider>
    );
};