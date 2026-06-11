import { lazy } from "react";

const NotFound = lazy(() => import("./NotFound"));

const sessionRoutes = [
  { path: "*", element: <NotFound /> }
];

export default sessionRoutes;