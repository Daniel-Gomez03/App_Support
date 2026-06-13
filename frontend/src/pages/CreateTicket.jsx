// ============================================
// PAGE: CREATE TICKET
// Formulario de tres pasos para registrar un
// ticket desde el panel de administración.
//
// FLUJO:
//   1. Búsqueda de cliente en dropdown con
//      filtro en tiempo real. Al seleccionar,
//      los campos de empresa, email, teléfono
//      y registro se auto-rellenan como solo
//      lectura.
//   2. Selección en cascada: categoría →
//      producto → modelo (carga dinámica).
//      El número de serie dispara la verificación
//      de garantía al perder el foco (onBlur).
//   3. Asunto, descripción y evidencias.
//
// CONFIRMACIÓN:
//   El submit del form abre un modal de
//   confirmación; handleFinalSubmit construye
//   un FormData y llama createTicketAdmin.
//   El form se limpia con resetForm() tras
//   el éxito.
//
// GARANTÍA:
//   warrantyStatus { loading, data, error }
//   muestra el resultado inline bajo el campo
//   de serie: válida, expirada o no encontrada.
//
// PERMISOS:
//   canRead && canWrite requeridos. Si alguno
//   falta se muestra un panel de acceso
//   restringido en lugar del formulario.
//
// countryRules: mapa de código de llamada a
//   código ISO para el componente flag-icons.
//   Definido fuera del componente para no
//   recrearse en cada render.
// ============================================

import React, { useEffect, useState, useRef } from 'react';
import styles from './CreateTicket.module.less';
import { LuUpload, LuCheck, LuX, LuLoaderCircle, LuSearch, LuShieldCheck, LuShieldAlert, LuShieldX, LuCircleAlert } from "react-icons/lu";
import { FaQuestion } from "react-icons/fa";
import "flag-icons/css/flag-icons.min.css";
import { getCustomers } from "../services/Customerservice";
import { getCategories } from "../services/Categoryservice";
import { getProducts } from "../services/Productservice";
import { getProductModelsByProduct } from "../services/Productmodelservice";
import { createTicketAdmin } from "../services/Ticketservice";
import { checkWarrantySerial } from "../services/Warrantyservice";
import { useAuth } from "../context/AuthContext";

const countryRules = {
  '+504': { iso: 'hn' },
  '+505': { iso: 'ni' },
  '+503': { iso: 'sv' },
  '+502': { iso: 'gt' },
};

