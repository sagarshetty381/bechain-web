import React, { useEffect, useRef, useState } from 'react';
import Peer from "simple-peer";
import { useSocket } from '../context/SocketProvider';
import StorageService from '../helper/StorageService';
import CommonService from '../helper/CommonService';
import { set } from 'lodash';

interface VideoChatProps {
    userToCall: string;
    name: string;
    sizeAdjust: number;
    setStartVideoCall: (value: boolean) => void;
}

const VideoChat = (props: VideoChatProps) => {
    const userDetails = StorageService.getItem('user');
    const [index, setIndex] = useState<number>(0);
    const [stream, setStream] = useState<any>()
    // const [question, setQuestion] = useState<string>("Your question will appear here.");
    const [receivingCall, setReceivingCall] = useState(false)
    const [caller, setCaller] = useState("")
    const [callerSignal, setCallerSignal] = useState("")
    const [callAccepted, setCallAccepted] = useState(false)
    const [idToCall, setIdToCall] = useState("")
    const [callEnded, setCallEnded] = useState(false)
    const [name, setName] = useState("")
    const myVideo = useRef(null)
    const userVideo = useRef(null)
    const connectionRef = useRef()
    const { callUserSocket, receivingCallDetails, answerCallSocket, handleCallAccepted, question } = useSocket();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream);
            if (myVideo.current) {
                myVideo.current.srcObject = stream
            }
            setIdToCall(props.userToCall)
        })
        setName(props.name);
    }, []);

    const callUser = (id: string) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        })

        peer.on("signal", (data) => {
            callUserSocket({ id, signalData: data, name: userDetails?.fname || '' });
        })

        peer.on("stream", (stream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = stream
            }
        })

        handleCallAccepted(peer);
        setCallAccepted(true);

        connectionRef.current = peer;
    };

    useEffect(() => {
        setReceivingCall(receivingCallDetails.receivingCall);
        setCaller(receivingCallDetails.caller);
        setName(receivingCallDetails.name);
        setCallerSignal(receivingCallDetails.callerSignal);
    }, [receivingCallDetails]);

    const answerCall = () => {
        setCallAccepted(true)
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        })

        peer.on("signal", (data) => {
            answerCallSocket({ signal: data, to: caller });
        })

        peer.on("stream", (stream) => {
            userVideo.current.srcObject = stream
        })

        peer.signal(callerSignal)
        connectionRef.current = peer
    };

    const leaveCall = () => {
        callAccepted && setCallEnded(true);
        connectionRef.current.destroy()
    };

    const changeQuestion = () => {
        if (index === question.length - 1) {
            const quesContainer = document.getElementById('question-container');
            quesContainer?.classList.add('hidden');
        }
        setIndex(index + 1);
    }

    const exitVideoCall = () => { 
        leaveCall();
        props.setStartVideoCall(false);
    }

    return (
        <div className='flex flex-col justify-around fixed top-0 left-0 bg-bcblue h-full z-10 border-r-2 border-dotted border-bcorange' style={{ width: `calc(100% - ${props.sizeAdjust}px)` }}>
            <img className='w-8 mr-1 self-end z-10' onClick={() => { exitVideoCall}} src={require('../assets/cross.png')} alt="" />
            <div>
                {callAccepted && !callEnded ?
                    <video playsInline className='w-[70%] h-56 mx-auto' ref={userVideo} autoPlay></video> :
                    <div className='w-[70%] h-56 mx-auto bg-gray-400'></div>
                }
            </div>
            <div className='flex justify-center text-white z-10'>
                <div className="mr-4 ">
                    <div className="call-button">
                        {callAccepted && !callEnded ? (
                            <button onClick={leaveCall} className='bg-bcorange p-2 rounded-md'>End Matching</button>
                        ) : (
                            <button onClick={() => { callUser(idToCall) }} className='bg-bcorange p-2 rounded-md'>Start Matching</button>
                        )}
                    </div>
                </div>
                {receivingCall && !callAccepted &&
                    <button className='bg-bcorange p-2 rounded-md' onClick={answerCall}><span>{name}</span> has initiated Match</button>
                }
            </div>
            <div className='flex flex-col bottom-4 left-4 items-center justify-between'>
                <video playsInline className='w-[70%] h-56' ref={myVideo} autoPlay muted></video>
            </div>
            <div id='question-container' className='w-[-webkit-fill-available] flex flex-col justify-between items-center absolute bg-bcblue h-full z-1'>
                <p className='m-5 text-bcorange text-2xl font-bold'>{question[index]}</p>
                <button className='bg-bcorange px-3 py-1 rounded-md mb-4 text-white' onClick={changeQuestion}>Next</button>
            </div>
        </div>
    )
}

export default VideoChat;