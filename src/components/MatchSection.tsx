import React, { useEffect, useState } from 'react';
import { animated, interpolate, useSprings } from '@react-spring/web';
import { useDrag } from 'react-use-gesture';
import './styles.css';
import supabaseClient from '../helper/SupabaseClient';
import StorageService from '../helper/StorageService';
import { useInterval } from '../hooks/useInterval';
import { useSocket } from '../context/SocketProvider';

interface CardProps {
    id: string;
    fname: string;
}

const MatchSection = () => {
    const [cards, setCards] = useState<CardProps[]>([]);
    const [usersExist, setUsersExist] = useState(false);
    const [isUserProfileCompleted, setIsUserProfileCompleted] = useState(false);
    const { startMatch, endMatch, offlineUsers } = useSocket();

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
        setIsUserProfileCompleted(true);
        const currentUserId = StorageService.getItem('user').id;
        startMatch(currentUserId);

        return () => { endMatch(currentUserId); }
    }, [])

    useEffect(() => {
        console.log("offlineUsers");
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
    const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })
    const trans = (r: number, s: number) => `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

    const [gone] = useState(() => new Set())
    const [props, api] = useSprings(cards.length, i => ({
        ...to(i),
        from: from(i),
    }), [cards])
    const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
        const trigger = velocity > 0.2
        const dir = xDir < 0 ? -1 : 1
        if (!down && trigger) gone.add(index)
        api.start(i => {
            if (index !== i) return
            const isGone = gone.has(index)
            const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0
            const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0)
            const scale = down ? 1.6 : 1.5
            if (isGone) {
                updateMatchingStatus(cards[cards.length - 1], dir === 1 ? 'like' : 'dislike')
            }
            return {
                x,
                rot,
                scale,
                delay: undefined,
                config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
            }
        })
        if (!down && gone.size === cards.length) {
            setUsersExist(false);
            setTimeout(() => {
                useInterval(() => {
                    getUserData();
                }, usersExist ? 1000 * 10 : null);

                gone.clear()
                api.start(i => to(i))
            }, 600)
        }
    });

    useInterval(() => {
        if (!usersExist) getUserData();
    }, usersExist ? null : 2000);

    const updateMatchingStatus = async (user: any, status: string) => {
        const currentUserId = StorageService.getItem('user').id;
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

    return (
        <div className='match-container bg-[#fff4e8]'>
            <img className='absolute w-8 border-2 right-2 top-2' src={require('../assets/help.png') } alt="" />
            <img className='absolute w-8 top-2 border-b-2 border-solid border-bcorange' src={require('../assets/flag.png') } alt="" />
            <img className='absolute' src={require('../assets/match.png') } alt="" />
            <div className='layout-container'>
                {isUserProfileCompleted && <div className="circles">
                    <div className="circle1"></div>
                    <div className="circle2"></div>
                    <div className="circle3"></div>
                </div>}
                {!isUserProfileCompleted ?
                    <div className='fixed font-semibold text-bcorange'>
                        <p className='text-xl' >Please complete your profile to start matching...</p><br />
                        <p className='text-lg'>Make sure below checklist is completed.</p><br />
                        <ul className='list-disc list-inside'>
                            <li>Your profile pic is uploaded.</li>
                            <li>Atleast 5 photos are uploaded in your profile.</li>
                            <li>Set your preferences in settings.</li>
                        </ul>
                    </div>:
                    <div className='cards_container'>
                        {props.length <= 0 && <p className='mt-28 fixed font-semibold text-bcorange text-xl'>Waiting for users to come online...</p>}
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
        </div>
    );
}

export default MatchSection;
