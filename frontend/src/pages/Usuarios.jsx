import React, { useState, useEffect } from "react";
import styles from "./Usuarios.module.less";
import lensIcon from "../assets/icons/Lens-icon.svg";
import { MdFilterListAlt } from "react-icons/md";
import { LuCheck, LuX } from "react-icons/lu";

import UsersTable from "../components/Usuarios/UsersTable/UsersTable";
import UserEditModal from "../components/Usuarios/UserEditModal/UserEditModal";
import UserViewModal from "../components/Usuarios/UserViewModal/UserViewModal";
import UserFilterModal from "../components/Usuarios/UserFilterModal/UserFilterModal";
import AddCustomerModal from "../components/Usuarios/AddCustomerModal/AddCustomerModal";

import { getUsers, toggleUserStatus, updateUser, getSecciones } from "../services/Userservice";
import { getCustomers, toggleCustomerStatus, updateCustomer, socket } from "../services/Customerservice";
import { useAuth } from "../context/AuthContext";

const Usuarios = () => {
    const { user } = useAuth();

    const candRead = user?.Permissions?.some(p => p.Seccion?.module_name === "Usuarios" && p.permissions_read === 1);
    const canEdit = user?.Permissions?.some(p => p.Seccion?.module_name === "Usuarios" && p.permissions_edit === 1);
    const canWrite = user?.Permissions?.some(p => p.Seccion?.module_name === "Usuarios" && p.permissions_write === 1);

    const [activeTab, setActiveTab] = useState("internos");
    const [searchTerm, setSearchTerm] = useState("");

    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toastConfig, setToastConfig] = useState({ show: false, title: "", message: "", type: "success" });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [confirmActivate, setConfirmActivate] = useState(null);

    const [appliedFilters, setAppliedFilters] = useState({
        rol: '',
        cargo: '',
        area: ''
    });

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [usersData, seccionesData, customersData] = await Promise.all([
                getUsers(),
                getSecciones(),
                getCustomers()
            ]);

            setUsers(usersData);
            setSecciones(seccionesData);
            setCustomers(customersData);
            setError(null);
        } catch (err) {
            setError("Error al cargar la información de los servidores.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
        document.title = "Soporte | Usuarios";

        socket.connect();
        socket.on('customer_review_required', (data) => {
            const typeLabel = data.validation_type === 'factura' ? 'Factura' : 'Serie';
            loadInitialData();
            showToast(
                'Revisión Manual Requerida',
                `${data.full_name} requiere validación de ${typeLabel}: ${data.validation_value}`,
                'warning'
            );
        });

        socket.on('customer_updated', (updatedCustomer) => {
            setCustomers(prev =>
                prev.map(c =>
                    c.customer_id === updatedCustomer.customer_id
                        ? { ...c, ...updatedCustomer }
                        : c
                )
            );
        });

        return () => {
            socket.off('customer_review_required');
            socket.off('customer_updated');
            socket.disconnect();
        };
    }, []);

    const filterOptions = {
        roles: [...new Set(users.map(u => u.rol).filter(Boolean))],
        cargos: [...new Set(users.map(u => u.cargo).filter(Boolean))],
        areas: [...new Set(users.map(u => u.area).filter(Boolean))]
    };

    const getFilteredData = () => {
        if (activeTab === "internos") {
            return users.filter(u => {
                if (u.rol?.toLowerCase() === 'cliente') return false;
                if (appliedFilters.rol && (appliedFilters.rol === "null" ? (u.rol !== null && u.rol !== "") : u.rol !== appliedFilters.rol)) return false;
                if (appliedFilters.cargo && (appliedFilters.cargo === "null" ? (u.cargo !== null && u.cargo !== "") : u.cargo !== appliedFilters.cargo)) return false;
                if (appliedFilters.area && (appliedFilters.area === "null" ? (u.area !== null && u.area !== "") : u.area !== appliedFilters.area)) return false;

                if (searchTerm) {
                    const searchLower = searchTerm.toLowerCase();
                    return (
                        u.user_id?.toString().includes(searchLower) ||
                        u.nombre_completo?.toLowerCase().includes(searchLower)
                    );
                }
                return true;
            });
        } else {
            return customers.filter(c => {
                const searchLower = searchTerm.toLowerCase();
                if (!searchTerm) return true;
                return (
                    c.customer_id?.toString().includes(searchLower) ||
                    c.full_name?.toLowerCase().includes(searchLower) ||
                    c.customer_email?.toLowerCase().includes(searchLower) ||
                    c.customer_company?.toLowerCase().includes(searchLower) ||
                    c.customer_registration_value?.toLowerCase().includes(searchLower)
                );
            });
        }
    };

    const handleEditUser = (item) => {
        if (!canEdit) return;

        if (activeTab === "clientes") {
            const fullCustomerData = customers.find(c => c.customer_id === item.customer_id);
            setSelectedUser(fullCustomerData || item);
        } else {
            setSelectedUser(item);
        }

        setIsEditModalOpen(true);
    };

    const handleViewUser = (item) => {
        if (!candRead) return;
        setSelectedUser(item);
        setIsViewModalOpen(true);
    };

    const handleSaveUser = async (id, dataToSave) => {
        try {
            if (activeTab === "internos") {
                await updateUser(id, dataToSave);
                setUsers(prev => prev.map(u => u.user_id === id ? { ...u, ...dataToSave, Permissions: dataToSave.permisos } : u));
                showToast("Éxito", "Usuario interno actualizado correctamente.");
            } else {
                await updateCustomer(id, dataToSave);

                const updatedCustomers = await getCustomers();
                setCustomers(updatedCustomers);
                showToast("Éxito", "Información del cliente actualizada.");
            }
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error en handleSaveUser:", error);
            showToast("Error", error.message || "No se pudo realizar la actualización.");
        }
    };

    const handleToggleStatus = async (item) => {
        if (!canEdit) return showToast("Error", "No tienes permisos.");

        if (activeTab === "clientes" && item.customer_status === 0) {
            setConfirmActivate(item);
            return;
        }

        await executeToggle(item);
    };

    const executeToggle = async (item) => {
        try {
            if (activeTab === "internos") {
                const response = await toggleUserStatus(item.user_id);
                setUsers(prev => prev.map(u => u.user_id === item.user_id ? { ...u, estado: response.estado } : u));
                showToast("Estado actualizado", response.message);
            } else {
                const response = await toggleCustomerStatus(item.customer_id);
                setCustomers(prev => prev.map(c =>
                    c.customer_id === item.customer_id ? { ...c, customer_status: response.new_status } : c
                ));
                const toastMsg = response.email_sent
                    ? `Cuenta activada. Se notificó a ${item.customer_first_name} ${item.customer_last_name} por correo.`
                    : response.message;
                showToast("Estado de cliente actualizado", toastMsg);
            }
        } catch (error) {
            console.error(error);
            showToast("Error", error.message || "No se pudo cambiar el estado.");
        }
    };

    const handleCustomerCreated = async (message, isManualReview) => {
        showToast(isManualReview ? "Revisión Manual" : "Registro Exitoso", message);
        try {
            const updatedCustomers = await getCustomers();
            setCustomers(updatedCustomers);
        } catch (error) {
            console.error("Error al refrescar clientes:", error);
        }
    };

    const showToast = (title, message, type = "success") => {
        setToastConfig({ show: true, title, message, type });
        setTimeout(() => setToastConfig({ show: false, title: "", message: "", type: "success" }), 4000);
    };

    return (
        <div className={styles.usuariosContainer}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Gestión de Usuarios</h1>
                    <p className={styles.subtitle}>Administra el acceso de clientes y personal interno.</p>
                </div>
            </div>

            <div className={styles.controlsWrapper}>
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "internos" ? styles.activeTab : ""}`}
                        onClick={() => { setActiveTab("internos"); setSearchTerm(""); }}
                    >
                        Usuarios Internos
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "clientes" ? styles.activeTab : ""}`}
                        onClick={() => { setActiveTab("clientes"); setSearchTerm(""); }}
                    >
                        Clientes
                    </button>
                </div>

                <div className={styles.toolbar}>
                    <div className={styles.searchBar}>
                        <img src={lensIcon} alt="Buscar" className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={activeTab === "internos" ? "Buscar por nombre..." : "Buscar por nombre, email o empresa..."}
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles.actionButtons}>
                        {activeTab === "clientes" && canWrite && (
                            <button className={styles.createBtn} onClick={() => setIsAddCustomerModalOpen(true)}>
                                + Nuevo Cliente
                            </button>
                        )}

                        {activeTab === "internos" && (
                            <div className={styles.iconGroup}>
                                <button
                                    className={`${styles.filterBtn} ${Object.values(appliedFilters).some(v => v !== '') ? styles.activeFilter : ''}`}
                                    onClick={() => setShowFilterModal(true)}
                                >
                                    <MdFilterListAlt />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loadingInfo}>Cargando datos...</div>
                ) : error ? (
                    <div className={styles.errorInfo}>{error}</div>
                ) : (
                    <UsersTable
                        data={getFilteredData()}
                        onEdit={handleEditUser}
                        onView={handleViewUser}
                        onToggleStatus={handleToggleStatus}
                        canEdit={canEdit}
                        isCustomerTable={activeTab === "clientes"}
                    />
                )}
            </div>

            <UserEditModal
                isOpen={isEditModalOpen}
                user={selectedUser}
                secciones={secciones}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveUser}
            />

            <UserViewModal isOpen={isViewModalOpen} user={selectedUser} onClose={() => setIsViewModalOpen(false)} />
            <UserFilterModal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} onApplyFilter={setAppliedFilters} currentFilters={appliedFilters} options={filterOptions} />

            <AddCustomerModal
                isOpen={isAddCustomerModalOpen}
                onClose={() => setIsAddCustomerModalOpen(false)}
                onCustomerCreated={handleCustomerCreated}
            />

            {toastConfig.show && (
                <div className={toastConfig.type === 'warning' ? styles.warningToast : styles.successToast}>
                    <div className={styles.toastIconContainer}><LuCheck className={styles.checkIcon} /></div>
                    <div className={styles.toastContent}>
                        <h4>{toastConfig.title}</h4>
                        <p>{toastConfig.message}</p>
                    </div>
                    <button onClick={() => setToastConfig({ show: false, title: "", message: "", type: "success" })} className={styles.toastClose}><LuX /></button>
                </div>
            )}

            {confirmActivate && (
                <div className={styles.confirmOverlay}>
                    <div className={styles.confirmModal}>
                        <h3 className={styles.confirmTitle}>Activar Cuenta</h3>
                        <p className={styles.confirmText}>
                            ¿Confirmas activar la cuenta de <strong>{confirmActivate.customer_first_name} {confirmActivate.customer_last_name}</strong>?
                        </p>
                        <p className={styles.confirmSubtext}>
                            Se le enviará un correo notificándole que ya puede acceder a la aplicación.
                        </p>
                        <div className={styles.confirmActions}>
                            <button
                                className={styles.confirmCancel}
                                onClick={() => setConfirmActivate(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className={styles.confirmAccept}
                                onClick={async () => {
                                    const item = confirmActivate;
                                    setConfirmActivate(null);
                                    await executeToggle(item);
                                }}
                            >
                                Sí, Activar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Usuarios;