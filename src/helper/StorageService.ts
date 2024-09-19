import * as _ from "lodash";
import { isValidJSON } from "./baseController";

class StorageService {
    getItem(key: string) {
        let value = localStorage.getItem(key);
        if (value && isValidJSON(value)) {
            return JSON.parse(value);
        }
        return value;
    }

    setItem(key: string, value: any) {
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        localStorage.setItem(key, value);
    }

    setToken(value: any) {
        return localStorage.setItem('token', JSON.stringify(value));
    }

    getToken() {
        const data: any = localStorage.getItem('token');
        return _.isEmpty(data) || (!isValidJSON(data)) ? null :
            ('JWT ' + JSON.parse(data));
    }

    removeItem(key: string) {
        localStorage.removeItem(key);
    }

    clear() {
        localStorage.clear();
    }
}

export default new StorageService();