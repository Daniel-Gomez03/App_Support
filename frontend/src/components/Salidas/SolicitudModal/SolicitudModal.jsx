// ============================================
// COMPONENT: SOLICITUD MODAL
// Formulario para crear una nueva solicitud de salida técnica.
//
// PROPS:
//   isOpen      — booleano; si false, retorna null
//   onClose     — fn(); cierra el modal
//   onSubmit    — fn(form); recibe el payload y llama al servicio
//   currentUser — objeto del usuario en sesión
//   isAdmin     — booleano; si true, muestra selector de técnico y
//                 carga la lista de usuarios activos
//
// ESTADO:
//   form           — campos del formulario (user_id, ticket_id,
//                    salida_destination, salida_date, salida_time)
//   techs          — lista de técnicos activos (solo en modo admin)
//   tickets        — tickets activos del técnico seleccionado
//   loadingTickets — spinner del select de tickets durante fetch
//   submitting     — bloquea botón enviar durante el await
//   error          — mensaje de validación o error de API
//
// FLUJO:
//   Admin   → selecciona técnico → loadTickets(userId) → selecciona ticket
//             → el destino se autocompletea con customer_company del ticket
//             → editable manualmente
//   No admin → user_id fijado a currentUser; tickets cargados al abrir
//
// Al abrir (isOpen=true): form se reinicia vía INITIAL_FORM; techs/tickets
// se limpian para evitar estado residual de aperturas anteriores.
// ============================================

import React, { useState, useEffect } from 'react';
import styles from './SolicitudModal.module.less';
import { FiX, FiMapPin, FiCalendar, FiClock } from 'react-icons/fi';
import { LuTicket } from 'react-icons/lu';
import { getTicketsByUser } from '../../../services/SalidaService';
import { getUsers } from '../../../services/Userservice';

const formatID = (id) => `T-${id.toString().padStart(4, '0')}`;

const INITIAL_FORM = {
    user_id: '',
    ticket_id: '',
    salida_destination: '',
    salida_date: '',
    salida_time: '',
};

const SolicitudModal = ({ isOpen, onClose, onSubmit, currentUser, isAdmin }) => {
    const [form, setForm] = useState(INITIAL_FORM);
    const [techs, setTechs] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setTickets([]);

        if (isAdmin) {
            setForm(INITIAL_FORM);
            getUsers()
                .then(users => setTechs(users.filter(u => u.estado === 1 || u.estado === true)))
                .catch(() => setTechs([]));
        } else {
            setForm({ ...INITIAL_FORM, user_id: currentUser.user_id });
            loadTickets(currentUser.user_id);
        }
    }, [isOpen]);

    const loadTickets = async (userId) => {
        if (!userId) return;
        setLoadingTickets(true);
        setTickets([]);
        setForm(prev => ({ ...prev, ticket_id: '', salida_destination: '' }));
        try {
            const data = await getTicketsByUser(userId);
            setTickets(Array.isArray(data) ? data : []);
        } catch {
            setTickets([]);
        } finally {
            setLoadingTickets(false);
        }
    };

    const handleTechChange = (e) => {
        const userId = e.target.value;
        setForm(prev => ({ ...prev, user_id: userId, ticket_id: '', salida_destination: '' }));
        if (userId) loadTickets(userId);
        else setTickets([]);
    };

    const handleTicketChange = (e) => {
        const ticketId = e.target.value;
        const ticket = tickets.find(t => t.ticket_id === parseInt(ticketId));
        setForm(prev => ({
            ...prev,
            ticket_id: ticketId,
            salida_destination: ticket?.customer_company || prev.salida_destination,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.user_id || !form.ticket_id || !form.salida_destination || !form.salida_date || !form.salida_time) {
            setError('Por favor completa todos los campos.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await onSubmit(form);
            onClose();
        } catch (err) {
            setError(err.message || 'Error al crear la solicitud.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const techName = isAdmin
        ? (techs.find(t => t.user_id === parseInt(form.user_id))?.nombre_completo ?? '')
        : currentUser?.nombre_completo;

    return (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Solicitar Nueva Salida</h3>
                    <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
                </div>

                <form className={styles.body} onSubmit={handleSubmit}>

                    <div className={styles.field}>
                        <label className={styles.label}>Técnico</label>
                        {isAdmin ? (
                            <select
                                className={styles.select}
                                value={form.user_id}
                                onChange={handleTechChange}
                                required
                            >
                                <option value="">Selecciona al DevSupport</option>
                                {techs.map(t => (
                                    <option key={t.user_id} value={t.user_id}>
                                        {t.nombre_completo} — {t.cargo || t.rol}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className={styles.readOnly}>{techName}</div>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}><LuTicket /> Ticket</label>
                        <select
                            className={styles.select}
                            value={form.ticket_id}
                            onChange={handleTicketChange}
                            required
                            disabled={!form.user_id || loadingTickets}
                        >
                            <option value="">
                                {loadingTickets ? 'Cargando tickets...' : 'Selecciona el ticket'}
                            </option>
                            {tickets.map(t => (
                                <option key={t.ticket_id} value={t.ticket_id}>
                                    {formatID(t.ticket_id)} — {t.ticket_subject}
                                </option>
                            ))}
                        </select>
                        {form.user_id && !loadingTickets && tickets.length === 0 && (
                            <p className={styles.hint}>Este técnico no tiene tickets activos asignados.</p>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}><FiMapPin /> Destino / Cliente</label>
                        <input
                            className={styles.input}
                            type="text"
                            name="salida_destination"
                            placeholder="Ej. Burger King Centro"
                            value={form.salida_destination}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}><FiCalendar /> Fecha</label>
                            <input
                                className={styles.input}
                                type="date"
                                name="salida_date"
                                value={form.salida_date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}><FiClock /> Hora</label>
                            <input
                                className={styles.input}
                                type="time"
                                name="salida_time"
                                value={form.salida_time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={submitting}>
                            {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SolicitudModal;