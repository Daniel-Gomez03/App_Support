import React, { useState, useRef, useEffect } from 'react';
import {
    LuX,
    LuCloudUpload,
    LuFileSpreadsheet,
    LuCircleCheck,
    LuTriangleAlert,
    LuLoaderCircle
} from 'react-icons/lu';
import { bulkUploadWarranties } from '../../../services/Warrantyservice';
import styles from './BulkUploadModal.module.less';

const BulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (uploading) {
                const message = "Hay una carga masiva en curso. Si refrescas la página, podrías perder el reporte de errores.";
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        };

        if (uploading) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [uploading]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const extension = selectedFile.name.split('.').pop().toLowerCase();
            if (['xlsx', 'xls', 'csv'].includes(extension)) {
                setFile(selectedFile);
            } else {
                alert("Por favor, selecciona un archivo Excel (.xlsx, .xls) o CSV.");
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const response = await bulkUploadWarranties(file);
            setResult(response.summary);

            if (response.summary && response.summary.created > 0) {
                onSuccess();
            }
        } catch (error) {
            alert(error.error || "Error crítico al procesar el archivo");
        } finally {
            setUploading(false);
        }
    };

    const resetModal = () => {
        if (uploading) return;

        setFile(null);
        setResult(null);
        setUploading(false);
        onClose();
    };

    return (
        <div
            className={styles.modalOverlay}
            onClick={!uploading ? resetModal : undefined}
        >
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <div className={styles.titleGroup}>
                        <LuCloudUpload className={styles.headerIcon} />
                        <h2>Carga Masiva de Garantías</h2>
                    </div>
                    {!uploading && (
                        <button className={styles.closeBtn} onClick={resetModal}>
                            <LuX />
                        </button>
                    )}
                </div>

                <div className={styles.modalBody}>
                    {!result ? (
                        <>
                            <div className={styles.instructionBox}>
                                <p><strong>Formato requerido:</strong> Use las columnas exactas:</p>
                                <code>warranty_serial_number, warranty_invoice_number, warranty_purchase_date</code>
                                <p className={styles.note}>* No incluya la columna de estado; el sistema la calculará.</p>
                            </div>

                            <div
                                className={`${styles.dropZone} ${file ? styles.hasFile : ''} ${uploading ? styles.disabledZone : ''}`}
                                onClick={() => !uploading && fileInputRef.current.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".xlsx, .xls, .csv"
                                    hidden
                                    disabled={uploading}
                                />
                                <LuFileSpreadsheet className={styles.uploadIcon} />
                                {file ? (
                                    <span className={styles.fileName}>{file.name}</span>
                                ) : (
                                    <span>Seleccionar archivo Excel o CSV</span>
                                )}
                            </div>

                            <div className={styles.actions}>
                                <button
                                    className={styles.uploadBtn}
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
                                >
                                    {uploading ? (
                                        <>
                                            <LuLoaderCircle className={styles.spin} />
                                            Procesando... Espere por favor
                                        </>
                                    ) : (
                                        'Procesar Archivo'
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.resultContainer}>
                            <div className={styles.resultHeader}>
                                <LuCircleCheck className={styles.successIcon} />
                                <h3>Procesamiento Finalizado</h3>
                            </div>

                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryItem}>
                                    <span>Filas Totales</span>
                                    <strong>{result.total || 0}</strong>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span>Cargadas</span>
                                    <strong className={styles.countCreated}>{result.created || 0}</strong>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span>Errores</span>
                                    <strong className={styles.countSkipped}>{result.skipped || 0}</strong>
                                </div>
                            </div>

                            {result.errors && result.errors.length > 0 && (
                                <div className={styles.errorLog}>
                                    <h4>
                                        <LuTriangleAlert /> Detalles de errores:
                                    </h4>
                                    <ul>
                                        {result.errors.map((err, i) => (
                                            <li key={i}>
                                                <strong>Fila {err.row}:</strong> {err.error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button className={styles.finishBtn} onClick={resetModal}>
                                Finalizar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;