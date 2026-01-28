import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending: isLoading, error } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    login(
      { email, password },
      {
        onSuccess: () => {
          navigate('/dashboard');
        },
        onError: (err: any) => {
          const message = err.response?.data?.message || 'Login failed';
          setLocalError(message);
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Seat Booking System</h1>
        <h2 className={styles.subtitle}>Login</h2>

        {(localError || error) && (
          <div className={styles.errorMessage}>{localError || error?.message}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? Contact your administrator.
        </p>
      </div>
    </div>
  );
};
