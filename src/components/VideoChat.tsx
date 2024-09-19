import React, { useEffect, useRef, useState } from 'react';
import Peer from "simple-peer";
import { useSocket } from '../contexts/SocketProvider';
import StorageService from '../helper/StorageService';
import { transform } from 'lodash';
import { transition } from '@chakra-ui/react';

interface VideoChatProps {
    userToCall: string;
    receiverName: string;
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
    const myVideo = useRef<HTMLVideoElement>(null)
    const userVideo = useRef<HTMLVideoElement>(null)
    const connectionRef = useRef<Peer.Instance>()
    const { callUserSocket, receivingCallDetails, answerCallSocket, handleCallAccepted, question } = useSocket();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream);
            if (myVideo.current) {
                myVideo.current.srcObject = stream
            }
            setIdToCall(props.userToCall)
        })
        setName(props.receiverName);
    }, []);

    const callUser = (id: string) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        })

        peer.on("signal", (data) => {
            callUserSocket({ id, signalData: data, name: props.receiverName || '' });
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
            if (userVideo.current) userVideo.current.srcObject = stream;
        })

        peer.signal(callerSignal)
        connectionRef.current = peer
    };

    const leaveCall = () => {
        callAccepted && setCallEnded(true);
        if (connectionRef.current) connectionRef.current.destroy()
        props.setStartVideoCall(false);
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
        <div className='fixed top-0 left-0 z-10 flex flex-col justify-around h-full -translate-x-full border-r-2 border-dotted video-chat-enter videoDiv bg-bcblue border-bcorange' style={{ width: `calc(100% - ${props.sizeAdjust + 32}px)` }}>
            <img className='absolute z-10 self-end w-8 mr-1 top-3 hover:scale-110 hover:cursor-pointer' onClick={() => { exitVideoCall() }} src={require('../assets/cross.png')} alt="" />
            <div className='bg-black border-2 border-bcorange'>
                {callAccepted && !callEnded ?
                    <video playsInline className='mx-auto w-[90%] rounded-md boder-2' ref={userVideo} autoPlay></video> :
                    <div className='w-[70%] h-56 mx-auto bg-gray-400'></div>
                }
            </div>
            <div className='z-10 flex justify-center text-white'>
                <div className="mr-4 ">
                    <div className="call-button">
                        {callAccepted && !callEnded ? (
                            <button onClick={leaveCall} className='p-2 bg-red-500 rounded-md'>Not feeling the vibe? End the call gracefully.</button>
                        ) : (
                            !receivingCall && <button onClick={() => { callUser(idToCall) }} className='p-2 rounded-md bg-bcorange animate-bounce'>Initiate the match-making round?</button>
                        )}
                    </div>
                </div>
                {receivingCall && !callAccepted &&
                    <button className='p-2 bg-green-600 rounded-md animate-pulse' onClick={answerCall}><span>{name}</span> has started a call with you!</button>
                }
            </div>
            <div className='flex flex-col justify-end bottom-4 left-4'>
                <video playsInline className='w-[70%] h-56' ref={myVideo} autoPlay muted></video>
            </div>
            <div id='question-container' className='w-[-webkit-fill-available] flex flex-col justify-between items-center absolute bg-bcblue h-full z-1'>
                <p className='m-5 text-2xl font-bold text-bcorange'>{question[index]}</p>
                {callAccepted && <button className='px-3 py-1 mb-4 text-white rounded-md bg-bcorange' onClick={changeQuestion}>({index + 1}/{question.length}) Next</button>}
            </div>
        </div>
    )
}

export default VideoChat;