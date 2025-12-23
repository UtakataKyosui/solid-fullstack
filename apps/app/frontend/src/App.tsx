import { Show } from 'solid-js';
import Auth from './components/auth/Auth';
import MainPage from './components/MainPage';
import { useAuth } from './lib/auth';

const App = () => {
  const { user } = useAuth();

  return (
    <div class="min-h-screen bg-slate-950 text-white">
      <Show when={user()} fallback={
        <div class="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 class="text-4xl font-bold tracking-tight text-white mb-8 sm:text-6xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Rsbuild + Solid + Postgres
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
