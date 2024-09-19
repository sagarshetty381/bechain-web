import React, { useEffect, useRef, useState } from 'react';
import supabaseClient from '../helper/SupabaseClient';
import { useToastService } from '../hooks/useToastService';
import VideoChat from './VideoChat';
import { SocketProvider, useSocket } from '../contexts/SocketProvider';

interface ChatSectionProps {
    userId: string;
    sizeAdjust?: number;
}

const ChatSection = ({ userId, sizeAdjust }: ChatSectionProps) => {
    const [userDetails, setUserDetails] = useState([]);
    const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;
    const { toastError, toastSuccess } = useToastService();
    const [startVideoCall, setStartVideoCall] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);
    const [message, setMessage] = useState('');
    const { sendMessage, messages } = useSocket();

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        const { data, error } = await supabaseClient.client.from('users').select('*').eq('id', userId).single();

        if (error) {
            toastError("Error", 'Error fetching use details')
            return;
        }
        setUserDetails(data);
    };

    const handleMatchCall = () => {
        setStartVideoCall(true);
    };

    return (
        <>
            {userDetails &&
                <div ref={componentRef} className="w-full h-full flex flex-col relative bg-[url('../src/assets/background.png')]">
                    <div className='flex items-center p-2 border-b-2 border-black border-solid bg-gradient-to-r from-bcorange to-bcorange-dark rounded-b-md'>
                        <img className='object-fill mr-3 border-2 border-solid rounded-full h-14 w-14 border-bcblue' src={`${STORAGE_URL}/uploads/profiles/${userDetails.id}`} alt="" />
                        <p className='flex-1 text-white'>{userDetails.fname}</p>
                        <img className='w-8 h-8 mr-2 hover:cursor-pointer' onClick={handleMatchCall} src={require('../assets/video_call.png')} alt="" />
                    </div>
                    {messages.length > 0 && <div className='flex flex-col p-2 overflow-y-scroll'>
                        {messages.map(e => <p className={'p-1 px-2 mb-1 text-lg bg-bcorange border-2 border-bcblue border-solid min-w-[10%] w-fit ' + e.by}>{e.message}</p>)}
                    </div>}
                    <div className='absolute bottom-0 left-0 right-0 flex items-center bg-gray-200 border-2 border-solid'>
                        <input type="text" onChange={e => setMessage(e.target.value)} className='w-full h-12 p-2 mx-2 my-4 rounded-xl focus:outline-none' />
                        <img className="mr-1 h-9 w-9 hover:cursor-pointer" onClick={e => sendMessage(message, userId)} src={require('../assets/send.png')} alt="" />
                    </div>
                    {startVideoCall && <VideoChat sizeAdjust={componentRef.current?.offsetWidth || 950} receiverName={userDetails?.fname || ''} userToCall={userId} setStartVideoCall={setStartVideoCall} />}
                </div>}
        </>
    );
};

export default ChatSection;