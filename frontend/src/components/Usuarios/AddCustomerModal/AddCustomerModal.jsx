// ============================================
// COMPONENT: ADD CUSTOMER MODAL
// Formulario de registro de nuevo cliente externo con flujo de 2 pasos:
//   1. Formulario    — datos personales + foto + validación de garantía
//   2. Confirmación  — resumen antes de llamar al servicio
//
// PROPS:
//   isOpen           — booleano; si false, retorna null y resetea estado
//   onClose          — fn(); cierra el modal
//   onCustomerCreated — fn(message, isManualReview); notifica al padre
//                       del resultado (registro ok o revisión manual)
//
// ESTADO:
//   formData       — campos del formulario; inicializa y resetea con INITIAL_STATE
//   imagePreview   — data-URL de la foto seleccionada (FileReader)
//   isConfirming   — true durante el paso de confirmación
//   isLoading      — bloquea botones durante el await de registro
//   formError      — error de API mostrado como banner
//
// FLUJO:
//   handleChange       — filtra caracteres por tipo de campo;
//                        limpia formError al editar
//   handlePreSubmit    — valida con isValid y activa isConfirming
//   handleFinalSave    — construye FormData, llama al servicio,
//                        notifica al padre y cierra
//
// MÓDULO SCOPE:
//   countryRules — validación de longitud de teléfono por código de país
//   INITIAL_STATE — estado vacío del formulario; compartido con el reset
//   NAME_FIELDS   — Set de campos que aceptan solo letras con acentos
// ============================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './AddCustomerModal.module.less';
import { MdClose, MdCloudUpload } from 'react-icons/md';
import { LuUserPlus, LuLoaderCircle } from "react-icons/lu";
import { registerAdminCustomer } from '../../../services/Customerservice';
import 'flag-icons/css/flag-icons.min.css';

const countryRules = {
    '+504': { name: 'Honduras', iso: 'hn', min: 8, max: 8 },
    '+505': { name: 'Nicaragua', iso: 'ni', min: 8, max: 8 },
    '+503': { name: 'El Salvador', iso: 'sv', min: 8, max: 8 },
    '+502': { name: 'Guatemala', iso: 'gt', min: 8, max: 8 },
};

const INITIAL_STATE = {
    customer_first_name: '',
    customer_second_name: '',
    customer_last_name: '',
    customer_second_last_name: '',
    customer_email: '',
    customer_country_code: '+504',
    customer_phone: '',
    customer_company: '',
    validation_type: 'serie',
    validation_value: '',
    customer_image: null,
};

const NAME_FIELDS = new Set([
    'customer_first_name',
    'customer_second_name',
    'customer_last_name',
    'customer_second_last_name',
]);

