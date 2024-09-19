import React, { useEffect, useState } from 'react';
import { animated, interpolate, useSprings } from '@react-spring/web';
import { useDrag } from 'react-use-gesture';
import './styles.css';
import supabaseClient from '../helper/SupabaseClient';
import StorageService from '../helper/StorageService';
import { useInterval } from '../hooks/useInterval';
import { useSocket } from '../contexts/SocketProvider';
import { CardProps } from '../enums/interfaces';
import { useToastService } from '../hooks/useToastService';
import MatchFoundScreen from '../layouts/MatchFoundScreen';

const SessionRoom = () => {
    const [cards, setCards] = useState<CardProps[]>([]);
    const [usersExist, setUsersExist] = useState(false);
    const [isUserProfileCompleted, setIsUserProfileCompleted] = useState(false);
    const { startMatch, endMatch, offlineUsers } = useSocket();
    const { toastError, toastSuccess } = useToastService();
    const [matchFoundData, setMatchFoundData] = useState({ user1: {}, user2: {} });
    const [matchFound, setMatchFound] = useState(false);


    const getUserData = async () => {
        const currentUserId = StorageService.getItem('user').id;

        await supabaseClient.client.rpc('get_user_details', { user_id: currentUserId }).then(async ({ data, error }) => {
            if (error) {
                console.log(error)
            } else {
                const cardDetails = data.filter((user: CardProps) => user.id !== currentUserId && offlineUsers.indexOf(user.id) !== -1);
                if (cardDetails.length > 0) {
                    setCards(cardDetails);
                    setUsersExist(true);
                }
            }
        })
    };

    useEffect(() => {
        setIsUserProfileCompleted(StorageService.getItem('userProfileCompleted') || false);
        const userDetails = StorageService.getItem('user');
        const currentUserId = userDetails.id;
        matchFoundData.user1 = { id: currentUserId, fname: userDetails.fname };
        setMatchFoundData(matchFoundData);
        startMatch(currentUserId);

        return () => { endMatch(currentUserId); }
    }, [])

    useEffect(() => {
        setCards(cards.filter(card => offlineUsers.indexOf(card.id) !== -1));
        if (cards.length <= 0) setUsersExist(false);
    }, [offlineUsers])

    const to = (i: number) => ({
        x: 0,
        y: i * -4,
        scale: 1.5,
        rot: -10 + Math.random() * 20,
        delay: i * 100,
    })
    const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
    const trans = (r: number, s: number) => `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

    const [gone] = useState(() => new Set())
    const [props, api] = useSprings(cards.length, i => ({
        ...to(i),
        from: from(i),
    }), [cards])
    const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
        const trigger = velocity > 0.2;
        const dir = xDir < 0 ? -1 : 1;
        if (!down && trigger) gone.add(index);
        api.start(i => {
            if (index !== i) return;
            const isGone = gone.has(index);
            const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0;
            const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0);
            const scale = down ? 1.1 : 1;
            if (isGone) {
                updateMatchingStatus(cards[cards.length - 1], dir === 1 ? 'like' : 'dislike');
            }
            return {
                x,
                rot,
                scale,
                delay: 0,
                config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
            }
        })
        if (!down && gone.size === cards.length) {
            setUsersExist(false);
            setTimeout(() => {
                gone.clear()
                // api.start(i => to(i))
            }, 600);
        }
    });

    useInterval(() => {
        if (!usersExist) getUserData();
    }, usersExist ? null : 5000);

    const updateMatchingStatus = async (user: any, status: string) => {
        const currentUserId = StorageService.getItem('user').id;
        setCards(cards);
        const { data, error } = await supabaseClient.client.from('matches').select('*')
            .eq('user1_id', user.id).eq('user2_id', currentUserId);

        if (error) {
            console.log(error);
            return;
        }
        if (data !== null && data.length > 0) {
            const { error } = await supabaseClient.client.from('matches').update({
                ismatch: data[0].status === 'like' && status === 'like' ? true : false,
                match_date: new Date()
            }).eq('user1_id', user.id).eq('user2_id', currentUserId);
            if (data[0].status === 'like' && status === 'like') {
                matchFoundData.user2 = { id: user.id, fname: user.fname };
                setMatchFoundData(matchFoundData);
                setTimeout(() => { setMatchFound(true) }, 1000);
            }
            if (error) { console.log(error) };
            return;
        }

        await supabaseClient.client.from('matches').insert([{
            user1_id: currentUserId,
            user2_id: user.id,
            status: status,
            match_date: new Date()
        }]).then(({ error }) => {
            if (error) { console.log(error) };
        });
    }

    const reportUser = () => {
        if (cards.length > 0) {
            toastSuccess('Success', 'User reported successfully');
        } else {
            toastError('Error', 'No users to report');
        }
    }

    return (
        <div className='overflow-hidden bg-white match-container'>
            <div className='flex flex-col group'>
                <img className='absolute w-8 border-2 hover:scale-105 right-2 top-2 hover:cursor-pointer ' src={require('../assets/help.png')} alt="" />
                <div className='absolute p-3 text-white bg-black border-2 rounded-lg right-2 hidden top-12 w-[40%] opacity-0 group-hover:block group-hover:opacity-80'>
                    <p>Conditions</p>
                    <li>To unlock your profile for other users and ignite potential connections, be sure to step into the match room and stay online.</li>
                    <li>Feel the spark? Swipe right to explore a potential connection!</li>
                    <li>Not quite your vibe? Swipe left to gracefully pass on the match.</li>
                </div>

            </div>
            <img className='absolute w-8 top-2 hover:cursor-pointer z-[1000]' src='https://img.icons8.com/fluency-systems-filled/48/FA5252/important-user.png' alt=""
                onClick={reportUser} />
            <img className='absolute w-8 top-2 left-[125px] hover:cursor-pointer z-[1000]' src={require('../assets/online.png')} alt="" />
            <p className='absolute px-2 text-base text-green-500 bg-green-200 border-2 border-green-400 rounded-lg bottom-4'>{cards?.length || 0} users online</p>
            <img className='absolute' src={require('../assets/match.png')} alt="" />
            <div className='layout-container'>
                {isUserProfileCompleted && <div className="circles">
                    <div className="circle1"></div>
                    <div className="circle2"></div>
                    <div className="circle3"></div>
                </div>}
                {!isUserProfileCompleted ?
                    <div className='fixed p-5 font-semibold border-2 rounded-lg text-bcorange bg-bcorange-light border-bcblue'>
                        <p className='text-xl text-center' >Your journey to connections<span className='text-bcblue'> begins here!</span></p><br />
                        <p className='text-lg'>Complete the checklist below to get match-ready:</p><br />
                        <ul className='list-disc list-inside'>
                            <li>Upload your best profile picture to make a great first impression.</li>
                            <li>Showcase at least 5 photos to highlight your unique style.</li>
                            <li>Personalize your match preferences in the settings for tailored connections.</li>
                        </ul>
                    </div> :
                    <div className='cards_container'>
                        {props.length <= 0 && <p className='fixed text-xl font-semibold mt-28 text-bcorange'>Searching for users in the match room...</p>}
                        {props.map(({ x, y, rot, scale }, i) => {
                            return (
                                <animated.div className='deck' key={i} style={{ x, y }}>
                                    <animated.div
                                        {...bind(i)}
                                        style={{
                                            transform: interpolate([scale], trans),
                                            backgroundImage: `url(https://hjqjruueqdtekvcsgfhc.supabase.co/storage/v1/object/public/uploads/profiles/${cards[i].id})`,
                                        }}
                                    ><p>{cards[i].fname}</p>
                                    </animated.div>
                                </animated.div>)
                        }
                        )}
                    </div>
                }
                {/* <div className='button_container'>
                    <img src={require('../assets/remove-icon.png')} alt="" onClick={updateTest} />
                    <img src={require('../assets/heart-icon.png')} alt="" />
                </div>  */}
            </div>
            {matchFound && <MatchFoundScreen matchFoundData={matchFoundData} setMatchFound={setMatchFound} />}
        </div>
    );
}

export default SessionRoom;
