import React, { createContext, useState, useContext } from 'react';

const TicketContext = createContext();

export const TicketProvider = ({ children }) => {

    const [tickets, setTickets] = useState([]);


    const addTicket = (newTicketData) => {

        const mockTicket = {
            ...newTicketData,
            ticket_id: Date.now(),
            ticket_status: 'Abierto',
            ticket_createdAt: new Date().toLocaleString(),
            priority_id: null,
            user_id: null
        };

        setTickets(prevTickets => [mockTicket, ...prevTickets]);
    };

    const assignedCount = tickets.length;

    return (
        <TicketContext.Provider value={{ tickets, assignedCount, addTicket }}>
            {children}
        </TicketContext.Provider>
    );
};

export const useTicketContext = () => useContext(TicketContext);