//create this component
import React, { useEffect, useState } from 'react';
import StorageService from '../helper/StorageService';
import supabaseClient from '../helper/SupabaseClient';
import ChatSection from '../components/ChatSection';
import { DoubleDivider } from '../layouts/DoubleDivider';

export const ChatRoom = () => {
    const [matchData, setMatchData] = useState<[]>([]);
    const STORAGE_URL = process.env.REACT_APP_STORAGE_URL || '';
    const currentUserId: string = StorageService.getItem('user').id;
    const [selectedChatId, setSelectedChatId] = useState("");

    const getUserData = async () => {
        await supabaseClient.client.rpc('get_user_matches', { user_id: currentUserId }).then(async ({ data, error }) => {
            if (error) {
                console.log(error)
            }
            if (data) {
                setMatchData(data);
            }
        })
    };

    useEffect(() => {
        getUserData();
    }, []);

    return (
        <div className='flex w-full m-8 rounded-lg shadow-xl'>
            <div className='w-[30%] bg-bcorange-light rounded-l-lg'>
                <h1 className='p-4 text-xl font-bold text-bcblue'>Chat Room</h1>
                <DoubleDivider alignPosition='items-center' />
                {matchData.length > 0 ? matchData.map((match: any) => {
                    return (
                        <div onClick={() => { setSelectedChatId(match.id) }} key={match.id} className='flex items-center p-3 m-2 font-semibold rounded-xl text-bcorange bg-bcorange-dark hover:cursor-pointer'>
                            <img className='w-16 h-16 mr-3 border-2 border-solid rounded-full border-bcblue' src={`${STORAGE_URL}/uploads/profiles/${match.id}`} alt="" />
                            <p className='text-lg'>{match.fname}</p>
                        </div>
                    )
                }) : <div className='flex flex-col items-center justify-center w-full h-full gap-4 px-2 bg-transparent'>
                    <img className='w-14 h-14' src={require('../assets/chat.png')} alt="" />
                    <p className='text-center text-base-'>"Looks like you haven't started a conversation yet! ✨</p>
                    <p className='text-lg text-center text-bcorange'>Head over to the match room and let the connections begin. Who knows, your perfect match might be just a swipe away! 💗"
                    </p>
                </div>}
            </div>
            <div className='flex-1 rounded-r-lg bg-slate-100'>
                {selectedChatId.length > 0 ? <ChatSection userId={selectedChatId} /> :
                    <div className="flex flex-col items-center justify-center w-full h-full bg-transparent">
                        <img className='object-contain h-36 aspect-auto' src={require('../assets/logo.png')} alt="" />
                        <img className='w-72 aspect-[3] object-cover' src={require('../assets/bechain_logo.png')} alt="" />
                    </div>}
            </div>
        </div>
    )
}