const AddCustomerModal = ({ isOpen, onClose, onCustomerCreated }) => {
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState(INITIAL_STATE);

    useEffect(() => {
        if (!isOpen) {
            setFormData(INITIAL_STATE);
            setImagePreview(null);
            setIsConfirming(false);
            setIsLoading(false);
            setFormError('');
        }
    }, [isOpen]);

    const isValid = useMemo(() => {
        const {
            customer_first_name, customer_last_name, customer_email,
            customer_phone, customer_company, validation_value,
            validation_type, customer_country_code
        } = formData;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const rules = countryRules[customer_country_code];

        return (
            customer_first_name.length >= 3 &&
            customer_last_name.length >= 3 &&
            emailRegex.test(customer_email) &&
            customer_company.trim().length >= 4 &&
            customer_phone.length === rules.max &&
            (validation_type === 'factura' ? validation_value.length >= 4 : validation_value.length >= 16)
        );
    }, [formData]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, customer_image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let filteredValue = value;

        if (filteredValue.startsWith(' ')) return;

        if (NAME_FIELDS.has(name)) {
            filteredValue = filteredValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
        }
        if (name === 'customer_email' || name === 'validation_value') {
            filteredValue = filteredValue.replace(/\s+/g, '');
        }
        if (name === 'customer_phone') {
            filteredValue = filteredValue.replace(/[^0-9]/g, '');
            const maxAllowed = countryRules[formData.customer_country_code]?.max || 15;
            if (filteredValue.length > maxAllowed) return;
        }

        setFormData(prev => ({ ...prev, [name]: filteredValue }));
        if (formError) setFormError('');
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();
        if (!isValid) return;
        setIsConfirming(true);
    };

    const handleFinalSave = async () => {
        setIsLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    data.append(key, formData[key]);
                }
            });
            const response = await registerAdminCustomer(data);
            onCustomerCreated(response.message, response.requires_manual_review);
            onClose();
        } catch (err) {
            setFormError(err.response?.data?.error || err.message);
            setIsConfirming(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerTitle}>
                        <LuUserPlus className={styles.headerIcon} />
                        <h2>{isConfirming ? "Confirmar Registro" : "Nuevo Cliente"}</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} disabled={isLoading} type="button">
                        <MdClose />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {formError && <div className={styles.errorBanner}>{formError}</div>}

                    {!isConfirming ? (
                        <form onSubmit={handlePreSubmit} className={styles.form}>
                            <div className={styles.imageUploadSection}>
                                <div className={styles.previewContainer} onClick={() => fileInputRef.current.click()}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                                    ) : (
                                        <div className={styles.uploadPlaceholder}>
                                            <MdCloudUpload />
                                            <span>Subir Foto</span>
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Primer Nombre *</label>
                                    <input type="text" name="customer_first_name" value={formData.customer_first_name} onChange={handleChange} required placeholder="Juan" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Segundo Nombre</label>
                                    <input type="text" name="customer_second_name" value={formData.customer_second_name} onChange={handleChange} placeholder="Antonio" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Primer Apellido *</label>
                                    <input type="text" name="customer_last_name" value={formData.customer_last_name} onChange={handleChange} required placeholder="Pérez" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Segundo Apellido</label>
                                    <input type="text" name="customer_second_last_name" value={formData.customer_second_last_name} onChange={handleChange} placeholder="Rodríguez" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Correo Electrónico *</label>
                                    <input type="email" name="customer_email" value={formData.customer_email} onChange={handleChange} required placeholder="ejemplo@correo.com" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Empresa *</label>
                                    <input type="text" name="customer_company" value={formData.customer_company} onChange={handleChange} required placeholder="Nombre Empresa" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Teléfono * ({countryRules[formData.customer_country_code].max} dígitos)</label>
                                    <div className={styles.phoneInputContainer}>
                                        <div className={styles.flagSelector}>
                                            <span className={`fi fi-${countryRules[formData.customer_country_code].iso} ${styles.flagIcon}`}></span>
                                            <select
                                                name="customer_country_code"
                                                value={formData.customer_country_code}
                                                onChange={handleChange}
                                                className={styles.hiddenSelect}
                                            >
                                                {Object.keys(countryRules).map(code => (
                                                    <option key={code} value={code}>
                                                        {countryRules[code].name} ({code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <input type="text" name="customer_phone" value={formData.customer_phone} onChange={handleChange} required placeholder="00000000" />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.validationSection}>
                                <h3>Validación de Garantía</h3>
                                <div className={styles.validationGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Tipo de documento</label>
                                        <select name="validation_type" value={formData.validation_type} onChange={handleChange}>
                                            <option value="serie">Número de Serie</option>
                                            <option value="factura">Número de Factura</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Número de referencia *</label>
                                        <input
                                            type="text"
                                            name="validation_value"
                                            value={formData.validation_value}
                                            onChange={handleChange}
                                            required
                                            placeholder={formData.validation_type === 'serie' ? "Mínimo 16" : "Mínimo 4"}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="submit" className={styles.saveBtn} disabled={!isValid}>
                                    Registrar Cliente
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className={styles.confirmationWrapper}>
                            <div className={styles.iconCircle}><LuUserPlus /></div>
                            <h3>¿Deseas crear este cliente?</h3>
                            <div className={styles.summaryCard}>
                                <p><strong>Nombre:</strong> {formData.customer_first_name} {formData.customer_last_name}</p>
                                <p><strong>Empresa:</strong> {formData.customer_company}</p>
                                <p><strong>Teléfono:</strong> {formData.customer_country_code} {formData.customer_phone}</p>
                                <p><strong>Referencia:</strong> {formData.validation_value} ({formData.validation_type.toUpperCase()})</p>
                            </div>
                            <div className={styles.confirmButtons}>
                                <button type="button" className={styles.btnSecondary} onClick={() => setIsConfirming(false)} disabled={isLoading}>Regresar</button>
                                <button type="button" className={styles.btnPrimary} onClick={handleFinalSave} disabled={isLoading}>
                                    {isLoading ? <LuLoaderCircle className={styles.spin} /> : "Confirmar Registro"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddCustomerModal;