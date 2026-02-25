import React, { useEffect, useState } from 'react';
import styles from './CreateTicket.module.less';
import { LuUpload } from "react-icons/lu";

const CreateTicket = () => {

  const [formData, setFormData] = useState({
    clientName: '',
    company: '',
    invoiceNumber: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    deviceType: '',
    model: '',
    serialNumber: '',
    description: '',
    files: null
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      dataToSend.append(key, formData[key]);
    });

    console.log("--- DATOS LISTOS PARA ENVIAR (POST) ---");
    for (let [key, value] of dataToSend.entries()) {
      console.log(`${key}:`, value);
    }
    alert("Revisa la consola (F12) para ver los datos capturados.");
  };

  return (
    <div className={styles.createTicketContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Crear Nuevo Ticket</h1>
        <p className={styles.subtitle}>Ingresa la información detallada para registrar el caso.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>

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
              <input
                type="tel"
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                placeholder="+504 9999-9999" />
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
                placeholder=""
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
                placeholder=""
                required />
            </div>
            <div className={styles.inputGroup}>
              <label>No. de Serie <span className={styles.required}>*</span></label>
              <input 
                type="text"
                name='serialNumber'
                value={formData.serialNumber}
                placeholder="Ingrese serie para verificar garantía" 
                required/>
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
              placeholder="Describa detalladamente la falla reportada..."
              required></textarea>
          </div>

          <div className={styles.inputGroup}>
            <label>Adjuntar Evidencia <span className={styles.required}>*</span></label>
            <div className={styles.uploadArea}>
              <input type="text" />
              <div className={styles.uploadContent}>
                <LuUpload className={styles.luUpload} />
                <span className={styles.uploadText}>Haga clic o arrastre archivos aquí</span>
                <span className={styles.uploadHint}>Soporta: JPG, PNG, PDF, MP4 (Max 15MB)</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button className={styles.btnCancel}>Cancelar</button>
          <button className={styles.btnSubmit}>Crear Ticket</button>
        </div>

      </form>
      <div className=''>

      </div>
    </div>
  );
};
export default CreateTicket;