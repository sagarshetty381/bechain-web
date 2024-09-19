import React, { useEffect, useRef, useState } from 'react';
import supabaseClient from '../helper/SupabaseClient';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lordicon/react';
import StorageService from '../helper/StorageService';
const logo = require('../assets/bechain_logo.png');

const NavigationMenu = () => {
  const navigate = useNavigate();
  const playerRef = useRef<Player>(null);
  const [userName, setUserName] = useState<any>('');

  useEffect(() => {
    playerRef.current?.playFromBeginning();
    const currNav = StorageService.getItem('currNav') || 0;
    document.querySelectorAll('.menu-item-container')[currNav].classList += ' menu-item-clicked';

    setUserName(StorageService.getItem('user')?.fname[0] || 'N/A');
  }, [])

  const navigateToItem = (index: number) => {
    let menuItems = document.querySelectorAll('.menu-item-container');

    menuItems.forEach((item) => {
      item.classList.remove('menu-item-clicked');
    });
    menuItems[index].classList.add('menu-item-clicked');
    // menuItems[index].firstChild.classList.add('menu-item-clicked');
    navigate(`/${menuItems[index].id}`);
    StorageService.setItem('currNav', index);
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
    <div className='flex-col items-center justify-between hidden h-screen text-center bg-white border-r-4 shadow-inner lg:flex lg:visible border-bcorange rounded-xl'>
      <div>
        {/* <img className='object-cover w-full h-24' src={logo} alt="" /> */}
        <div id='profile' className='menu-item-container' onClick={() => navigateToItem(0)}>
          <img className='menu-item-img' src={require('../assets/home.png')} alt="home" />
          <p className='menu-item-text'>Profile</p>
        </div>
        <div id='match-room' className='menu-item-container' onClick={() => navigateToItem(1)}>
          <img className='menu-item-img' src={require('../assets/match.png')} alt="match-room" />
          <p className='menu-item-text'>Match Room</p>
        </div>
        <div id='chats' className='menu-item-container' onClick={() => navigateToItem(2)}>
          <img className='menu-item-img' src={require('../assets/chat.png')} alt="chats" />
          <p className='menu-item-text'>Chats</p>
        </div>
        <div id='settings' className='menu-item-container' onClick={() => navigateToItem(3)}>
          <img className='menu-item-img' src={require('../assets/settings.png')} alt="settings" />
          <p className='menu-item-text'>Settings</p>
        </div>
        <div id='logout' className='menu-item-container' onClick={logOutUser}>
          <img className='menu-item-img' src='https://img.icons8.com/ios-filled/50/logout-rounded.png' alt="log-out" />
          <p className='menu-item-text'>Log Out</p>
        </div>
      </div>
      <div className='content-center m-8 text-center text-white rounded-full w-9 h-9 bg-bcorange'>
        <p>{userName}</p>
      </div>
    </div>
  );
};

export default NavigationMenu;