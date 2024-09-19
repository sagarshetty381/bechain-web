import React, { useRef, useState } from "react";
import { debounce } from 'lodash';
import { useToastService } from "../hooks/useToastService";
import LoaderScreen from "../layouts/LoaderScreen";
import { useNavigate } from "react-router-dom";
import storageService from "../helper/StorageService";
import BackendServices from '../services/BackendServices';

const SignUpPage = () => {
  const userObj: any = {};

  const { toastError, toastSuccess } = useToastService();

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [userId, setUserId] = useState('');
  const [genderPreference, setGenderPreference] = useState('');
  const [gender, setGender] = useState('');

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [userData, setUserData] = useState({
    fname: "",
    birthDate: "",
    location: "",
    profession: "",
  });

  function navigateToRegistrationPages(currIndex: number, direction: string) {
    const sectionElements = document.querySelectorAll('section');
    if (currIndex === 0 && direction === 'prev') { return; }
    if (currIndex === 2 && direction === 'next') { return; }

    if (direction === 'next') {
      sectionElements[currIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (direction === 'prev') {
      sectionElements[currIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function validateFields() {
    for (let key in formData) {
      if (!formData[key as keyof typeof formData]) {
        toastError('Error', `${key} is required`);
        return false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      toastError('Error', 'Password and confirm password do not match')
      return false;
    }

    return true;
  }

  async function submitStage1Details() {
    if (!validateFields()) { return; }

    setLoading(true);
    const data = {
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    }

    BackendServices.registerUser(data).then((res: any) => {
      if (res?.success) {
        if (res.payload?.session === null) {
          toastSuccess('Success', 'Confirm the email sent to your email address');
          return;
        }
        setUserId(res.payload?.user?.id || null);
        storageService.setToken(res.payload?.session?.access_token || null);
        storageService.setItem('refresh_token', res.payload?.session?.refresh_token || null);
        userObj['id'] = res.payload?.user?.id;
        userObj['email'] = res.payload?.user?.email;
        toastSuccess('Success', 'User created successfully');
        navigateToRegistrationPages(0, 'next');
        setLoading(false);
      } else {
        toastError('Error', 'Error while creating user');
        setLoading(false);
      }
    });
  }

  async function submitStage2Details() {
    setLoading(true);

    const userDetails = {
      id: userId,
      fname: userData.fname,
      birthdate: userData.birthDate,
      location: userData.location,
      profession: userData.profession,
      gender: gender,
      preference: genderPreference,
    }

    BackendServices.saveUserDetails(userDetails).then((res: any) => {
      if (res?.success) {
        toastSuccess('Success', 'User details saved successfully.');
        storageService.setItem('user', { ...userDetails, email: userObj.email });
        navigateToRegistrationPages(1, 'next');
        setLoading(false);
      } else {
        toastError('Error', 'Error while saving details.');
        setLoading(false);
      }
    });
  }

  const handleChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }, 500);

  const handleUserDetailsChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  }, 500);

  const toggleGenderPrefSelection = (e: React.MouseEvent<HTMLImageElement>) => {
    setGenderPreference(e.currentTarget.alt);
  };

  const toggleGenderSelection = (e: React.MouseEvent<HTMLImageElement>) => {
    setGender(e.currentTarget.alt);
  };

  const handleImageClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file: any = event.target.files?.[0];
    setImage(file);
  }

  const submitStage3Details = async () => {
    setLoading(true);
    if (!image) {
      toastError('Error', 'Please select an image');
      return;
    }

    BackendServices.uploadImage(`profiles/${userId}`, image).then((res: any) => {
      if (res?.success) {
        toastSuccess('Success', 'Profile created successfully');
        setLoading(false);
        navigate('/');
      } else {
        toastError('Error', 'Error while uploading image');
        setLoading(false);
      }
    });
  }

  return (
    <div className="flex items-center content-center justify-center w-full h-screen">
      <img className="absolute w-full h-full" src={require('../assets/bechain_background.jpg')} alt="" />
      <div className="w-[50%]">
        <div className=" bg-white drop-shadow-md w-auto gap-8 overscroll-contain border-4 border-bcorange snap-mandatory snap-x rounded-md grid grid-flow-col auto-cols-[100%] overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}>
          <section className="p-8 snap-start">
            <p className="mb-10 text-3xl font-bold text-center text-bcorange">Let's Get You <span className="text-bcblue"> On-Board!</span></p>
            <div className="relative grid grid-cols-2 gap-x-3">
              <input className="pl-2 mb-4 form-input" type="text" placeholder="Email" name="email"
                onChange={handleChange} />
              <div className="ml-0 form-container">
                <img className="w-6 h-6 pr-1 mr-2 border-r-2 border-gray-300 border-solid" src={require('../assets/phone.png')} alt="" />
                <input className="border-transparent" type="number" placeholder="Phone Number" name="phone"
                  onChange={handleChange} />
              </div>
              <input className="py-2 mb-4 form-input" type="password" placeholder="Password" name="password"
                onChange={handleChange} />
              <input className="mb-4 ml-0 form-input" type="password" placeholder="Confirm password" name="confirmPassword"
                onChange={handleChange} />
            </div>
            <button
              className="absolute p-2 px-4 mx-auto text-white rounded-md text-md w-fit bg-bcblue bottom-5"
              onClick={submitStage1Details} >Set-up the account!</button>
          </section>
          <section className="relative p-8 snap-start">
            <p className="mb-10 text-3xl font-bold text-center text-bcorange">Welcome to Bé<span className="text-bcblue">chain</span></p>
            <div className="relative grid grid-cols-2 gap-x-3">
              <div className="flex h-10 form-container">
                <input className="w-12 pl-0 text-center border-0 form-input hover:cursor-pointer text-bcblue" type="text" readOnly value="Mr." name="gender"
                  onClick={(e) => { (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value === 'Mr.' ? 'Mrs.' : 'Mr.' }} onChange={handleUserDetailsChange} />
                <input className="w-full border-0 form-input" type="text" placeholder="First Name" name="fname"
                  onChange={handleUserDetailsChange} />
              </div>
              <div className="flex form-container">
                <img className="w-6 h-6" src={require('../assets/birthday.png')} alt="" />
                <input className="border-0 border-transparent form-input grow" type="date" name="birthDate"
                  onChange={handleUserDetailsChange} />
              </div>
              <div className="flex ml-0 form-container">
                <img className="w-6 h-6" src={require('../assets/location.png')} alt="" />
                <input className="border-transparent grow form-input" type="text" placeholder="Place of Residence" name="location"
                  onChange={handleUserDetailsChange} />
              </div>
              <div className="ml-0 form-container">
                <input className="w-full mr-2 border-transparent form-input" type="text" placeholder="Profession" name="profession"
                  onChange={handleUserDetailsChange} />
              </div>
              <div className="flex items-center m-2 cursor-pointer">
                <p className="mr-5 text-base font-bold">Gender</p>
                {gender === 'male' ? <img className="w-6 m-2" src={require('../assets/male-selected.png')} alt="" /> :
                  <img className="w-6 m-2 border-2 border-bcorange" src={require('../assets/male.png')} alt="male" onClick={toggleGenderSelection} />}
                {gender === 'female' ? <img className="w-6 m-2" src={require('../assets/female-selected.png')} alt="" /> :
                  <img className="w-6 m-2 border-2 border-bcorange" src={require('../assets/female.png')} alt="female" onClick={toggleGenderSelection} />}
              </div>
              <div className="flex items-center m-2 cursor-pointer">
                <p className="mr-5 text-base font-bold">Preference</p>
                {genderPreference === 'male' ? <img className="w-6 m-2" src={require('../assets/male-selected.png')} alt="" /> :
                  <img className="w-6 m-2 border-2 border-bcorange" src={require('../assets/male.png')} alt="male" onClick={toggleGenderPrefSelection} />}
                {genderPreference === 'female' ? <img className="w-6 m-2" src={require('../assets/female-selected.png')} alt="" /> :
                  <img className="w-6 m-2 border-2 border-bcorange" src={require('../assets/female.png')} alt="female" onClick={toggleGenderPrefSelection} />}
              </div>
            </div>

            <button className="absolute p-2 px-4 text-base text-white rounded-md left-5 bottom-5 w-fit bg-bcblue"
              onClick={() => { navigateToRegistrationPages(1, 'prev'); }} >Previous</button>
            <button className="absolute p-2 px-4 text-base text-white rounded-md right-5 bottom-5 w-fit bg-bcblue"
              onClick={submitStage2Details} >Proceed</button>
          </section>
          <section className="p-8 snap-start">
            <p className="mb-10 text-3xl font-bold text-center text-bcorange">Let's upload a profile photo</p>
            <div className="flex flex-col mx-auto mb-4 w-fit hover:cursor-pointer" onClick={handleImageClick} >
              {image ? (
                <img className="object-cover p-4 py-6 bg-transparent rounded-md w-36 bg-slate-200 h-72"
                  src={URL.createObjectURL(image)} alt="upload image" />
              ) : (
                <img className="object-cover w-48 p-4 py-6 rounded-md bg-slate-200 h-72"
                  src={require('../assets/user-male.png')} alt="" />
              )}
              <input
                className="hidden" onChange={handleImageChange}
                type="file" ref={inputRef} />
            </div>
            <div className="flex items-center justify-between w-full gap-2">
              <button className="p-2 px-3 text-base text-white rounded-md w-fit bg-bcblue"
                onClick={() => { navigateToRegistrationPages(2, 'prev'); }} >Previous</button>
              <button
                className="px-3 py-2 text-base text-white rounded-md bg-bcblue hover:cursor-pointer"
                onClick={submitStage3Details} >Upload Image</button>
            </div>
          </section>
        </div>
      </div>
      {loading && <LoaderScreen />}
    </div>

  );
};

export default SignUpPage;
