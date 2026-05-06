import { createRouter, createRoute, createRootRoute, Outlet, Navigate } from '@tanstack/react-router';
import { ScenarioListPage } from '../features/scenarios/components/ScenarioListPage';
import { EditorPage } from '../features/editor/components/EditorPage';
import { ScenarioPlayerPage } from '../features/preview/components/ScenarioPlayerPage';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Navigate to="/scenarios" />,
});

const scenariosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scenarios',
  component: ScenarioListPage,
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scenarios/$id',
  component: EditorPage,
});

const previewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scenarios/$id/preview',
  component: ScenarioPlayerPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  scenariosRoute,
  editorRoute,
  previewRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
