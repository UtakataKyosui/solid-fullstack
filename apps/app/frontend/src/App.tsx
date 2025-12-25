import { Show } from 'solid-js';
import PasskeyLogin from './components/auth/PasskeyLogin';
import MainPage from './components/MainPage';
import { AuthProvider, useAuth } from './lib/auth';
import { Toaster } from '@/components/ui/toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Box, Flex } from 'styled-system/jsx';

const AuthenticatedApp = () => {
  const { user } = useAuth();

  return (
    <Box minH="100vh" bg="bg.canvas" color="fg.default">
      <Toaster />

      {/* Theme Toggle Button */}
      <Flex justify="flex-end" p="4">
        <ThemeToggle />
      </Flex>

      {/* Show login screen if not authenticated, otherwise show main app */}
      <Show when={user()} fallback={<PasskeyLogin />}>
        <MainPage />
      </Show>
    </Box>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;
