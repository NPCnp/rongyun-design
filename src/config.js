var STORAGE_KEY = 'diy_orders';
var ORDER_NO_KEY = 'last_order_no';
var DRAFT_KEY = 'diy_draft';
var MAX_HISTORY_STEPS = 20;

var tempStorage = {};

function safeSetStorage(key, value) {
    try {
        const testKey = 'test_storage';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        console.warn('localStorage 不可用，使用内存存储');
        tempStorage[key] = value;
        return false;
    }
}

function safeGetStorage(key, defaultValue) {
    try {
        const testKey = 'test_storage';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
    } catch (e) {
        console.warn('localStorage 不可用，使用内存存储');
        return tempStorage[key] !== undefined ? tempStorage[key] : defaultValue;
    }
}

function safeRemoveStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.warn('localStorage 不可用，使用内存存储');
        delete tempStorage[key];
    }
}

var SUPABASE_URL = 'https://mmfovpkrzodkvnokauqy.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_LYvf6FRSMSZRc9lfFIKOnA_XG7InVYt';

var LC_APP_ID = 'YOUR_APP_ID';
var LC_APP_KEY = 'YOUR_APP_KEY';
var LC_SERVER_URL = 'YOUR_SERVER_URL';

var presetPhrases = ['有福之州', '平安喜乐', '长乐未央', '岁岁平安', '家和万事兴', '福到家门'];

var canvasSizes = {
    postcard: { width: 600, height: 400 },
    tote: { width: 450, height: 600 }
};

var previewSizes = {
    postcard: { width: 600, height: 400 },
    tote: { width: 450, height: 600 }
};
