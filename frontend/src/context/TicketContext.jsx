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
            if (data && data.count !== undefined) {
                setUnassignedCount(data.count);
            }
        } catch (error) {
            console.error("Error al obtener tickets no asignados:", error);
        }
    }, []);

    const fetchActiveCount = useCallback(async () => {
        try {
            const data = await getActiveTicketCount();
            if (data && data.count !== undefined) {
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