import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  Navigate,
} from '@tanstack/react-router';

import { EditorPage } from '@/features/editor/components/EditorPage';
import { ScenarioListPage } from '@/features/scenarios/components/ScenarioListPage';
import { ScenarioPlayerPage } from '@/features/preview/components/ScenarioPlayerPage';

export const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Navigate to="/scenarios" />,
});

export const scenariosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scenarios',
  component: ScenarioListPage,
});

export const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scenarios/$id',
  component: EditorPage,
});

export const previewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scenarios/$id/preview',
  component: ScenarioPlayerPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  scenariosRoute,
  editorRoute,
  previewRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  basepath: '/im',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
