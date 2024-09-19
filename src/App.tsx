import React from 'react';
import '../index.css'
import SessionRoom from './pages/SessionRoom';
import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { MyProfile } from './pages/MyProfile';
import { ChatRoom } from './pages/ChatRoom';
import { Settings } from './pages/Settings';
import { AuthCheck } from './components/AuthCheck';

const AppLayout = () => {
    return (
        <Routes>
            <Route path="/profile" element={<AuthCheck Component={MyProfile} />} />
            <Route path="/match-room" element={<AuthCheck Component={SessionRoom} />} />
            <Route path="/chats" element={<AuthCheck Component={ChatRoom} />} />
            <Route path="/settings" element={<AuthCheck Component={Settings} />} />

            <Route path="/login/:deeplink" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signUp" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default AppLayout;