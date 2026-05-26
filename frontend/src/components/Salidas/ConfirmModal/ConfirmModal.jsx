// ============================================
// COMPONENT: CONFIRM MODAL (Salidas)
// Modal de confirmación para aprobar o rechazar una solicitud de salida.
//
// PROPS:
//   isOpen    — booleano; si false o sin salida, retorna null
//   type      — 'approve' | 'reject'; deriva isApprove
//   salida    — objeto salida en revisión
//   onClose   — fn(); cierra el modal (también resetea estado local)
//   onConfirm — fn({ salida_status, rejection_reason }); llamado al confirmar
//
// ESTADO:
//   reason  — motivo del rechazo (requerido si type === 'reject')
//   loading — bloquea botones durante el await
//   error   — mensaje de validación o error de API
//
// FLUJO:
//   Aprobar → onConfirm({ salida_status: 1, rejection_reason: null })
//   Rechazar → valida reason no vacío →
//              onConfirm({ salida_status: 2, rejection_reason: reason })
//
// CIERRE:
//   handleClose resetea reason + error antes de llamar onClose,
//   evitando estado residual si el modal se reabre.
//   Click en overlay (solo si target === currentTarget) también cierra.
// ============================================

import React, { useState } from 'react';
import styles from './ConfirmModal.module.less';
import { FiX, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ConfirmModal = ({ isOpen, type, salida, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !salida) return null;

    const isApprove = type === 'approve';

    const handleConfirm = async () => {
        if (!isApprove && !reason.trim()) {
            setError('Debes describir la razón del rechazo.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await onConfirm({ salida_status: isApprove ? 1 : 2, rejection_reason: reason.trim() || null });
            setReason('');
            onClose();
        } catch (err) {
            setError(err.message || 'Ocurrió un error.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && handleClose()}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={handleClose}><FiX /></button>

                <div className={`${styles.iconWrap} ${isApprove ? styles.iconGreen : styles.iconRed}`}>
                    {isApprove
                        ? <FiCheckCircle className={styles.icon} />
                        : <FiXCircle className={styles.icon} />
                    }
                </div>

                <h3 className={styles.title}>
                    {isApprove ? '¿Deseas aprobar esta salida?' : '¿Deseas rechazar esta salida?'}
                </h3>

                <p className={styles.subtitle}>
                    {isApprove
                        ? 'Al aprobar esta solicitud, autorizas al DevSupport a realizar la salida para atender al cliente.'
                        : 'Por favor describe la razón por la que has rechazado la salida.'
                    }
                </p>

                {!isApprove && (
                    <textarea
                        className={styles.textarea}
                        placeholder="Describe el error o problema encontrado..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={4}
                    />
                )}

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={handleClose} disabled={loading}>
                        Cancelar
                    </button>
                    <button
                        className={`${styles.confirmBtn} ${isApprove ? styles.confirmGreen : styles.confirmRed}`}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading
                            ? 'Procesando...'
                            : isApprove ? 'Sí, aprobar' : 'Confirmar Rechazo'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;