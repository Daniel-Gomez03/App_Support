// ============================================
// COMPONENT: ADD WARRANTY MODAL (Garantías)
// Modal de creación y edición de garantías.
// Flujo de dos pasos: formulario → confirmación.
//
// PROPS:
//   isOpen   — controla visibilidad del modal
//   onClose  — cierra sin guardar
//   onSave   — fn(id, formData); id=null → crear,
//              id=warranty_id → actualizar
//   warranty — objeto de garantía para edición;
//              null → modo creación
//
// VALIDACIÓN (isFormValid):
//   serial  ≥ 16 chars, factura ≥ 4 chars,
//   fecha entre 2020-01-01 y hoy.
//
// El campo fecha normaliza el valor del API
//   (ISO 'T' o espacio como separador) tomando
//   solo la parte YYYY-MM-DD.
// ============================================

import React, { useState, useEffect } from 'react';
import { LuX, LuSave, LuShieldCheck, LuCircleAlert, LuLoaderCircle } from 'react-icons/lu';
import styles from './AddWarrantyModal.module.less';

const today = new Date().toLocaleDateString('en-CA');

const EMPTY_FORM = {
    warranty_serial_number: '',
    warranty_invoice_number: '',
    warranty_purchase_date: '',
};

const AddWarrantyModal = ({ isOpen, onClose, onSave, warranty }) => {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (warranty) {
            const cleanDate = warranty.warranty_purchase_date
                ? warranty.warranty_purchase_date.split('T')[0].split(' ')[0]
                : '';

            setFormData({
                warranty_serial_number: warranty.warranty_serial_number || '',
                warranty_invoice_number: warranty.warranty_invoice_number || '',
                warranty_purchase_date: cleanDate,
            });
        } else {
            setFormData(EMPTY_FORM);
        }
        setShowConfirm(false);
    }, [warranty, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid =
        formData.warranty_serial_number.length >= 16 &&
        formData.warranty_invoice_number.length >= 4 &&
        formData.warranty_purchase_date !== '' &&
        formData.warranty_purchase_date >= '2020-01-01' &&
        formData.warranty_purchase_date <= today;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid) setShowConfirm(true);
    };

    const handleConfirmSave = async () => {
        setIsSubmitting(true);
        try {
            await onSave(warranty?.warranty_id ?? null, formData);
            setShowConfirm(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerTitle}>
                        <LuShieldCheck className={styles.headerIcon} />
                        <h2>{warranty ? 'Editar Garantía' : 'Registrar Nueva Garantía'}</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} disabled={isSubmitting}>
                        <LuX />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {!showConfirm ? (
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Número de Serie</label>
                                    <input
                                        type="text"
                                        name="warranty_serial_number"
                                        placeholder="Ingrese el S/N del equipo"
                                        value={formData.warranty_serial_number}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Número de Factura</label>
                                    <input
                                        type="text"
                                        name="warranty_invoice_number"
                                        placeholder="Ingrese el número de factura"
                                        value={formData.warranty_invoice_number}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Fecha de Compra</label>
                                    <input
                                        type="date"
                                        name="warranty_purchase_date"
                                        min="2020-01-01"
                                        max={today}
                                        value={formData.warranty_purchase_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="submit"
                                    className={styles.saveBtn}
                                    disabled={!isFormValid}
                                >
                                    <LuSave /> {warranty ? 'Guardar Cambios' : 'Registrar Garantía'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className={styles.confirmationWrapper}>
                            <div className={styles.iconCircle}>
                                <LuCircleAlert />
                            </div>
                            <h3>¿Confirmar registro?</h3>
                            <p>Serie: <strong>{formData.warranty_serial_number}</strong></p>
                            <p>El sistema actualizará la vigencia automáticamente.</p>

                            <div className={styles.confirmButtons}>
                                <button className={styles.btnSecondary} onClick={() => setShowConfirm(false)} disabled={isSubmitting}>
                                    Revisar
                                </button>
                                <button className={styles.btnPrimary} onClick={handleConfirmSave} disabled={isSubmitting}>
                                    {isSubmitting ? <LuLoaderCircle className={styles.spin} /> : 'Confirmar y Guardar'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddWarrantyModal;