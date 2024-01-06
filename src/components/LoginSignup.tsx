import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StorageService from '../helper/StorageService';
import apiService from '../helper/apiService';

const LoginSignup = () => {
    const [formData, setFormData] = React.useState({ username: '', password: '' });
    const navigate = useNavigate();

    const signInWithEmail = async () => {
        apiService.signIn({ email: formData.username, password: formData.password })
            .then((res) => {
                if (res?.success) {
                    StorageService.setToken(res.payload.authToken);
                    StorageService.setItem('refresh_token', res.payload.refreshToken);
                    StorageService.setItem('user', res.payload.user);
                    navigate('/profile');
                }
            })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    return (
        <div className='login-container'>
            <div className='login-section'>
                <img src={require('../assets/bechain_logo.png')} alt="" />
                <div className='input-section'>
                    <input type="text" name='username' placeholder='Username' onChange={handleChange}/>
                    <input type="password" name='password' placeholder='Password' onChange={handleChange} />
                    <input type="button" value='Sign in' onClick={signInWithEmail}/>
                    <p>— OR —</p>
                    <input type="button" value='Sign in with Google' />

                    <p>Don't have an account? <Link to="/signUp">Sign up</Link></p>
                </div>
            </div>
            <div className='template-section'>
                <img src={require('../assets/bechain_background.jpg')} alt="" />
                <p>Experience love with the fastest growing community of Love Seekers, because you deserve to be loved.💖</p>
                <p style={{ top: 'auto', left: 'auto', bottom: '20px', width: '100%', textAlign: 'center' }}>Baked with 💖 in India</p>
            </div>
        </div >);
}

export default LoginSignup;