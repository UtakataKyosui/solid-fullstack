import { render } from 'solid-js/web';
import App from './App';
import './index.css';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from './lib/theme';

const root = document.getElementById('root');
if (root) {
  render(() => (
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  ), root);
}
