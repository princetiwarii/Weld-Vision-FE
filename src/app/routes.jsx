import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import sessionRoutes from "./views/sessions/session-routes";

const WeldInspection  = Loadable(lazy(() => import("app/views/dashboard/WeldInspection")));
const LogsPage        = Loadable(lazy(() => import("app/views/logs/LogsPage")));
const LogDetailPage   = Loadable(lazy(() => import("app/views/logs/LogDetailPage")));
const FrameDetailPage = Loadable(lazy(() => import("app/views/logs/FrameDetailPage")));
const ObjectManualResultsPage = Loadable(lazy(() => import("app/views/logs/ObjectManualResultsPage")));

const routes = [
  { path: "/", element: <Navigate to="/dashboard/default" /> },
  {
    element: <MatxLayout />,
    children: [
      { path: "/dashboard/default",            element: <WeldInspection />  },
      { path: "/logs",                          element: <LogsPage />        },
      { path: "/logs/:id",                      element: <LogDetailPage />   },
      { path: "/logs/object/:objectId",         element: <ObjectManualResultsPage /> },
      { path: "/logs/:id/frame/:imageLabel",    element: <FrameDetailPage /> },
    ]
  },
  ...sessionRoutes
];

export default routes;