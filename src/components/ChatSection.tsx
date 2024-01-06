import React, { useEffect, useRef, useState } from 'react';
import supabaseClient from '../helper/SupabaseClient';
import { useToastService } from '../hooks/useToastService';
import VideoChat from './VideoChat';
import { SocketProvider, useSocket } from '../context/SocketProvider';

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
                    <div className='flex p-2 items-center border-b-2 border-black border-solid bg-bcblue rounded-b-md'>
                        <img className='h-14 w-14 mr-3 rounded-full border-2 border-solid border-bcblue object-fill' src={`${STORAGE_URL}/uploads/profiles/${userDetails.id}`} alt="" />
                        <p className='text-white flex-1'>{userDetails.fname}</p>
                        <img className='h-8 w-8' onClick={handleMatchCall} src={require('../assets/video_call.png')} alt="" />
                    </div>
                    { messages.length > 0 && <div className='p-2 flex flex-col overflow-y-scroll'>
                        {messages.map(e => <p className={'p-1 px-2 mb-1 text-lg bg-bcorange border-2 border-bcblue border-solid min-w-[10%] w-fit ' + e.by}>{e.message}</p>)}
                    </div>}
                    <div className='absolute bottom-0 left-0 right-0 flex items-center'>
                        <input type="text" onChange={e => setMessage(e.target.value)} className='w-full h-12 p-2 border-2 border-solid border-bcblue rounded-lg' />
                        <img className="h-9 w-9" onClick={e => sendMessage(message, userId)} src={require('../assets/send.png')} alt="" />
                    </div>
                    {startVideoCall && <VideoChat sizeAdjust={componentRef.current?.offsetWidth} userToCall={userId} setStartVideoCall={setStartVideoCall}  />}
                </div>}
        </>
    );
};

export default ChatSection;