import { LoginForm } from '../components/LoginForm';
import { useStartSession } from '../hooks/useStartSession';

export function LoginContainer() {
  const start = useStartSession();

  return (
    <LoginForm
      pending={start.isPending}
      error={start.error?.message ?? null}
      onSubmit={(username) => start.mutate(username)}
    />
  );
}
