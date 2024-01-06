import React, { useEffect, useRef } from 'react';
import supabaseClient from '../helper/SupabaseClient';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lordicon/react';
import StorageService from '../helper/StorageService';
const home = require('../assets/home.json');
const logo = require('../assets/bechain_logo.png')

const NavigationMenu = () => {
  const navigate = useNavigate();
  const playerRef = useRef<Player>(null);

  useEffect(() => { 
    playerRef.current?.playFromBeginning();
    document.querySelectorAll('.menu-item-container')[0].classList += ' menu-item-clicked';
  },[])

  const navigateToItem = (e: any) => { 
    if(e.target.className !== 'menu-item-container') return;
    document.querySelectorAll('.menu-item-clicked').forEach((item) => { 
      item.classList.remove('menu-item-clicked');
    })
    e.target.classList += ' menu-item-clicked';
    navigate(`/${e.target.id}`);
  }

  const logOutUser = () => {
    supabaseClient.client.auth.signOut().then(() => {
      StorageService.clear();
      navigate('/login');
    });
  }

  // const toggleAnimationEvent = (e: any) => {
  //   if(e.target.className !== 'menu-item-container') return;
  //   const imgPathObj: { [key: string]: { [key: string]: string } } = {
  //     'home': {
  //       'mouseover': require('../assets/anim-home.gif'),
  //       'mouseout': require('../assets/off-home.png')
  //     },
  //     'match-room': {
  //       'mouseover': require('../assets/anim-home.gif'),
  //       'mouseout': require('../assets/off-home.png')
  //     },
  //     'chats': {
  //       'mouseover': require('../assets/anim-home.gif'),
  //       'mouseout': require('../assets/off-home.png')
  //     },
  //     'settings': {
  //       'mouseover': require('../assets/anim-home.gif'),
  //       'mouseout': require('../assets/off-home.png')
  //     },
  //     'log-out': {
  //       'mouseover': require('../assets/anim-home.gif'),
  //       'mouseout': require('../assets/off-home.png')
  //     },
  //   }

  //   e.target.childNodes[0].src = imgPathObj[e.target.childNodes[0].alt][e.type];
  // }

  return (
    <div className="w-[300px] h-screen bg-bcorange-light border-r-4 border-dotted border-bcorange">
      <img className='w-full h-24 object-cover' src={logo} alt="" />
      <div id='profile' className='menu-item-container' onClick={navigateToItem}>
        <img className='menu-item-img' src={require('../assets/home.png')} alt="home" />
        <p className='menu-item-text'>Profile</p>
      </div>
      <div id='match-room' className='menu-item-container' onClick={navigateToItem}>
        <img className='menu-item-img' src={require('../assets/match.png')} alt="match-room" />
        <p className='menu-item-text'>Match Room</p>
      </div>
      <div id='chats' className='menu-item-container' onClick={navigateToItem}>
        <img className='menu-item-img' src={require('../assets/chat.png')} alt="chats" />
        <p className='menu-item-text'>Chats</p>
      </div>
      <div id='settings' className='menu-item-container' onClick={navigateToItem}>
        <img className='menu-item-img' src={require('../assets/settings.png')} alt="settings" />
        <p className='menu-item-text'>Settings</p>
      </div>
      <div id='logout' className='menu-item-container' onClick={logOutUser}>
        <img className='menu-item-img' src={require('../assets/off-home.png')} alt="log-out" />
        <p className='menu-item-text'>Log Out</p>
      </div>
    </div>
  );
};

export default NavigationMenu;