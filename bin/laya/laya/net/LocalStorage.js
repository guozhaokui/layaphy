export class LocalStorage {
    static __init__() {
        if (!LocalStorage._baseClass) {
            LocalStorage._baseClass = Storage;
            Storage.init();
        }
        LocalStorage.items = LocalStorage._baseClass.items;
        LocalStorage.support = LocalStorage._baseClass.support;
        return LocalStorage.support;
    }
    static setItem(key, value) {
        LocalStorage._baseClass.setItem(key, value);
    }
    static getItem(key) {
        return LocalStorage._baseClass.getItem(key);
    }
    static setJSON(key, value) {
        LocalStorage._baseClass.setJSON(key, value);
    }
    static getJSON(key) {
        return LocalStorage._baseClass.getJSON(key);
    }
    static removeItem(key) {
        LocalStorage._baseClass.removeItem(key);
    }
    static clear() {
        LocalStorage._baseClass.clear();
    }
}
LocalStorage.support = false;
class Storage {
    static init() {
        try {
            Storage.support = true;
            Storage.items = window.localStorage;
            Storage.setItem('laya', '1');
            Storage.removeItem('laya');
        }
        catch (e) {
            Storage.support = false;
        }
        if (!Storage.support)
            console.log('LocalStorage is not supprot or browser is private mode.');
    }
    static setItem(key, value) {
        try {
            Storage.support && Storage.items.setItem(key, value);
        }
        catch (e) {
            console.warn("set localStorage failed", e);
        }
    }
    static getItem(key) {
        return Storage.support ? Storage.items.getItem(key) : null;
    }
    static setJSON(key, value) {
        try {
            Storage.support && Storage.items.setItem(key, JSON.stringify(value));
        }
        catch (e) {
            console.warn("set localStorage failed", e);
        }
    }
    static getJSON(key) {
        return JSON.parse(Storage.support ? Storage.items.getItem(key) : null);
    }
    static removeItem(key) {
        Storage.support && Storage.items.removeItem(key);
    }
    static clear() {
        Storage.support && Storage.items.clear();
    }
}
Storage.support = false;
