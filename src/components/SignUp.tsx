import React, { useRef, useState } from "react";
import { debounce } from 'lodash';
import { useToastService } from "../hooks/useToastService";
import LoaderScreen from "../layouts/LoaderScreen";
import { useNavigate } from "react-router-dom";
import storageService from "../helper/StorageService";
import apiService from '../helper/apiService';

const SignUp = () => {
  const userObj: any = {};

  const { toastError, toastSuccess } = useToastService();

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [userId, setUserId] = useState('');
  const [genderPreference, setGenderPreference] = useState('');
  const [step, setStep] = useState(1);

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

  async function signUpWithEmail() {
    if (!validateFields()) { return; }

    setLoading(true);
    const data = {
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    }

    apiService.registerUser(data).then((res: any) => {
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
        setStep(step + 1);
        toastSuccess('Success', 'User created successfully');
      } else {
        toastError('Error', 'Error while creating user');
      }
      setLoading(false);
    });
  }

  async function saveUserDetails() {
    const userDetails = {
      id: userId,
      fname: userData.fname,
      birthdate: userData.birthDate,
      location: userData.location,
      profession: userData.profession,
      preference: genderPreference,
    }

    setLoading(true);
    apiService.saveUserDetails(userDetails).then((res: any) => {
      if (res?.success) {
        toastSuccess('Success', 'User details saved successfully.');
        storageService.setItem('user', { ...userDetails, email: userObj.email });
        setStep(step + 1);
      } else {
        toastError('Error', 'Error while saving details.');
      }
      setLoading(false);
    });
  }

  const handleChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }, 500);

  const handleUserDetailsChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  }, 500);

  const toggleGenderSelection = (e: React.MouseEvent<HTMLImageElement>) => {
    setGenderPreference(e.currentTarget.alt);
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

  const uploadProfileImage = async () => {
    setLoading(true);
    if (!image) {
      toastError('Error', 'Please select an image');
      return;
    }

    apiService.uploadImage(`profiles/${userId}`, image).then((res: any) => {
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
    <div className="flex justify-center items-center content-center h-screen w-full">
      {loading && <LoaderScreen />}
      <img className="w-full h-full absolute blur-[ ]" src={require('../assets/bechain_background.jpg')} alt="" />
      <div className=" bg-white drop-shadow-md w-[650px] p-11 rounded-md">
        {step === 1 &&
          <>
            <p className="text-3xl font-bold mb-10 text-center text-bcorange">Welcome to Béchain</p>
            <div className="grid grid-cols-2 gap-x-3">
              <input className="form-input mb-4" type="text" placeholder="Email" name="email"
                onChange={handleChange} />
              <div className="form-container ml-0">
                <img className="form-input-icon" src={require('../assets/phone.png')} alt="" />
                <input className="form-input border-transparent" type="number" placeholder="Phone Number" name="phone"
                  onChange={handleChange} />
              </div>
              <input className="form-input mb-4" type="password" placeholder="Password" name="password"
                onChange={handleChange} />
              <input className="form-input mb-4" type="password" placeholder="Confirm password" name="confirmPassword"
                onChange={handleChange} />
              <input
                className="text-xs w-fit px-4 rounded-md bg-bcblue text-white p-2"
                type="button" value="Sign Up"
                onClick={signUpWithEmail} />
            </div>
          </>
        }
        {step === 2 &&
          <>
            <p className="text-3xl text-center mb-10 text-bcorange font-bold">Let's Get You On-Board!</p>
            <div className="grid grid-cols-2">
              <div className="flex ml-2 h-10 ">
                <input className="form-input mr-1 w-12 text-center hover:cursor-pointer text-bcblue" type="text" readOnly value="Mr." name="gender"
                  onClick={(e) => { (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value === 'Mr.' ? 'Mrs.' : 'Mr.' }} onChange={handleUserDetailsChange} />
                <input className="form-input grow" type="text" placeholder="First Name" name="fname"
                  onChange={handleUserDetailsChange} />
              </div>
              <div className="form-container">
                <img className="form-input-icon" src={require('../assets/birthday.png')} alt="" />
                <input className="form-input border-0 border-transparent grow" type="date" placeholder="DOB" name="birthDate"
                  onChange={handleUserDetailsChange} value="" />
              </div>
              <div className="form-container">
                <img className="form-input-icon" src={require('../assets/location.png')} alt="" />
                <input className="form-input border-transparent grow" type="text" placeholder="Place of Residence" name="location"
                  onChange={handleUserDetailsChange} />
              </div>
              <div className="form-container">
                <input className="form-input border-transparent mr-2 w-full" type="text" placeholder="Profession" name="profession"
                  onChange={handleUserDetailsChange} />
              </div>
            </div>
            <div className="flex m-2 px-2 items-center">
              <p className="mr-5 text-sm font-bold">Preference</p>
              {genderPreference === 'male' ? <img className="m-2 w-6" src={require('../assets/male-selected.png')} alt="" /> :
                <img className="m-2 w-6 border-2 border-bcorange" src={require('../assets/male.png')} alt="male" onClick={toggleGenderSelection} />}
              {genderPreference === 'female' ? <img className="m-2 w-6" src={require('../assets/female-selected.png')} alt="" /> :
                <img className="m-2 w-6 border-2 border-bcorange" src={require('../assets/female.png')} alt="female" onClick={toggleGenderSelection} />}
            </div>
            <input
              className="text-sm m-2 w-fit px-4 rounded-md bg-bcblue text-white p-2"
              type="button" value="Proceed"
              onClick={saveUserDetails} />
          </>
        }
        {step === 3 &&
          <>
            <div className="w-fit mx-auto mb-4 flex flex-col hover:cursor-pointer" onClick={handleImageClick} >
              {image ? (
                <img className=" bg-slate-200 p-4 py-6 rounded-md h-72 w-48 object-cover bg-transparent"
                  src={URL.createObjectURL(image)} alt="upload image" />
              ) : (
                <img className=" bg-slate-200 p-4 py-6 h-72 w-48 object-cover rounded-md"
                  src={require('../assets/user-male.png')} alt="" />
              )}
              <input
                className="hidden" onChange={handleImageChange}
                type="file" ref={inputRef} />
            </div>
            <div className="w-full grid">
              <input
                className="text-xs m-auto px-4 rounded-md bg-bcblue text-white p-2 hover:cursor-pointer"
                type="button" value="Upload Image"
                onClick={uploadProfileImage} />
            </div>
          </>
        }
      </div>
    </div>
  );
};

export default SignUp;
