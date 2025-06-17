"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : {"default": mod};
};

Object.defineProperty(exports, "__esModule", {value: true});
exports.getIMParams = exports.getLocalUsers = exports.getPanToken = exports.getAccountInfo = exports.getCourses = exports.userLogin = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const kolorist_1 = require("kolorist");
const api_1 = require("../configs/api");
const file_1 = require("../utils/file");
const request_1 = require("../utils/request");
const DefaultParams = {
    fid: '-1',
    pid: '-1',
    refer: 'http%3A%2F%2Fi.chaoxing.com',
    _blank: '1',
    t: true,
    vc3: '',
    _uid: '',
    _d: '',
    uf: '',
    lv: '',
};
const userLogin = async (uname, password) => {
    const wordArray = crypto_js_1.default.enc.Utf8.parse('z4ok6lu^oWp4_AES');
    const encryptedPassword = crypto_js_1.default.AES.encrypt(`{"uname":"${uname}","code":"${password}"}`, wordArray, {
        mode: crypto_js_1.default.mode.ECB,
        padding: crypto_js_1.default.pad.Pkcs7,
    });
    const loginInfo = encryptedPassword.toString()
    // console.log(`{"uname":"${uname}","code":"${password}"}`)
    // console.log(loginInfo)
    // console.log(`${api_1.LOGIN.URL}?logininfo=${encodeURIComponent(loginInfo)}&entype=1`)
    // console.log(`${api_1.LOGIN.URL}?logininfo=${loginInfo}&entype=1`)
    const formData = {
        logininfo: loginInfo,
        entype: 1,
    }
    const result = await (0, request_1.request)(`${api_1.LOGIN.URL}?logininfo=${encodeURIComponent(loginInfo)}&entype=1`, {
        secure: true,
        method: api_1.LOGIN.METHOD,
        headers: {
            UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
        },
    }, {});
    // console.log(result.data);
    if (JSON.parse(result.data).status) {
        const cookies = result.headers['set-cookie'];
        let c_equal, c_semi, itemName, itemValue;
        const map = new Map();
        if (!cookies) {
            console.log('网络异常，换个环境重试');
            return 'AuthFailed';
        }
        for (let i = 0; i < cookies.length; i++) {
            c_equal = cookies[i].indexOf('=');
            c_semi = cookies[i].indexOf(';');
            itemName = cookies[i].substring(0, c_equal);
            itemValue = cookies[i].substring(c_equal + 1, c_semi);
            map.set(itemName, itemValue);
        }
        const rt_cookies = Object.fromEntries(map.entries());
        console.log('登陆成功');
        const loginResult = Object.assign({...DefaultParams}, rt_cookies);
        return loginResult;
    }
    console.log('登陆失败');
    return 'AuthFailed';
};
exports.userLogin = userLogin;
const getCourses = async (_uid, _d, vc3) => {
    const formdata = 'courseType=1&courseFolderId=0&courseFolderSize=0';
    const result = await (0, request_1.request)(api_1.COURSELIST.URL, {
        gzip: true,
        method: api_1.COURSELIST.METHOD,
        headers: {
            Accept: 'text/html, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;',
            Cookie: `_uid=${_uid}; _d=${_d}; vc3=${vc3}`,
        },
    }, formdata);
    if (result.statusCode === 302) {
        console.log('身份过期，程序将关闭，请你使用手动填写用户名密码的方式登录！手动登录后身份信息刷新，之后可继续使用本地凭证！\n');
        return 'AuthFailed';
    }
    const data = result.data;
    const arr = [];
    let end_of_courseid;
    for (let i = 1; ; i++) {
        i = data.indexOf('course_', i);
        if (i === -1)
            break;
        end_of_courseid = data.indexOf('_', i + 7);
        arr.push({
            courseId: data.slice(i + 7, end_of_courseid),
            classId: data.slice(end_of_courseid + 1, data.indexOf('"', i + 1)),
        });
    }
    if (arr.length === 0) {
        console.log(`${(0, kolorist_1.blue)('[提示]')}无课程可查.`);
        return 'NoCourse';
    }
    return arr;
};
exports.getCourses = getCourses;
const getAccountInfo = async (cookies) => {
    const result = await (0, request_1.request)(api_1.ACCOUNTMANAGE.URL, {
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    const data = result.data;
    const end_of_messageName = data.indexOf('messageName') + 20;
    const name = data.slice(end_of_messageName, data.indexOf('"', end_of_messageName));
    return name;
};
exports.getAccountInfo = getAccountInfo;
const getPanToken = async (cookies) => {
    const result = await (0, request_1.request)(api_1.PANTOKEN.URL, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    return result.data;
};
exports.getPanToken = getPanToken;
const getLocalUsers = () => {
    const data = (0, file_1.getJsonObject)('configs/storage.json');
    const arr = [];
    for (let i = 0; i < data.users.length; i++) {
        arr.push({
            title: data.users[i].phone,
            value: i,
        });
    }
    arr.push({title: '手动登录', value: -1});
    return [...arr];
};
exports.getLocalUsers = getLocalUsers;
const getIMParams = async (cookies) => {
    const params = {
        myName: '',
        myToken: '',
        myTuid: '',
        myPuid: '',
    };
    const result = await (0, request_1.request)(api_1.WEBIM.URL, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    const data = result.data;
    if (data === '') {
        console.log('身份凭证似乎过期，请手动登录');
        return 'AuthFailed';
    }
    let index = data.indexOf('id="myName"');
    params.myName = data.slice(index + 35, data.indexOf('<', index + 35));
    index = data.indexOf('id="myToken"');
    params.myToken = data.slice(index + 36, data.indexOf('<', index + 36));
    index = data.indexOf('id="myTuid"');
    params.myTuid = data.slice(index + 35, data.indexOf('<', index + 35));
    params.myPuid = cookies._uid;
    return {...params};
};
exports.getIMParams = getIMParams;
