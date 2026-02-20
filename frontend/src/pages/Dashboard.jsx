import React from 'react';
import Card from '../components/Cards/Card';
import styles from './Dashboard.module.less';
import TablesCases from '../components/Tables/TablesCases';
import PendingCases from '../components/Tables/PendingTables';
import TicketGraph from '../components/TicketGraph/TicketGraph';
import Feedback from '../components/Feedback/Feedback';
import alertIcon from '../assets/icons/Alert-icon.svg';
import checkIcon from '../assets/icons/Check-icon.svg';
import clockIcon from '../assets/icons/Clock-icon.svg';
import grahpIcon from '../assets/icons/Graph-icon.svg';

const Dashboard = () => {

  const usersData = [
    { usuario: "Nino Nakano", nuevo: 2, enProceso: 4, pendienteInfo: 10, escalado: 0, resuelto: 10 },
    { usuario: "Mikasa Ackerman", nuevo: 2, enProceso: 4, pendienteInfo: 5, escalado: 0, resuelto: 10 },
    { usuario: "Tanjiro Kamado", nuevo: 10, enProceso: 4, pendienteInfo: 10, escalado: 2, resuelto: 10 },
    { usuario: "Hinata Hyuga", nuevo: 2, enProceso: 3, pendienteInfo: 10, escalado: 0, resuelto: 10 },
    { usuario: "Levi Ackerman", nuevo: 2, enProceso: 4, pendienteInfo: 0, escalado: 0, resuelto: 10 },
  ];

  const casesData = [
    {nuevo: 2, enProceso: 5, pendienteInfo: 3, escalado: 0, resuelto: 1}
  ];

  const feedbackData = [
    { name: "Nino Nakano", rating: 3, avatar: null }, 
    { name: "Mikasa Ackerman", rating: 5, avatar: null },
    { name: "Tanjiro Kamado", rating: 5, avatar: null },
    { name: "Hinata Hyuga", rating: 5, avatar: null },
    { name: "Levi Ackerman", rating: 4, avatar: null },
  ];

  return (
    <div className={styles.dashboardContainer}>

      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Resumen de tickets y casos por asignar.</p>
      </div>

      <div className={styles.statsGrid}>

        <Card
          title="Tickets Pendientes"
          value="0"
          percentage="0"
          icon={alertIcon}
          isDark={true}
        />

        <Card
          title="Tickets Finalizados"
          value="0"
          percentage="0"
          icon={checkIcon}
        />

        <Card
          title="Tickets Mes Anterior"
          value="0"
          percentage="0"
          icon={clockIcon}
        />

        <Card
          title="Tickets Mes Actual"
          value="0"
          percentage="0"
          icon={grahpIcon}
        />
      </div>
      <div className={styles.contentGrid}>
        <div className={styles.leftColumn}>
          <TablesCases data={usersData} />
          <PendingCases data={casesData}/>
        </div>
        <div className={styles.rightColumn}>
          <div style={{ height: '440px', background: '#fff', borderRadius: '20px', padding: '24px' }}>
            <TicketGraph />
            <Feedback data={feedbackData} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;