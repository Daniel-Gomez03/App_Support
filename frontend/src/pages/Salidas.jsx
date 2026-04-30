import React, { useState, useEffect, useMemo } from 'react';
import styles from './Salidas.module.less';
import lensIcon from '../assets/icons/Lens-icon.svg';
import { LuCheck, LuX, LuCircleAlert } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { socket } from '../services/Userservice';
import { getAllSalidas, createSalida, updateSalidaStatus } from '../services/SalidaService';
import SalidasTable    from '../components/Salidas/SalidasTable/SalidasTable';
import SolicitudModal  from '../components/Salidas/SolicitudModal/SolicitudModal';
import ConfirmModal    from '../components/Salidas/ConfirmModal/ConfirmModal';
import SalidaViewModal from '../components/Salidas/SalidaViewModal/SalidaViewModal';

const Salidas = () => {
    const { user } = useAuth();

    const canRead  = user?.Permissions?.some(p => p.Seccion?.module_name === 'Salidas' && p.permissions_read  === 1);
    const canWrite = user?.Permissions?.some(p => p.Seccion?.module_name === 'Salidas' && p.permissions_write === 1);
    const canEdit  = user?.Permissions?.some(p => p.Seccion?.module_name === 'Salidas' && p.permissions_edit  === 1);
    const isAdmin  = user?.rol === 'Admin';

    const [salidas, setSalidas]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toastConfig, setToastConfig] = useState({ show: false, title: '', message: '', type: 'success' });

    const [showSolicitudModal, setShowSolicitudModal] = useState(false);
    const [confirmAction, setConfirmAction]           = useState(null); // { type: 'approve'|'reject', salida }
    const [viewSalida, setViewSalida]                 = useState(null);

    const loadSalidas = async () => {
        try {
            setLoading(true);
            const data = await getAllSalidas();
            setSalidas(Array.isArray(data) ? data : []);
        } catch {
            setSalidas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Soporte | Salidas';
        if (canRead) loadSalidas();
        else setLoading(false);
    }, [canRead]);

    useEffect(() => {
        if (!canRead) return;
        const refresh = () => loadSalidas();
        socket.on('salida_created', refresh);
        socket.on('salida_status_updated', refresh);
        return () => {
            socket.off('salida_created', refresh);
            socket.off('salida_status_updated', refresh);
        };
    }, [canRead]);

    const filteredSalidas = useMemo(() => {
        if (!searchTerm) return salidas;
        const lower = searchTerm.toLowerCase();
        return salidas.filter(s =>
            s.nombre_completo?.toLowerCase().includes(lower) ||
            s.salida_destination?.toLowerCase().includes(lower) ||
            s.ticket_subject?.toLowerCase().includes(lower) ||
            s.customer_company?.toLowerCase().includes(lower) ||
            `T-${s.ticket_id?.toString().padStart(4, '0')}`.toLowerCase().includes(lower) ||
            `#${s.salida_id}`.includes(lower)
        );
    }, [salidas, searchTerm]);

    const showToast = (title, message, type = 'success') => {
        setToastConfig({ show: true, title, message, type });
        setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 5000);
    };

    const handleCreate = async (formData) => {
        await createSalida(formData);
        await loadSalidas();
        showToast('¡Solicitud enviada!', 'La solicitud de salida fue registrada correctamente.');
    };

    const handleConfirmAction = async (payload) => {
        await updateSalidaStatus(confirmAction.salida.salida_id, payload);
        await loadSalidas();
        const isApprove = payload.salida_status === 1;
        showToast(
            isApprove ? '¡Salida aprobada!' : 'Salida rechazada',
            isApprove ? 'La solicitud fue aprobada correctamente.' : 'La solicitud fue rechazada.',
            isApprove ? 'success' : 'error'
        );
        setConfirmAction(null);
    };

    if (!canRead) {
        return (
            <div className={styles.salidasContainer}>
                <div className={styles.errorInfo}>No tienes permisos para visualizar las salidas.</div>
            </div>
        );
    }

    return (
        <div className={styles.salidasContainer}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Gestión de Salidas</h1>
                    <p className={styles.subtitle}>Solicitudes de visita técnica y permisos de campo.</p>
                </div>
            </div>

            <div className={styles.controlsWrapper}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBar}>
                        <img src={lensIcon} alt="Buscar" className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar por técnico, ticket, destino..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {canWrite && (
                        <button className={styles.newBtn} onClick={() => setShowSolicitudModal(true)}>
                            + Solicitar Salida
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loadingState}>Cargando salidas...</div>
                ) : (
                    <SalidasTable
                        data={filteredSalidas}
                        onView={s => setViewSalida(s)}
                        onApprove={s => setConfirmAction({ type: 'approve', salida: s })}
                        onReject={s  => setConfirmAction({ type: 'reject',  salida: s })}
                        isAdmin={isAdmin && canEdit}
                    />
                )}
            </div>

            <SolicitudModal
                isOpen={showSolicitudModal}
                onClose={() => setShowSolicitudModal(false)}
                onSubmit={handleCreate}
                currentUser={user}
                isAdmin={isAdmin}
            />

            <ConfirmModal
                isOpen={!!confirmAction}
                type={confirmAction?.type}
                salida={confirmAction?.salida}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirmAction}
            />

            <SalidaViewModal
                salida={viewSalida}
                onClose={() => setViewSalida(null)}
            />

            {toastConfig.show && (
                <div className={`${styles.successToast} ${toastConfig.type === 'error' ? styles.errorToast : ''}`}>
                    <div className={styles.toastIconContainer}>
                        {toastConfig.type === 'success'
                            ? <LuCheck className={styles.checkIcon} />
                            : <LuCircleAlert className={styles.checkIcon} />
                        }
                    </div>
                    <div className={styles.toastContent}>
                        <h4>{toastConfig.title}</h4>
                        <p>{toastConfig.message}</p>
                    </div>
                    <button onClick={() => setToastConfig(prev => ({ ...prev, show: false }))} className={styles.toastClose}>
                        <LuX />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Salidas;