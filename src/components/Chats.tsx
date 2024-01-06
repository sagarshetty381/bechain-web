//create this component
import React, { useEffect, useState } from 'react';
import StorageService from '../helper/StorageService';
import supabaseClient from '../helper/SupabaseClient';
import ChatSection from './ChatSection';

export const Chats = () => {
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
        <div className='w-full flex'>
            <div className='w-[30%] bg-bcorange-light border-r-4 border-bcorange border-dotted'>
                <h1 className='font-bold text-bcblue p-4'>Chat Room</h1>
                <div className='h-[0.15rem]  w-full bg-bcorange'></div>
                {matchData.map((match: any) => {
                    return (
                        <div onClick={() => { setSelectedChatId(match.id) }} key={match.id} className='p-3 font-semibold text-bcorange flex items-center border-[0.05rem] border-b-bcblue border-solid hover:cursor-pointer'>
                            <img className='h-14 w-14 mr-3 rounded-full border-2 border-solid border-bcblue' src={`${STORAGE_URL}/uploads/profiles/${match.id}`} alt="" />
                            <p>{match.fname}</p>
                        </div>
                    )
                })}
            </div>
            <div className='flex-1 bg-bcorange-light'>
                {selectedChatId.length > 0 ? <ChatSection userId={selectedChatId} /> :
                    <div className="w-full h-full flex flex-col justify-center items-center bg-transparent">
                        <img className='h-36 aspect-auto object-contain' src={require('../assets/logo.png')} alt="" />
                        <img className='w-72 aspect-[3] object-cover' src={require('../assets/bechain_logo.png')} alt="" />
                    </div>}
            </div>
        </div>
    )
}