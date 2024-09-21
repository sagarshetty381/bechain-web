import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import StorageService from '../helper/StorageService';
import BackendServices from '../services/BackendServices';
import { AES, enc } from 'crypto-js';
import LoaderScreen from "../layouts/LoaderScreen";
import { useToastService } from '../hooks/useToastService';

const LoginPage = () => {
    const params = useParams();
    const [loading, setLoading] = React.useState(false);
    const { toastError, toastSuccess } = useToastService();

    useEffect(() => {
        if (params.deeplink) {
            signInThroughDeepLink(params.deeplink);
        }
    }, []);

    const [formData, setFormData] = React.useState({ username: '', password: '' });
    const navigation = useNavigate();

    const signInWithEmail = async () => {
        setLoading(true);
        BackendServices.signIn({ email: formData.username, password: formData.password })
            .then((res) => {
                if (res?.success) {
                    toastSuccess("Success", "Logged in successfully");
                    StorageService.setToken(res.payload.authToken);
                    StorageService.setItem('refresh_token', res.payload.refreshToken);
                    StorageService.setItem('user', res.payload.user);
                    navigation('/profile');
                }
                setLoading(false);
            }).catch((err) => {
                toastError("Error", err.message);
                setLoading(false);
            })
    }

    const signInThroughDeepLink = async (cipherText: string) => {
        setLoading(true);
        const encryptedData = AES.decrypt(decodeURIComponent(cipherText), 'SagarEncryptionKey');
        const userCredentials = JSON.parse(encryptedData.toString(enc.Utf8));
        BackendServices.signIn({ email: userCredentials.username, password: userCredentials.password })
            .then((res) => {
                if (res?.success) {
                    toastSuccess("Success", "Logged in successfully");
                    StorageService.setToken(res.payload.authToken);
                    StorageService.setItem('refresh_token', res.payload.refreshToken);
                    StorageService.setItem('user', res.payload.user);
                    navigation('/profile');
                    setLoading(false);
                }
            }).catch((err) => {
                toastError("Error", err.message);
                setLoading(false);
            })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    return (
        <div className='flex w-full h-screen'>
            <div className='relative flex flex-col items-center justify-center w-3/12 border-r-4 px-7 bg-bcorange-light border-bcorange'>
                <img className='absolute w-full object-cover top-4 h-[100px]' src={require('../assets/bechain_logo.png')} alt="" />
                <div className='flex flex-col items-center self-center w-full text-base mx-7'>
                    <input className='w-full px-3 py-2 mb-4 rounded-md outline-bcorange outline-2' type="text" name='username' placeholder='Username' onChange={handleChange} />
                    <input className='w-full px-3 py-2 mb-4 rounded-md outline-bcorange outline-2' type="password" name='password' placeholder='Password' onChange={handleChange} />
                    <button className='w-full px-3 py-2 text-white rounded-md bg-bcblue hover:underline' onClick={signInWithEmail} >Sign In</button>
                    <p className='my-4 font-bold text-bcblue'>— <span className='text-bcorange'>OR</span> —</p>
                    <button className='w-full px-3 py-2 text-white rounded-md bg-bcblue hover:underline' onClick={signInWithEmail} >Sign in with Google</button>
                    <p className='mt-6 font-bold text-bcorange'>Don't have an account? <Link className='underline text-bcblue' to="/signUp">Sign up</Link>.</p>
                </div>
            </div>
            <div className='relative flex items-center justify-center w-3/4 text-xl font-bold text-white'>
                <img className='absolute object-cover w-full h-screen' src={require('../assets/bechain_background.webp')} alt="" />
                <div className='absolute w-full h-full bg-black opacity-25' ></div>
                <p className='relative '>Experience love with the fastest growing community of Love Seekers, because you deserve to be loved.💖</p>
                <p className='absolute bottom-3'>Baked with 💖 in India</p>
            </div>
            {loading && <LoaderScreen />}
        </div >
    );
}

export default LoginPage;