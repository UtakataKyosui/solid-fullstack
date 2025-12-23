import { Show } from 'solid-js';
import Auth from './components/auth/Auth';
import MainPage from './components/MainPage';
import { useAuth } from './lib/auth';
import { Toaster } from '@/components/ui/toast';
import { css } from 'styled-system/css';

const App = () => {
  const { user } = useAuth();

  return (
    <div class={css({ minH: '100vh', bg: 'slate.950', color: 'white' })}>
      <Toaster />
      <Show when={user()} fallback={
        <div class={css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minH: '100vh',
          p: '4'
        })}>
          <h1 class={css({
            fontSize: { base: '4xl', sm: '6xl' },
            fontWeight: 'bold',
            letterSpacing: 'tight',
            color: 'transparent',
            mb: '8',
            bgGradient: 'to-r',
            gradientFrom: 'indigo.400',
            gradientTo: 'cyan.400',
            bgClip: 'text',
          })}>
            Inventory Manager
          </h1>
          <Auth />
        </div>
      }>
        <MainPage />
      </Show>
    </div>
  );
};

export default App;
