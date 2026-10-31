import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { Layout } from './components/Layout';
import Home from './routes/Home';
import Passport from './routes/Passport';
import Ranks from './routes/Ranks';
import Chef from './routes/Chef';
import Profile from './routes/Profile';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/passport', element: <Passport /> },
      { path: '/ranks', element: <Ranks /> },
      { path: '/chef', element: <Chef /> },
      { path: '/profile', element: <Profile /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
