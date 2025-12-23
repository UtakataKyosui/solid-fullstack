import { render } from 'solid-js/web';
import App from './App';
import './index.css';
import { AuthProvider } from './lib/auth';

const root = document.getElementById('root');
if (root) {
  render(() => (
    <AuthProvider>
      <App />
    </AuthProvider>
  ), root);
}
