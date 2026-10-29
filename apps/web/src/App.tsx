import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ApiError } from './api/client';
import { GameContainer } from './containers/GameContainer';
import { LoginContainer } from './containers/LoginContainer';
import { SeatProvider, useSeats } from './seats/SeatContext';

/** Any 401 means a stale token (e.g. API restarted): drop the session → Login screen. */
function QueryProvider({ children }: { children: ReactNode }) {
  const { logout } = useSeats();
  const [client] = useState(() => {
    const onError = (error: Error) => {
      if (error instanceof ApiError && error.status === 401) logout();
    };
    return new QueryClient({
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({ onError }),
      defaultOptions: { queries: { retry: false } },
    });
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function Screens() {
  const { session } = useSeats();
  return session ? <GameContainer session={session} /> : <LoginContainer />;
}

export function App() {
  return (
    <SeatProvider>
      <QueryProvider>
        <Screens />
      </QueryProvider>
    </SeatProvider>
  );
}
