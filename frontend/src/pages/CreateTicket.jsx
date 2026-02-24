import React, {useEffect} from 'react';
import styles from './CreateTicket.module.less';

const CreateTicket = () => {

  useEffect(() => {
    document.title = "Soporte | Crear Ticket";
  }, []);

  return (
    <div className={styles.createTicketContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Crear Nuevo Ticket</h1>
        <p className={styles.subtitle}>Ingresa la información detallada </p>
      </div>
      <div className=''>

      </div>
    </div>
  );
};
export default CreateTicket;