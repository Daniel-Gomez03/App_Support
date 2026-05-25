// ============================================
// COMPONENT: POLICY MODAL (Garantías)
// Modal de visualización y edición de la política
// de garantía vigente.
//
// MODOS:
//   'view' — muestra el contenido actual de la
//            política (policy_content: secciones + ítems)
//   'edit' — permite editar versión, etiqueta de fecha
//            y el texto de cada ítem de cada sección
//
// PROPS:
//   isOpen   — controla visibilidad
//   onClose  — cierra el modal
//   policy   — objeto con policy_version,
//              policy_updated_label, policy_content
//   onSave   — fn(data) async; recibe el objeto
//              con los campos actualizados
//   canEdit  — muestra el botón "Editar Política"
//
// draft: copia profunda de policy_content para edición
//   en memoria. Se reconstruye con makeDraft() al abrir
//   el modal y al cancelar, sin mutar el prop original.
//
// updateItemText: actualiza un ítem puntual dentro de
//   draft usando deep clone para evitar mutación del
//   estado previo.
// ============================================

import React, { useState, useEffect } from 'react';
import { LuX, LuShieldCheck, LuPencil, LuSave, LuLoaderCircle } from 'react-icons/lu';
import styles from './PolicyModal.module.less';

const deepClone = obj => JSON.parse(JSON.stringify(obj));

const makeDraft = policy => ({
    version: policy.policy_version,
    label: policy.policy_updated_label,
    sections: deepClone(policy.policy_content),
});

const PolicyModal = ({ isOpen, onClose, policy, onSave, canEdit }) => {
    const [mode, setMode] = useState('view');
    const [draft, setDraft] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && policy) {
            setMode('view');
            setDraft(makeDraft(policy));
        }
    }, [isOpen, policy]);

    const updateItemText = (si, ii, value) => {
        setDraft(prev => {
            const sections = deepClone(prev.sections);
            sections[si].items[ii].text = value;
            return { ...prev, sections };
        });
    };

    const handleSave = async () => {
        if (!draft.version.trim() || !draft.label.trim()) return;
        setIsSaving(true);
        try {
            await onSave({
                policy_version: draft.version.trim(),
                policy_updated_label: draft.label.trim(),
                policy_content: draft.sections,
            });
            setMode('view');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setDraft(makeDraft(policy));
        setMode('view');
    };

    if (!isOpen || !policy) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>

                <div className={styles.modalHeader}>
                    <div className={styles.headerTitle}>
                        <div className={styles.headerIconWrap}>
                            <LuShieldCheck className={styles.headerIcon} />
                        </div>
                        <div>
                            <h2>Políticas de Garantía</h2>
                            <span className={styles.headerSub}>
                                Última actualización: {policy.policy_updated_label}
                            </span>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} disabled={isSaving}>
                        <LuX />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {mode === 'view' ? (
                        <div className={styles.policyView}>
                            {policy.policy_content.map((section, si) => (
                                <div key={si} className={styles.section}>
                                    <h3 className={styles.sectionTitle}>{section.title}</h3>
                                    {section.items.map((item, ii) => (
                                        <div key={ii} className={styles.item}>
                                            <span className={styles.itemKey}>{item.key}</span>
                                            <p className={styles.itemText}>{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.editForm}>
                            <div className={styles.metaRow}>
                                <div className={styles.formGroup}>
                                    <label>Versión</label>
                                    <input
                                        value={draft.version}
                                        onChange={e => setDraft(p => ({ ...p, version: e.target.value }))}
                                        placeholder="v1.1"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Etiqueta de fecha</label>
                                    <input
                                        value={draft.label}
                                        onChange={e => setDraft(p => ({ ...p, label: e.target.value }))}
                                        placeholder="Abril 2026"
                                    />
                                </div>
                            </div>

                            {draft.sections.map((section, si) => (
                                <div key={si} className={styles.editSection}>
                                    <h4 className={styles.editSectionTitle}>{section.title}</h4>
                                    {section.items.map((item, ii) => (
                                        <div key={ii} className={styles.editItem}>
                                            <label>{item.key}</label>
                                            <textarea
                                                value={item.text}
                                                rows={3}
                                                onChange={e => updateItemText(si, ii, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    {mode === 'view' ? (
                        canEdit && (
                            <button className={styles.editBtn} onClick={() => setMode('edit')}>
                                <LuPencil /> Editar Política
                            </button>
                        )
                    ) : (
                        <>
                            <button className={styles.cancelBtn} onClick={handleCancel} disabled={isSaving}>
                                Cancelar
                            </button>
                            <button
                                className={styles.saveBtn}
                                onClick={handleSave}
                                disabled={isSaving || !draft.version.trim() || !draft.label.trim()}
                            >
                                {isSaving
                                    ? <LuLoaderCircle className={styles.spin} />
                                    : <LuSave />
                                }
                                Actualizar Política
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PolicyModal;