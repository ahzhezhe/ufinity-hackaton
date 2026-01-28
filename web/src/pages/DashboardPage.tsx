import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './DashboardPage.module.css';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome, {user?.name}!</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2>Dashboard</h2>
          <p>Welcome to the Seat Booking System</p>
          <p>User Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
        </div>
      </main>
    </div>
  );
};
