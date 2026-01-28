import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './RegisterPage.module.css';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!name || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerCard}>
        <h1 className={styles.title}>Seat Booking System</h1>
        <h2 className={styles.subtitle}>Register</h2>

        {(localError || error) && (
          <div className={styles.errorMessage}>{localError || error}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={isLoading}
              required
            />
          </div>

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

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};
