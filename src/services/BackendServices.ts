import * as config from '../../config.json';
import axios from 'axios';
import storageService from "../helper/StorageService";
import { handleFailure } from '../helper/baseController';
class BackendServices {
  authToken: string | null;

  constructor() {
    this.authToken = storageService.getToken() || '';
  }

  public registerUser = async (data: any) => {
    const headers = {
      'Authorization': this.authToken,
      'api-build-version': '1.0.0',
      'Content-Type': 'application/json'
    };

    return axios.post(`${config.masterUrl}/auth/v1/register`, data, { headers })
      .then((response) => { return response.data })
      .catch((error) => { handleFailure(error) });
  }

  public saveUserDetails = async (data: any) => {
    // this.authToken = storageService.getToken() || '';
    const headers = {
      'Authorization': this.authToken,
      'api-build-version': '1.0.0',
      'Content-Type': 'application/json'
    };

    return axios.post(`${config.masterUrl}/user/v1/save-user-details`, data, { headers })
      .then((response) => { return response.data })
      .catch((error) => { handleFailure(error) });
  }

  public uploadImage = async (path: string, image: any) => {
    const headers = {
      'Authorization': this.authToken,
      'api-build-version': '1.0.0',
      'Content-Type': 'multipart/form-data',
    };

    const formData = new FormData();
    formData.append("file", image);
    formData.append("path", path);

    return axios.post(`${config.masterUrl}/user/v1/uploadImage`, formData, { headers })
      .then((response) => { return response.data })
      .catch((error) => { throw error.response.data });
  }

  public signIn = async (data: any) => {
    const headers = {
      'api-build-version': '1.0.0',
      'Content-Type': 'application/json'
    };
    return axios.post(`${config.masterUrl}/auth/v1/login`, data, { headers })
      .then((response) => { return response.data })
      .catch((error) => { handleFailure(error) });
  }

  public updateProfileDetails = async (data: any) => {
    const headers = {
      'Authorization': this.authToken,
      'api-build-version': '1.0.0',
      'Content-Type': 'application/json'
    };
    return axios.post(`${config.masterUrl}/user/v1/update-profile-details`, data, { headers })
      .then((response) => {
        return response.data
      })
      .catch((error) => { handleFailure(error?.response ? error.response : error) });
  }
}

export default new BackendServices();