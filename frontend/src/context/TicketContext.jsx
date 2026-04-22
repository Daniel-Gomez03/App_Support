import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getUnassignedTicketCount } from '../services/Ticketservice';
import { useAuth } from './AuthContext';

const TicketContext = createContext();

export const useTickets = () => useContext(TicketContext);

export const TicketProvider = ({ children }) => {
    const [unassignedCount, setUnassignedCount] = useState(0);
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

    useEffect(() => {
        const canAssign = user?.Permissions?.some(p =>
            p.Seccion?.module_name === "Asignar Tickets" && p.permissions_read === 1
        );

        if (canAssign) {
            fetchUnassignedCount();

            if (socket) {
                const handleNewTicket = (newTicket) => {
                    if (newTicket.ticket_status_id === 1 || newTicket.ticket_status_id === 2 || ticket_status_id === 3) {
                        setUnassignedCount(prev => prev + 1);
                    }
                };

                const handleTicketUpdate = () => {
                    fetchUnassignedCount();
                };

                socket.on('new_ticket_created', handleNewTicket);
                socket.on('ticket_updated', handleTicketUpdate);

                return () => {
                    socket.off('new_ticket_created', handleNewTicket);
                    socket.off('ticket_updated', handleTicketUpdate);
                };
            }
        }
    }, [user, socket, fetchUnassignedCount]);

    return (
        <TicketContext.Provider value={{ unassignedCount, fetchUnassignedCount, setUnassignedCount }}>
            {children}
        </TicketContext.Provider>
    );
};