import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection";
import WaitingRoom from "./pages/WaitingRoom";
import Game from "./pages/Game";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RoleSelection />,
  },
  {
    path: "/waiting-room",
    element: <WaitingRoom />,
  },
  {
    path: "/game",  // ← AJOUTEZ CETTE ROUTE
    element: <Game />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;