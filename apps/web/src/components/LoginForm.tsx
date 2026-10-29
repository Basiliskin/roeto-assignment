import { FormEvent, useState } from 'react';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  pending: boolean;
  error: string | null;
  onSubmit: (username: string) => void;
}

export function LoginForm({ pending, error, onSubmit }: LoginFormProps) {
  const [username, setUsername] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(username);
  };

  return (
    <main className={styles.screen}>
      <form className={styles.card} onSubmit={submit} noValidate>
        <h1 className={styles.brand}>
          <span aria-hidden="true">🎲</span> Dice Table
        </h1>
        <p className={styles.tagline}>Roll as long as you dare. Hold before 6 & 6.</p>

        <label className={styles.label} htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          required
          maxLength={20}
          aria-invalid={error ? true : undefined}
          aria-describedby="username-hint"
        />
        <p id="username-hint" className={styles.hint}>
          3–20 letters, digits or _
        </p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button className={styles.submit} type="submit" disabled={pending}>
          {pending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </main>
  );
}
