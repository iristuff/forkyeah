import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { FocusLayout, Layout, WelcomeGate } from './components/Layout';
import Home from './routes/Home';
import Passport from './routes/Passport';
import Ranks from './routes/Ranks';
import Chef from './routes/Chef';
import Profile from './routes/Profile';
import Cuisine from './routes/Cuisine';
import Cook from './routes/Cook';
import Welcome from './routes/Welcome';

const router = createBrowserRouter([
  {
    element: <WelcomeGate />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/passport', element: <Passport /> },
          { path: '/ranks', element: <Ranks /> },
          { path: '/chef', element: <Chef /> },
          { path: '/profile', element: <Profile /> },
          { path: '/cuisine/:cuisineId', element: <Cuisine /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
  { path: '/welcome', element: <Welcome /> },
  {
    element: <FocusLayout />,
    children: [{ path: '/cook/:dishId', element: <Cook /> }],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
