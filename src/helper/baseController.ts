import { IHttpErrResponse } from "../enums/interfaces";

export function isValidJSON(value: string) {
    try {
        JSON.parse(value);
        return true;
    } catch (e) {
        return false;
    }
}

export function handleFailure(err: IHttpErrResponse) {
    switch (err.status) {
        case 401:
            window.location.assign('/login');
            break;
        default:
    }
    throw err;
}

export const dataURLtoFile = (dataURL: any, filename: string) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export const calculateAge = (date: string) => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age.toString();
}