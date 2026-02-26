import React, { useEffect, useState } from 'react';
import styles from './CreateTicket.module.less';
import { LuUpload, LuCheck, LuX } from "react-icons/lu";
import { FaQuestion } from "react-icons/fa"
import "flag-icons/css/flag-icons.min.css";

const CreateTicket = () => {

  const [formData, setFormData] = useState({
    clientName: '',
    company: '',
    invoiceNumber: '',
    email: '',
    phone: '',
    countryCode: '+504',
    subject: '',
    category: '',
    deviceType: '',
    model: '',
    serialNumber: '',
    description: '',
    files: null
  });

  const handleCancel = () => {

    setFormData({
      clientName: '',
      company: '',
      invoiceNumber: '',
      email: '',
      phone: '',
      countryCode: '+504',
      subject: '',
      category: '',
      deviceType: '',
      model: '',
      serialNumber: '',
      description: '',
      files: null
    });
  };

  const countries = [
    { code: '+505', iso: 'ni', name: 'Nicaragua' },
    { code: '+504', iso: 'hn', name: 'Honduras' },
    { code: '+503', iso: 'sv', name: 'EL Salvador' },
    { code: '+502', iso: 'gt', name: 'Guatemala' },
  ];

  const currentFlag = countries.find(c => c.code === formData.countryCode)?.iso || 'hn';

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    document.title = "Soporte | Crear Ticket";
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prevState => ({
      ...prevState,
      files: e.target.files[0]
    }));
  };

  const handleReview = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleFinalSubmit = () => {
    console.log("--- ENVIANDO A LARAVEL ---", formData);
    setIsModalOpen(false);

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  return (
    <div className={styles.createTicketContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Crear Nuevo Ticket</h1>
        <p className={styles.subtitle}>Ingresa la información detallada para registrar el caso.</p>
      </div>

      <form onSubmit={handleReview} className={styles.formCard}>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Información del Cliente</h3>
          </div>

          <div className={styles.formGridTwo}>
            <div className={styles.inputGroup}>
              <label>Nombre del Cliente <span className={styles.required}>*</span></label>
              <input
                type="text"
                name='clientName'
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                required />
            </div>
            <div className={styles.inputGroup}>
              <label>Empresa <span className={styles.required}>*</span></label>
              <input
                type="text"
                name='company'
                value={formData.company}
                onChange={handleChange}
                placeholder="Ej. AE Solutions"
                required />
            </div>
          </div>

          <div className={styles.formGridThree}>
            <div className={styles.inputGroup}>
              <label>No. de Factura <span className={styles.required}>*</span></label>
              <input
                type="text"
                name='invoiceNumber'
                value={formData.invoiceNumber}
                onChange={handleChange}
                placeholder="FAC-2024-001"
                required />
            </div>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com" />
            </div>
            <div className={styles.inputGroup}>
              <label>Teléfono</label>
              <div className={styles.phoneContainer}>
                <div className={styles.flagWrapper}>
                  <span className={`fi fi-${currentFlag}`}></span>
                </div>

                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className={styles.countrySelect}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      ({country.name})
                    </option>
                  ))}
                </select>

                <div className={styles.divider}></div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9702-9226"
                  className={styles.phoneInput}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Detalles del Equipo</h3>
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Asunto <span className={styles.required}>*</span></label>
              <input
                type="text"
                name='subject'
                value={formData.subject}
                onChange={handleChange}
                placeholder="Ej. La impresora no enciende"
                required />
            </div>
          </div>

          <div className={styles.formGridTwo}>
            <div className={styles.inputGroup}>
              <label>Categoría <span className={styles.required}>*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required >
                <option value="" disabled>Selecciona una categoría</option>
                <option value="dispositivos">Dispositivos</option>
                <option value="soluciones">Soluciones</option>
                <option value="servicios">Servicios</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Tipo de Dispositivo <span className={styles.required}>*</span></label>
              <input
                type="text"
                name='deviceType'
                value={formData.deviceType}
                onChange={handleChange}
                placeholder="Preguntar que va aqui"
                required />
            </div>
          </div>

          <div className={styles.formGridTwo}>
            <div className={styles.inputGroup}>
              <label>Modelo <span className={styles.required}>*</span></label>
              <input
                type="text"
                name='model'
                value={formData.model}
                onChange={handleChange}
                placeholder="Preguntar que va aqui"
                required />
            </div>
            <div className={styles.inputGroup}>
              <label>No. de Serie <span className={styles.required}>*</span></label>
              <input
                type="text"
                name='serialNumber'
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="Ingrese serie para verificar garantía"
                required />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Problemática</h3>
          </div>

          <div className={styles.inputGroup}>
            <label>Descripción del Problema <span className={styles.required}>*</span></label>
            <textarea
              rows="4"
              name='description'
              value={formData.description}
              onChange={handleChange}
              placeholder="Describa detalladamente la falla reportada..."
              required></textarea>
          </div>

          <div className={styles.inputGroup}>
            <label>Adjuntar Evidencia <span className={styles.required}>*</span></label>
            <div className={styles.uploadArea}>
              <input
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }} />
              <div className={styles.uploadContent}>
                <LuUpload className={styles.luUpload} />
                <span className={styles.uploadText}>
                  {formData.files ? formData.files.name : "Haga clic o arrastre archivos aquí"}
                </span>
                <span className={styles.uploadHint}>Soporta: JPG, PNG, PDF, MP4 (Max 15MB)</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={handleCancel}>
            Cancelar
          </button>
          <button type="submit" className={styles.btnSubmit}>Crear Ticket</button>
        </div>
      </form>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmationCard}>

            <div className={styles.iconWrapper}>
              <FaQuestion className={styles.faIcon} />
            </div>

            <h2 className={styles.modalTitle}>¿Seguro que deseas crear el ticket?</h2>

            <p className={styles.modalText}>
              Al confirmar, el ticket se registrará y no podrá modificarse.
            </p>
            <p className={styles.modalText}>
              El Ticket será gestionado por un administrador para poder avanzar
            </p>

            <div className={styles.modalButtons}>
              <button onClick={() => setIsModalOpen(false)} className={styles.btnCancelModal}>
                Cancelar
              </button>
              <button onClick={handleFinalSubmit} className={styles.btnAcceptModal}>
                Aceptar
              </button>
            </div>

          </div>
        </div>
      )}

      {showSuccess && (
        <div className={styles.successToast}>
          <div className={styles.toastIcon}>
            <LuCheck className={styles.checkIcon} />
          </div>
          <div className={styles.toastContent}>
            <h4>El Ticket se ha creado exitosamente</h4>
            <p>Ve a Asignar Ticket para poder gestionarlo y asignar colaboradores</p>
          </div>
          <button onClick={() => setShowSuccess(false)} className={styles.toastClose}>
            <LuX />
          </button>
        </div>
      )}
    </div>
  );
};
export default CreateTicket;