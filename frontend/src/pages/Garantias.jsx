import React, { useState, useEffect } from "react";
import styles from "./Garantias.module.less"; 
import lensIcon from "../assets/icons/Lens-icon.svg";
import { MdFilterListAlt } from "react-icons/md";
import { LuCheck, LuX, LuUpload } from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import WarrantiesTable from "../components/Garantias/WarrantiesTable/WarrantiesTable";
import AddWarrantyModal from "../components/Garantias/AddWarrantyModal/AddWarrantyModal";
import BulkUploadModal from "../components/Garantias/BulkUploadModal/BulkUploadModal";
import WarrantyFilterModal from "../components/Garantias/WarrantyFilterModal/WarrantyFilterModal";

import { 
    getWarranties, 
    createWarranty, 
    updateWarranty,
    socket 
} from "../services/Warrantyservice";
import { useAuth } from "../context/AuthContext";

const Garantias = () => {
    const { user } = useAuth();

    const canRead = user?.Permissions?.some(p =>
        p.Seccion?.module_name === "Garantias" && p.permissions_read === 1
    );
    const canEdit = user?.Permissions?.some(p =>
        p.Seccion?.module_name === "Garantias" && p.permissions_edit === 1
    );
    const canWrite = user?.Permissions?.some(p =>
        p.Seccion?.module_name === "Garantias" && p.permissions_write === 1
    );

    const [warranties, setWarranties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [toastConfig, setToastConfig] = useState({ show: false, title: "", message: "" });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedWarranty, setSelectedWarranty] = useState(null);

    const [appliedFilters, setAppliedFilters] = useState({
        status: 'all'
    });

    const loadWarranties = async () => {
        try {
            setLoading(true);
            const data = await getWarranties();
            setWarranties(data);
            setError(null);
        } catch (err) {
            setError("Error al cargar las garantías. Contacte al administrador.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (canRead) {
            loadWarranties();
            socket.connect();
            
            socket.on('warranty_created', () => loadWarranties());
            socket.on('warranties_bulk_updated', (data) => {
                loadWarranties();
                showToast("Sincronización masiva", `Se han cargado ${data.created} registros.`);
            });
        }

        document.title = "Soporte | Garantías";

        return () => {
            socket.off('warranty_created');
            socket.off('warranties_bulk_updated');
            socket.disconnect();
        };
    }, [canRead]);

    const filteredWarranties = warranties.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
            item.warranty_serial_number?.toLowerCase().includes(searchLower) ||
            item.warranty_invoice_number?.toLowerCase().includes(searchLower)
        );

        const matchesVigencia = 
            appliedFilters.status === 'all' ? true :
            appliedFilters.status === 'expired' ? item.is_expired === true :
            item.is_expired === false;

        return matchesSearch && matchesVigencia;
    });

    const showToast = (title, message) => {
        setToastConfig({ show: true, title, message });
        setTimeout(() => setToastConfig({ show: false, title: "", message: "" }), 5000);
    };

    const handleSaveWarranty = async (id, formData) => {
        try {
            if (id) {
                await updateWarranty(id, formData);
                showToast("Garantía Actualizada", "Cambios guardados correctamente.");
            } else {
                await createWarranty(formData);
                showToast("Registro Exitoso", "Nueva garantía creada.");
            }
            setIsAddModalOpen(false);
            loadWarranties();
        } catch (err) {
            alert(err.error || "Error al procesar la solicitud");
        }
    };

    if (!canRead) {
        return (
            <div className={styles.noAccess}>
                <LuShieldCheck className={styles.lockIcon} />
                <h2>Acceso Restringido</h2>
                <p>No tienes permisos para visualizar el módulo de garantías.</p>
            </div>
        );
    }

    return (
        <div className={styles.garantiasContainer}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Control de Garantías</h1>
                    <p className={styles.subtitle}>Gestión de vigencia y sincronización activa.</p>
                </div>
            </div>

            <div className={styles.controlsWrapper}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBar}>
                        <img src={lensIcon} alt="Buscar" className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar por serie o factura..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles.actionButtons}>
                        {canWrite && (
                            <>
                                <button className={styles.bulkBtn} onClick={() => setIsBulkModalOpen(true)}>
                                    <LuUpload /> Carga Masiva
                                </button>
                                <button className={styles.createBtn} onClick={() => { setSelectedWarranty(null); setIsAddModalOpen(true); }}>
                                    <FiPlus /> Nueva Garantía
                                </button>
                            </>
                        )}

                        <div className={styles.iconGroup}>
                            <button
                                className={`${styles.filterBtn} ${appliedFilters.status !== 'all' ? styles.activeFilter : ''}`}
                                onClick={() => setShowFilterModal(true)}
                            >
                                <MdFilterListAlt />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loadingState}>Sincronizando registros...</div>
                ) : (
                    <WarrantiesTable
                        data={filteredWarranties}
                        onEdit={(item) => { setSelectedWarranty(item); setIsAddModalOpen(true); }}
                        canEdit={canEdit} 
                    />
                )}
            </div>

            {canWrite && (
                <>
                    <AddWarrantyModal
                        isOpen={isAddModalOpen}
                        warranty={selectedWarranty}
                        onClose={() => setIsAddModalOpen(false)}
                        onSave={handleSaveWarranty}
                    />
                    <BulkUploadModal
                        isOpen={isBulkModalOpen}
                        onClose={() => setIsBulkModalOpen(false)}
                        onSuccess={() => loadWarranties()} 
                    />
                </>
            )}

            <WarrantyFilterModal
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                currentFilters={appliedFilters}
                onApply={setAppliedFilters}
            />

            {toastConfig.show && (
                <div className={styles.successToast}>
                    <div className={styles.toastIconContainer}><LuCheck className={styles.checkIcon} /></div>
                    <div className={styles.toastContent}>
                        <h4>{toastConfig.title}</h4>
                        <p>{toastConfig.message}</p>
                    </div>
                    <button onClick={() => setToastConfig({ show: false })} className={styles.toastClose}><LuX /></button>
                </div>
            )}
        </div>
    );
};

export default Garantias;