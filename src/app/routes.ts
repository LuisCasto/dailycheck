import { createBrowserRouter } from 'react-router';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Logger from './pages/Logger';
import Metrics from './pages/Metrics';
import Edit from './pages/Edit';
import Contact from './pages/Contact';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { path: 'dashboard', Component: Dashboard },
      { path: 'logger', Component: Logger },
      { path: 'metrics', Component: Metrics },
      { path: 'edit', Component: Edit },
      { path: 'contact', Component: Contact },
    ],
  },
]);
