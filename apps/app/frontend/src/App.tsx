import { Route } from '@solidjs/router';
import Layout from './components/Layout';
import PasskeyLogin from './components/auth/PasskeyLogin';
import MainPage from './components/MainPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Route path="/" component={Layout}>
      <Route path="/login" component={PasskeyLogin} />
      <Route path="/" component={ProtectedRoute}>
        <Route path="/" component={MainPage} />
      </Route>
    </Route>
  );
};

export default App;
