import React, { useEffect } from 'react';
import styles from './CreateTicket.module.less';
import { FaCloudUploadAlt } from "react-icons/fa";

const CreateTicket = () => {

  useEffect(() => {
    document.title = "Soporte | Crear Ticket";
  }, []);

  return (
    <div className={styles.createTicketContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Crear Nuevo Ticket</h1>
        <p className={styles.subtitle}>Ingresa la información detallada para registrar el caso.</p>
      </div>

      <div className={styles.formCard}>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Información del Cliente</h3>
          </div>

          <div className={styles.formGridTwo}>
            <div className={styles.inputGroup}>
              <label>Nombre del Cliente <span className={styles.required}>*</span></label>
              <input type="text" placeholder="Ej. Juan Pérez" />
            </div>
            <div className={styles.inputGroup}>
              <label>Empresa <span className={styles.required}>*</span></label>
              <input type="text" placeholder="Ej. AE Solutions" />
            </div>
          </div>

          <div className={styles.formGridThree}>
            <div className={styles.inputGroup}>
              <label>No. de Factura <span className={styles.required}>*</span></label>
              <input type="text" placeholder="FAC-2024-001" />
            </div>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input type="email" placeholder="correo@ejemplo.com" />
            </div>
            <div className={styles.inputGroup}>
              <label>Teléfono</label>
              <input type="tel" placeholder="+504 9999-9999" />
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
              <input type="text" placeholder="Ej. La impresora no enciende" />
            </div>
          </div>

          <div className={styles.formGridTwo}>
            <div className={styles.inputGroup}>
              <label>Categoría <span className={styles.required}>*</span></label>
              <select defaultValue="">
                <option value="" disabled>Selecciona una categoría</option>
                <option value="dispositivos">Dispositivos</option>
                <option value="soluciones">Soluciones</option>
                <option value="servicios">Servicios</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Tipo de Dispositivo <span className={styles.required}>*</span></label>
              <input type="text" placeholder="" />
            </div>
          </div>

          <div className={styles.formGridTwo}>
            <div className={styles.inputGroup}>
              <label>Modelo <span className={styles.required}>*</span></label>
              <input type="text" placeholder="" />
            </div>
            <div className={styles.inputGroup}>
              <label>No. de Serie <span className={styles.required}>*</span></label>
              <input type="text" placeholder="Ingrese serie para verificar garantía" />
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
            <textarea rows="4" placeholder="Describa detalladamente la falla reportada..."></textarea>
          </div>

          <div className={styles.inputGroup}>
            <label>Adjuntar Evidencia <span className={styles.required}>*</span></label>
            <div className={styles.uploadArea}>
              <div className={styles.uploadContent}>
                {/* Icono SVG simple por si no tienes react-icons instalado */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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

      </div>
      <div className=''>

      </div>
    </div>
  );
};
export default CreateTicket;