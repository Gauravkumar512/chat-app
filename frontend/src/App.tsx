import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OAuthPage from "./pages/OAuthPage";
import ChatLayout from "./pages/ChatLayout";
import RoomsPage from "./pages/RoomsPage";
import RoomPage from "./pages/RoomPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/oauth" element={<OAuthPage />} />
                <Route path="/chat" element={<ChatLayout />}>
                    <Route index element={<RoomsPage />} />
                    <Route path="room/:roomId" element={<RoomPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
