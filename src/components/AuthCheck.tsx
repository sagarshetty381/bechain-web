import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import NavigationMenu from './NavigationMenu';
import { SocketProvider } from '../contexts/SocketProvider';

export const AuthCheck = (props: any) => {
    const { Component } = props;
    const navigation = useNavigate();

    const userDetails = localStorage.getItem('user');
    useEffect(() => {
        if (!userDetails) {
            navigation('/login');
        }
    })

    return (
        <SocketProvider>
            <div className='flex flex-row'>
                <NavigationMenu />
                {userDetails && <Component />}
            </div>
        </SocketProvider>
    )
}