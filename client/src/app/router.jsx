import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { ROLES } from '@/features/auth/authContext';
import { RequireAuth, RequireRole } from '@/features/auth/RouteGuards';
import { CameraCreatePage } from '@/pages/cameras/CameraCreatePage';
import { CameraDetailsPage } from '@/pages/cameras/CameraDetailsPage';
import { CameraEditPage } from '@/pages/cameras/CameraEditPage';
import { CameraListPage } from '@/pages/cameras/CameraListPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const adminOnly = (element) => <RequireRole roles={[ROLES.ADMIN]}>{element}</RequireRole>;

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'cameras',
        children: [
          { index: true, element: <CameraListPage /> },
          { path: 'new', element: adminOnly(<CameraCreatePage />) },
          { path: ':id', element: <CameraDetailsPage /> },
          { path: ':id/edit', element: adminOnly(<CameraEditPage />) },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
