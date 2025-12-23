// import { Show } from 'solid-js'; // Commented out with auth features
// import Auth from './components/auth/Auth'; // TODO: Re-enable in authentication branch
import MainPage from './components/MainPage';
// import { useAuth } from './lib/auth'; // Commented out with auth features
import { Toaster } from '@/components/ui/toast';
import { css } from 'styled-system/css';

const App = () => {
  // const { user } = useAuth(); // TODO: Re-enable in authentication branch

  return (
    <div class={css({ minH: '100vh', bg: 'slate.950', color: 'white' })}>
      <Toaster />

      {/* TODO: Re-enable authentication in separate branch */}
      {/* 
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
      */}

      {/* Temporary: Direct access to MainPage without authentication */}
      <MainPage />
    </div>
  );
};

export default App;
