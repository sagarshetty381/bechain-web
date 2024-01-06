import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css'
import MatchSection from './components/MatchSection';
import NavigationMenu from './components/NavigationMenu';
import { Navigate, Outlet, RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom';
import LoginSignup from './components/LoginSignup';
import SignUp from './components/SignUp';
import { ChakraProvider } from '@chakra-ui/react'
import { Profile } from './components/Profile';
import { Chats } from './components/Chats';
import { Settings } from './components/Settings';
import { SocketProvider } from './context/SocketProvider';

const AppLayout = () => {
    const navigate = useNavigate();
    const userDetails = localStorage.getItem('user');
    if (!userDetails) { 
        navigate('/login');
        // window.location.assign('./login')
    }
    
    return (
        <div className='home-container'>
            <NavigationMenu />
            <Outlet />
        </div>
    );
}

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                path: "/",
                element: <Navigate to={'/profile'}/>
            },
            {
                path: "/profile",
                element: <Profile />
            },
            {
                path: "/match-room",
                element: <MatchSection />
            },
            {
                path: "/chats",
                element: <Chats />
            },
            {
                path: "/settings",
                element: <Settings />
            },
        ]
    },
    {
        path: "/login",
        element: <LoginSignup />
    },
    {
        path: "/signUp",
        element: <SignUp />
    },
    {
        path: "*",
        element: <div>404</div>
    }
])

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
    <ChakraProvider toastOptions={{ defaultOptions: { position: 'bottom-right' } }}>
        <SocketProvider>
            <RouterProvider router={appRouter} />
        </SocketProvider>
    </ChakraProvider>);