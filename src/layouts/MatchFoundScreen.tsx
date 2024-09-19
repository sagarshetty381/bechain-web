import { set } from "lodash";
import React, { useEffect } from "react";
const confetti = require('canvas-confetti');

const MatchFoundScreen = (props) => {

    useEffect(() => {
        var myCanvas = document.createElement('canvas');
        myCanvas.style.position = 'absolute';
        let matchElement = document.querySelector('.match-room');
        myCanvas.width = matchElement?.clientWidth || 0;
        myCanvas.height = matchElement?.clientHeight || 0;
        matchElement?.appendChild(myCanvas);

        var myConfetti = confetti.create(myCanvas, {
            resize: true,
            useWorker: true
        });
        var count = 200;
        var defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            myConfetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        fire(0.2, {
            spread: 60,
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });

        setTimeout(() => {
            const sectionElement = document.querySelector('.match-room section');
            if (!sectionElement) return;
            sectionElement.style = 'animation: matchAnimation 1s';
            setTimeout(() => {
                props.setMatchFound(false);
            }, 500)
        }, 10000)
    }, [])

    return (
        <div className="match-room fixed left-0 w-full h-screen z-[2000] flex items-center justify-center bg-orange-500/50 ">
            <section className="flex flex-col items-center">
                <div className="flex">
                    <img className=' bg-white object-cover rounded-md shadow-xl w-[20rem] h-[30rem] -rotate-12' src={`https://hjqjruueqdtekvcsgfhc.supabase.co/storage/v1/object/public/uploads/profiles/${props.matchFoundData.user1.id}`} alt={props.matchFoundData.user1.fname || 'Bechain User'} />
                    <img className='bg-white object-cover rounded-md shadow-xl w-[20rem] h-[30rem] rotate-12' src={`https://hjqjruueqdtekvcsgfhc.supabase.co/storage/v1/object/public/uploads/profiles/${props.matchFoundData.user2.id}`} alt={props.matchFoundData.user2.fname || 'Bechain User'} />
                </div>
                <p className="m-3 text-lg font-extrabold text-bcorange">Congratulations, you found a match! 🎉</p>
                <button className="p-2 text-white rounded-md bg-bcorange w-fit hover:cursor-pointer" onClick={() => console.log("yo")}>Start the conversation!</button>
            </section>
        </div>
    )
}

export default MatchFoundScreen;