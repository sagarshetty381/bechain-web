import React, { useCallback, useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client'
import StorageService from "../helper/StorageService";

interface SocketProviderProps {
    children?: React.ReactNode;
}

interface receivingCallDetails { 
    receivingCall: boolean;
    caller: string;
    callerSignal: string;
    name: string;
}

interface ISocketContext {
    sendMessage: (message: string, userId: string) => any;
    messages: {}[];
    startMatch: (userId: string) => any;
    offlineUsers: String[];
    endMatch: (message: string) => any;
    callUserSocket: (userData: any) => any;
    receivingCallDetails: receivingCallDetails;
    answerCallSocket: (userData: any) => any;
    handleCallAccepted: (peer: any) => any;
    question: string[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
    const state = React.useContext(SocketContext);
    if (!state) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket>();
    const [offlineUsers, setOfflineUsers] = useState<String[]>([]);
    const [messages, setMessages] = useState<string[]>([]);
    const [receivingCallDetails, setReceivingCallDetails] = useState({
        receivingCall: false,
        caller: '',
        callerSignal: '',
        name: '',
    });
    const [question, setQuestion] = useState<string[]>([]);

    const sendMessage: ISocketContext['sendMessage'] = useCallback((message, userId) => {
        if (socket) {
            socket.emit('event:message', { message, userId });
        }
    }, [socket]);

    const startMatch: ISocketContext['startMatch'] = useCallback((userId) => {
        if (socket) {
            socket.emit('event:start-match', userId);
            socket.on('event:session-status', (data: String[]) => {
                setOfflineUsers(data);
            })
        }
    }, [socket]);

    const endMatch: ISocketContext['endMatch'] = useCallback((userId) => {
        if (socket) {
            socket.emit('event:end-match', userId);
            socket.off('event:session-status')
        }
    }, [socket]);

    const callUserSocket: ISocketContext['callUserSocket'] = useCallback((userData) => {
        if (socket) {
            socket.emit("callUser", {
                userToCall: userData.id,
                signalData: userData.signalData,
                from: socket.id,
                name: userData.name,
            })
            socket.on("matchQues", (questions) => { 
                setQuestion(questions);
            })
        }
    }, [socket]);

    const answerCallSocket: ISocketContext['answerCallSocket'] = useCallback((userData) => {
        if (socket) { 
            socket.emit("answerCall", userData)
            socket.on("matchQues", (questions) => { 
                setQuestion(questions);
            })
        }
    }, [socket]);

    const handleCallAccepted: ISocketContext['handleCallAccepted'] = useCallback((peer) => { 
        if (socket) { 
            socket.on("callAccepted", (signal) => {
                peer.signal(signal);
            })
        }
    },[socket])

    const handleNewMessage = useCallback((message: string) => {
        setMessages((messages) => [...messages, message]);
    }, [])

    useEffect(() => {
        const _socket = io('http://localhost:4000');
        _socket.on('message', handleNewMessage);

        _socket.on("callUser", (data) => {
            setReceivingCallDetails({
                receivingCall: true,
                caller: data.from,
                callerSignal: data.signal,
                name: data.name,
            });
        });

        const userId = StorageService.getItem('user')?.id;
        _socket?.emit('event:register', { userId: userId });

        setSocket(_socket);
        return () => {
            console.log("Socket Disconnected", _socket.id);
            _socket.off('message', handleNewMessage);
            _socket.disconnect();
            setSocket(undefined);
        };
    }, []);

    return (
        <SocketContext.Provider value={{
            sendMessage, messages, startMatch,
            endMatch, offlineUsers, callUserSocket, receivingCallDetails, answerCallSocket,
            handleCallAccepted, question
        }}>
            {children}
        </SocketContext.Provider>
    )
}