const CreateTicket = () => {
  const { user } = useAuth();

  const canRead = user?.Permissions?.some(p => p.Seccion?.module_name === "Crear Ticket" && p.permissions_read === 1);
  const canWrite = user?.Permissions?.some(p => p.Seccion?.module_name === "Crear Ticket" && p.permissions_write === 1);

  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [models, setModels] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastConfig, setToastConfig] = useState({ show: false, title: "", message: "", type: "success" })
  const dropdownRef = useRef(null);

  const showToast = (title, message, type = "success") => {
    setToastConfig({ show: true, title, message, type });
    setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 5000);
  };

  const [warrantyStatus, setWarrantyStatus] = useState({ loading: false, data: null, error: null });

  const [formData, setFormData] = useState({
    customer_id: '',
    customer_company: '',
    customer_email: '',
    customer_phone: '',
    customer_country_code: '',
    customer_registration_type: '',
    customer_registration_value: '',
    category_id: '',
    product_id: '',
    product_model_id: '',
    ticket_serial_number: '',
    ticket_subject: '',
    ticket_description: '',
    evidences: []
  });

  const isCustomerValid = !!formData.customer_id;
  const isCategoryValid = !!formData.category_id;
  const isProductValid = !!formData.product_id;
  const isModelValid = models.length > 0 ? !!formData.product_model_id : true;
  const isSerialValid = formData.ticket_serial_number.trim().length >= 15;
  const isSubjectValid = formData.ticket_subject.trim().length >= 10;
  const isDescriptionValid = formData.ticket_description.trim().length >= 20;

  const isFormValid = isCustomerValid && isCategoryValid && isProductValid && isModelValid && isSerialValid && isSubjectValid && isDescriptionValid;

  useEffect(() => {
    document.title = "Soporte | Crear Ticket";

    if (!canRead) return;

    const loadInitialData = async () => {
      try {
        const [cData, catData] = await Promise.all([getCustomers(), getCategories()]);
        setCustomers(cData);
        setCategories(catData);
      } catch (err) { console.error(err); }
    };
    loadInitialData();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [canRead]);

  const handleSelectCustomer = (c) => {
    setFormData({
      ...formData,
      customer_id: c.customer_id,
      customer_company: c.customer_company,
      customer_email: c.customer_email,
      customer_phone: c.customer_phone,
      customer_country_code: c.customer_country_code,
      customer_registration_type: c.customer_registration_type,
      customer_registration_value: c.customer_registration_value,
    });
    setSearchTerm(`${c.customer_first_name} ${c.customer_last_name}`);
    setShowDropdown(false);
  };

  const filteredCustomers = customers.filter(c =>
    `${c.customer_first_name} ${c.customer_last_name} ${c.customer_company}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategorySelect = async (e) => {
    const id = e.target.value;
    setFormData({ ...formData, category_id: id, product_id: '', product_model_id: '' });
    setProducts([]); setModels([]);
    if (id) {
      const allProducts = await getProducts();
      const filtered = allProducts.filter(p => p.category_id == id);
      setProducts(filtered);
    }
  };

  const handleProductSelect = async (e) => {
    const id = e.target.value;
    setFormData({ ...formData, product_id: id, product_model_id: '' });
    setModels([]);
    if (id) {
      const data = await getProductModelsByProduct(id);
      setModels(data);
    }
  };

  const handleVerifyWarranty = async (serial) => {
    if (!serial || serial.trim().length < 5) return;
    setWarrantyStatus({ loading: true, data: null, error: null });
    try {
      const result = await checkWarrantySerial(serial);
      setWarrantyStatus({ loading: false, data: result, error: null });
    } catch (err) {
      setWarrantyStatus({ loading: false, data: null, error: err.message });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value.startsWith(' ')) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, evidences: files }));
  };

  const resetForm = () => {
    setFormData({ customer_id: '', customer_company: '', customer_email: '', customer_phone: '', customer_country_code: '', customer_registration_type: '', customer_registration_value: '', category_id: '', product_id: '', product_model_id: '', ticket_serial_number: '', ticket_subject: '', ticket_description: '', evidences: [] });
    setSearchTerm(''); setProducts([]); setModels([]); setWarrantyStatus({ loading: false, data: null, error: null });
  };

  const handleFinalSubmit = async () => {
    if (!canWrite) {
      showToast("Permiso denegado", "No tienes permisos para crear tickets.", "error");
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    const fieldsToSend = ['customer_id', 'category_id', 'product_id', 'product_model_id', 'ticket_subject', 'ticket_description', 'ticket_serial_number'];
    fieldsToSend.forEach(key => { if (formData[key]) data.append(key, formData[key]); });
    formData.evidences.forEach(file => data.append('evidences', file));

    try {
      const response = await createTicketAdmin(data);
      setIsLoading(false);
      setIsModalOpen(false);
      showToast("¡El Ticket se ha creado exitosamente!", response.message, "success");
      resetForm();
    } catch (error) {
      setIsLoading(false);
      showToast("Error al registrar", error.message, "error");
    }
  };

  const currentFlagIso = countryRules[formData.customer_country_code]?.iso ?? 'hn';

  return (
    <div className={styles.createTicketContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Crear Nuevo Ticket</h1>
        <p className={styles.subtitle}>Ingresa la información detallada para registrar el caso.</p>
      </div>

      {!canRead || !canWrite ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#777', backgroundColor: '#F9FAFB', borderRadius: '24px', border: '1px dashed #E5E7EB' }}>
          <LuShieldAlert style={{ fontSize: '48px', color: '#EF4444', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', color: '#111827', margin: '0 0 8px 0' }}>Acceso Restringido</h3>
          <p style={{ margin: 0 }}>No tienes los permisos necesarios para acceder a esta sección.</p>
        </div>
      ) : (
        <>
          <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(true); }} className={styles.formCard}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.stepNumber}>1</div>
                <h3 className={styles.stepTitle}>Información del Cliente</h3>
              </div>
              <div className={styles.formGridTwo}>
                <div className={styles.inputGroup} ref={dropdownRef}>
                  <label>Nombre del Cliente <span className={styles.required}>*</span></label>
                  <div className={styles.searchWrapper}>
                    <input
                      type="text"
                      placeholder="Escriba para buscar cliente..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)}
                      required
                    />
                    <LuSearch className={styles.searchIcon} />
                    {showDropdown && filteredCustomers.length > 0 && (
                      <ul className={styles.dropdownList}>
                        {filteredCustomers.map(c => (
                          <li key={c.customer_id} onClick={() => handleSelectCustomer(c)}>
                            {c.customer_first_name} {c.customer_last_name} <span>({c.customer_company})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Empresa</label>
                  <input type="text" value={formData.customer_company} readOnly className={styles.readOnlyInput} placeholder="..." />
                </div>
              </div>
              <div className={styles.formGridTwo}>
                <div className={styles.inputGroup}>
                  <label>Email</label>
                  <input type="text" value={formData.customer_email} readOnly className={styles.readOnlyInput} placeholder="..." />
                </div>
                <div className={styles.inputGroup}>
                  <label>Teléfono</label>
                  <div className={styles.phoneDisplay}>
                    <div className={styles.flagWrapper}>
                      <span className={`fi fi-${currentFlagIso}`}></span>
                    </div>
                    <input type="text" value={formData.customer_country_code ? `${formData.customer_country_code} ${formData.customer_phone}` : ''} readOnly className={styles.readOnlyInput} placeholder="..." />
                  </div>
                </div>
              </div>
              <div className={styles.formGridTwo}>
                <div className={styles.inputGroup}>
                  <label>Tipo de Registro</label>
                  <input type="text" value={formData.customer_registration_type?.toUpperCase() || ''} readOnly className={styles.readOnlyInput} />
                </div>
                <div className={styles.inputGroup}>
                  <label>No. de Registro</label>
                  <input type="text" value={formData.customer_registration_value} readOnly className={styles.readOnlyInput} />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.stepNumber}>2</div>
                <h3 className={styles.stepTitle}>Detalles del Equipo</h3>
              </div>
              <div className={styles.formGridTwo}>
                <div className={styles.formGroup}>
                  <label>Categoría *</label>
                  <select name="category_id" value={formData.category_id} onChange={handleCategorySelect} required>
                    <option value="">Selecciona una categoría</option>
                    {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Producto *</label>
                  <select name="product_id" value={formData.product_id} onChange={handleProductSelect} required disabled={!formData.category_id}>
                    <option value="">Seleccione un Producto</option>
                    {products.map(prod => <option key={prod.product_id} value={prod.product_id}>{prod.product_name}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.formGridTwo}>
                <div className={styles.formGroup}>
                  <label>Modelo {models.length > 0 && '*'}</label>
                  <select
                    name="product_model_id"
                    value={formData.product_model_id}
                    onChange={handleChange}
                    required={models.length > 0}
                    disabled={!formData.product_id || models.length === 0}
                  >
                    <option value="">{models.length > 0 ? "Seleccione un Modelo" : "Sin modelos disponibles"}</option>
                    {models.map(model => <option key={model.product_model_id} value={model.product_model_id}>{model.product_model_name}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>No. de Serie*</label>
                  <div className={styles.serialInputWrapper}>
                    <input
                      type="text"
                      name="ticket_serial_number"
                      value={formData.ticket_serial_number}
                      onChange={handleChange}
                      onBlur={(e) => handleVerifyWarranty(e.target.value)}
                      required
                      placeholder="Ingrese serie para validar"
                    />
                    {warrantyStatus.loading && <LuLoaderCircle className={styles.spinIcon} />}
                  </div>

                  {warrantyStatus.data && (
                    <div className={`${styles.warrantyInfo} ${warrantyStatus.data.is_expired ? styles.expired : styles.valid}`}>
                      {warrantyStatus.data.is_expired ? <LuShieldAlert /> : <LuShieldCheck />}
                      <span>{warrantyStatus.data.message} {warrantyStatus.data.is_expired && `(Venció: ${warrantyStatus.data.expiry_date})`}</span>
                    </div>
                  )}
                  {warrantyStatus.error && (
                    <div className={`${styles.warrantyInfo} ${styles.notFound}`}>
                      <LuShieldX />
                      <span>{warrantyStatus.error} (Ticket pasará a revisión manual)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}><div className={styles.stepNumber}>3</div><h3 className={styles.stepTitle}>Problemática</h3></div>
              <div className={styles.formGroup}>
                <label>Asunto del Ticket *</label>
                <input
                  type="text"
                  name="ticket_subject"
                  value={formData.ticket_subject}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo 10 caracteres"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Descripción detallada del problema *</label>
                <textarea
                  name="ticket_description"
                  value={formData.ticket_description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Mínimo 20 caracteres..."
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label>Adjuntar Evidencias (Fotos/Videos) <span className={styles.optional}>(Opcional)</span></label>
                <div className={styles.uploadArea}>
                  <input type="file" id="evidences" multiple onChange={handleFileChange} accept=".jpg,.png,.pdf,.mp4" style={{ display: 'none' }} />
                  <label htmlFor="evidences" className={styles.uploadLabel}>
                    <LuUpload className={styles.uploadIcon} />
                    <span>{formData.evidences.length > 0 ? `${formData.evidences.length} archivos seleccionados` : "Cargar archivos (Máx 15MB)"}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.btnCancel} onClick={resetForm}>Limpiar Formulario</button>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={!isFormValid}
                style={!isFormValid ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                Registrar Ticket
              </button>
            </div>
          </form>

          {isModalOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.confirmationCard}>
                <div className={styles.iconWrapper}><FaQuestion className={styles.faIcon} /></div>
                <h2 className={styles.modalTitle}>¿Seguro que deseas crear el ticket?</h2>
                <p className={styles.modalText}>Al confirmar, el ticket se registrará y no podrá modificarse. El Ticket será gestionado por un administrador para poder avanzar
                </p>
                <div className={styles.modalButtons}>
                  <button onClick={() => setIsModalOpen(false)} className={styles.btnCancelModal} disabled={isLoading}>Regresar</button>
                  <button onClick={handleFinalSubmit} className={styles.btnAcceptModal} disabled={isLoading}>
                    {isLoading ? <LuLoaderCircle className={styles.spin} /> : "Confirmar Registro"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {toastConfig.show && (
        <div className={`${styles.successToast} ${toastConfig.type === 'error' ? styles.errorToast : ''}`}>
          <div className={styles.toastIcon}>
            {toastConfig.type === 'success' ? <LuCheck /> : <LuCircleAlert />}
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

export default CreateTicket;