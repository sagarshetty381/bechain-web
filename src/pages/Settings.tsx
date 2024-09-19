import React, { useEffect, useState } from 'react';
import StorageService from '../helper/StorageService';
import BackendServices from '../services/BackendServices';
import { useToastService } from '../hooks/useToastService';
import '../../index.css'
import { RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb } from '@chakra-ui/react';

export const Settings = () => {
    const { toastError, toastSuccess } = useToastService();
    const [formData, setFormData] = useState({
        fname: '',
        gender: '',
        preference: '',
        profession: '',
        birthdate: '',
        location: '',
        bio: ''
    });
    const [settingsText, setSettingsText] = useState('profile');
    const [editProfile, setEditProfile] = useState(false);
    const [genderPref, setGenderPref] = useState('both');
    const [minMaxAge, setMinMaxAge] = useState([21, 24]);

    const handleChange = async (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const onSubmit = (event) => {
        const user = StorageService.getItem('user');
        const payload = {
            id: user.id,
            ...formData
        }
        BackendServices.updateProfileDetails(payload).then((res) => {
            StorageService.setItem('user', res.payload);
            setFormData({
                fname: res.payload.fname,
                gender: res.payload.gender,
                profession: res.payload.profession,
                location: res.payload.location,
                preference: user.preference,
                birthdate: res.payload.birthdate,
                bio: res.payload.bio
            })
            toastSuccess('Success', 'Profile updated successfully');
            setEditProfile(!editProfile);
        }).catch((err) => {
            console.log(err);
            setEditProfile(!editProfile);
            toastError('Error', 'Error while updating profile');
        })
    }

    const setPreference = (event) => {
        const prefElement = document.querySelectorAll('.pref-gender');

        prefElement.forEach((element) => {
            element.classList.remove('active');
        });
        event.target.classList.add('active');
        setGenderPref(event.target?.innerText?.toLowerCase());
    }

    const changeNavigation = (event) => {
        const navOptions = document.querySelectorAll('.settings');
        navOptions.forEach((navOption) => {
            navOption.classList.remove('active');
        });
        event.target.classList.add('active');
        const { innerText } = event.target;
        setSettingsText(innerText);
        if (innerText.toLowerCase() === 'preferences') {
            const user = StorageService.getItem('user');
            const prefElement = document.querySelectorAll('.pref-gender');
            prefElement.forEach((element) => {
                if (element.innerText.toLowerCase() === user.preference) {
                    element.classList.add('active');
                }
            });
            setGenderPref(user.preference);
        }
    }

    useEffect(() => {
        const user = StorageService.getItem('user');

        if (user !== null) {
            setFormData({
                fname: user.fname,
                gender: user.gender,
                profession: user.profession,
                birthdate: user.birthdate,
                location: user.location,
                preference: user.preference,
                bio: user.bio
            })
        }
    }, []);

    return (
        <div className='flex w-full m-8 rounded-md shadow-xl bg-bcorange-light'>
            <section className='w-[30%] rounded-md bg-gradient-to-b relative from-bcorange-dark from-5% to-bcorange to-95% flex flex-col justify-center items-center'>
                <ul className='text-sm uppercase text-bcblue *:hover:cursor-pointer *:mb-2 text-center -tracking-[-0.2em]'>
                    <li className='settings active hover:underline ' onClick={changeNavigation}>Profile</li>
                    <li className='settings hover:underline ' onClick={changeNavigation}>Preferences</li>
                </ul>
                <div className='absolute flex items-center cursor-pointer bottom-10'>
                    <img className='menu-item-img' src={require('../assets/settings.png')} alt="settings" />
                    <p className=' text-sm font-bold uppercase  -tracking-[-0.2em]'> App Settings</p>
                </div>
            </section>
            {settingsText.toLowerCase() === 'profile' && <section className='w-[70%] flex flex-col rounded-r-md justify-center pl-7 bg-bcorange-light'>
                {editProfile ?
                    <div className='p-4'>
                        <h1 className='text-3xl mb-7'>Edit Profile</h1>
                        <div className='text-lg *:mb-4 flex items-center'>
                            <p className='mb-2 w-[20%]'>Name</p>
                            <input type="text" placeholder='Enter Name' onChange={handleChange} value={formData.fname} name='fname'
                                className='p-3 mb-3  w-[70%] text-sm bg-bcorange-dark rounded-md border-bcblue' />
                        </div>
                        <div className='text-lg *:mb-4 flex items-center'>
                            <p className='mb-2 w-[20%]'>About</p>
                            <input type="text" placeholder='Enter Name' onChange={handleChange} value={formData.bio} name='bio' multiple
                                className='p-3 mb-3  w-[70%] text-sm bg-bcorange-dark rounded-md border-bcblue' />
                        </div>
                        <div className='text-lg *:mb-4 flex items-center'>
                            <p className='mb-2 w-[20%]'>Gender</p>
                            <select className='p-3 mb-3  w-[70%] text-sm bg-bcorange-dark rounded-md border-bcblue' value={formData.gender} name='gender' onChange={handleChange}>
                                <option className='p-3 text-sm bg-transparent' key="Male" value="male">Male</option>
                                <option className='p-3 text-sm bg-transparent' key="Female" value="female">Female</option>
                            </select>
                        </div>
                        <div className='text-lg *:mb-4 flex items-center'>
                            <p className='mb-2 w-[20%]'>Location</p>
                            <input type="text" placeholder='Enter Location' onChange={handleChange} value={formData.location} name='location'
                                className='p-3 mb-3  w-[70%] text-sm bg-bcorange-dark rounded-md border-bcblue' />
                        </div>
                        <div className='text-lg *:mb-4 flex items-center'>
                            <p className='mb-2 w-[20%]'>Profession</p>
                            <input type="text" placeholder='Enter Profession' onChange={handleChange} value={formData.profession} name='profession'
                                className='p-3 mb-3  w-[70%] text-sm bg-bcorange-dark rounded-md border-bcblue' />
                        </div>
                        <div className='text-lg *:mb-4 flex items-center'>
                            <p className='mb-2 w-[20%]'>Birth date</p>
                            <input type="date" placeholder='Enter Birth Date' value={formData.birthdate} onChange={handleChange} name='birthdate'
                                className='p-3 mb-3  w-[70%] text-sm bg-bcorange-dark rounded-md border-bcblue' />
                        </div>
                        <div className='text-lg *:mb-4 flex items-center'>
                            <p className='mb-2 w-[20%]'>Interested in</p>
                            <input type="text" placeholder='Enter your preference' onChange={handleChange} value={formData.preference} name='preference'
                                className='p-3 mb-3  w-[70%] text-sm bg-bcorange-dark rounded-md border-bcblue' />
                        </div>
                        <button className='px-4 py-2  hover:scale-105 mt-4 text-sm bg-white border-2 rounded-md mr-4 -tracking-[-0.2em] border-bcorange hover:underline hover:text-bcorange' onClick={onSubmit}>SAVE</button>
                        <button className='px-4 py-2 hover:scale-105 text-sm bg-white border-2 rounded-md -tracking-[-0.2em] border-bcorange hover:underline hover:text-bcorange' onClick={() => { setEditProfile(!editProfile) }}>CANCEL</button>
                    </div>
                    :
                    <div>
                        <h1 className='text-3xl mb-7'>Profile</h1>
                        <div className='text-xl *:mb-4'>
                            <p>Name: {formData.fname}</p>
                            <p>About: {formData.bio}</p>
                            <p>Gender: {formData.gender}</p>
                            <p>Location: {formData.location}</p>
                            <p>Profession: {formData.profession}</p>
                            <p>Birthdate: {formData.birthdate}</p>
                            <p>Interested in: {formData.preference}</p>
                            <button className='px-4 py-2 text-sm bg-white border-2 rounded-md -tracking-[-0.2em] border-bcorange hover:underline hover:text-bcorange hover:scale-105' onClick={() => { setEditProfile(!editProfile) }}>EDIT PROFILE</button>
                        </div>
                    </div>}
            </section>}

            {settingsText.toLowerCase() === 'preferences' && <section className='w-[70%] flex flex-col rounded-r-md justify-center pl-7 bg-bcorange-light'>
                <h1 className='text-3xl mb-7'>Preferences</h1>
                <div className='text-lg *:mb-6 flex items-center'>
                    <p className=' w-[20%]'>Preferred Gender</p>
                    <div className='flex *:px-4 *:py-1 *:border-2  *:rounded-2xl gap-3 text-bcorange *:cursor-pointer'>
                        <p className='border-bcorange pref-gender' onClick={setPreference}>Male</p>
                        <p className='border-bcorange pref-gender' onClick={setPreference}>Female</p>
                        <p className='border-bcorange pref-gender' onClick={setPreference}>Both</p>
                    </div>
                </div>
                <div className='text-lg *:mb-4 flex items-center'>
                    <p className=' w-[20%]'>Preferred Age</p>
                    <div className='ml-3 w-[70%]'>
                        <RangeSlider
                            aria-label={['min', 'max']}
                            colorScheme='orange'
                            defaultValue={[21, 24]}
                            min={21}
                            max={60}
                            onChange={(value) => setMinMaxAge(value)}>
                            <RangeSliderTrack>
                                <RangeSliderFilledTrack />
                            </RangeSliderTrack>
                            <RangeSliderThumb index={0} boxSize={6} className='text-sm' >{minMaxAge[0]}</RangeSliderThumb>
                            <RangeSliderThumb index={1} boxSize={6} className='text-sm' >{minMaxAge[1]}</RangeSliderThumb>
                        </RangeSlider>
                    </div>
                </div>
                <div className='text-lg *:mb-4 flex items-center'>
                    <p className='mb-2 w-[20%]'>Preferred Location</p>
                    <input type="text" placeholder='Enter Name' onChange={handleChange} value={formData?.prefLocation || '-Any-'} name='fname'
                        className='p-3 mb-3  w-[70%] text-sm bg-bcorange-dark rounded-md border-bcblue' />
                </div>
                <div>
                    <button className='px-4 py-2 mt-4 text-sm bg-white border-2 rounded-md mr-4 -tracking-[-0.2em] border-bcorange'>UPDATE PREFERENCE</button>
                    <button className='px-4 py-2 text-sm bg-white border-2 rounded-md -tracking-[-0.2em] border-bcorange'>RESET</button>
                </div>
            </section>}
        </div>
    );
}