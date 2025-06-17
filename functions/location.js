"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.presetAddressChoices = exports.LocationSign_2 = exports.LocationSign = void 0;
const api_1 = require("../configs/api");
const helper_1 = require("../utils/helper");
const request_1 = require("../utils/request");
const {getValidateCode} = require("./activity");
const jsdom_1 = require("jsdom");
const dayjs = require("dayjs");
const kolorist_1 = require("kolorist");
const LocationSign = async (args) => {
    let msg = '';
    let validateCode = await getValidateCode(args)
    /*
    if (validateCode !== "") {
        console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')}: ` + (0, kolorist_1.yellow)("教师开启了验证码, 已自动验证"))
    }
    */
    if ('address' in args) {
        const {name, address, activeId, lat, lon, fid, ...cookies} = args;
        const url = `${api_1.PPTSIGN.URL}?name=${name}&address=${address}&activeId=${activeId}&uid=${cookies._uid}&clientip=&latitude=${lat}&longitude=${lon}&fid=${fid}&appType=15&ifTiJiao=1&validate=${validateCode}`;
        const result = await (0, request_1.request)(url, {
            secure: true,
            headers: {
                Cookie: (0, request_1.cookieSerialize)(cookies),
            },
        });
        msg = result.data === 'success' ? '[位置]签到成功' : `[位置]${result.data}`;
    } else {
        let {activeId, name, presetAddress, classId, courseId, fid, course, ...cookies} = args;
        const preSignResult = await (0, request_1.request)(`${api_1.PRESIGN.URL}?courseId=${courseId}&classId=${classId}&activePrimaryId=${activeId}&general=1&sys=1&ls=1&appType=15&&tid=&uid=${args._uid}&ut=s&validate=${validateCode}`, {
            secure: true,
            headers: {
                Cookie: (0, request_1.cookieSerialize)(cookies),
            },
        });
        // console.log('preSignResult:', preSignResult.data);
        const getLocationResult = await (0, request_1.request)(`https://mobilelearn.chaoxing.com/v2/apis/sign/getLocationLog?courseId=${courseId}&DB_STRATEGY=COURSEID&STRATEGY_PARA=courseId&classId=${classId}`, {
            secure: true,
            headers: {
                Cookie: (0, request_1.cookieSerialize)(cookies),
            },
        });
        let locationList = [];
        try {
            locationList = JSON.parse(getLocationResult.data).data;
        } catch (e) {
            console.error('获取位置信息失败', getLocationResult);
        }
        let locationAddress, locationLatitude, locationLongitude = ["", "", ""];
        for (let i = 0; i < locationList.length; i++) {
            if (locationList[i].activeid === activeId) {
                locationAddress = locationList[i].address;
                locationLatitude = locationList[i].latitude;
                locationLongitude = locationList[i].longitude;
            }
        }
        // let preSignHTMLDom = new jsdom_1.JSDOM(preSignResult.data).window.document;
        // let [locationAddress, locationLatitude, locationLongitude] = [preSignHTMLDom.getElementById("locationAddress").value, preSignHTMLDom.getElementById("locationLatitude").value, preSignHTMLDom.getElementById("locationLongitude").value]
        // let [locationAddress, locationLatitude, locationLongitude] = ["", "", ""]
        // console.log("限制: " + locationAddress + " " + locationLatitude + " " + locationLongitude)
        //      console.log(`https://oicoc.me/sign/position.php?activeId=${activeId}&courseId=${courseId}&clazzId=${classId}`)

        // console.log(locationAddress,locationLatitude,locationLongitude);
        if (locationAddress === "" || locationLatitude === "" || locationLongitude === "" || locationAddress === undefined) {
            //没有限制具体位置
        } else {
            console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')}: ` + (0, kolorist_1.red)(`限制位置: ${locationAddress}的签到, 已自动定位到此处!`))
            presetAddress[0].address = locationAddress
            presetAddress[0].lat = locationLatitude
            presetAddress[0].lon = locationLongitude
        }
        for (let i = 0; i < presetAddress.length; i++) {
            //console.log(presetAddress[i].address, presetAddress[i].lat, presetAddress[i].lon)
            const url = `${api_1.PPTSIGN.URL}?name=${name}&address=${presetAddress[i].address}&activeId=${activeId}&uid=${cookies._uid}&clientip=&latitude=${presetAddress[i].lat}&longitude=${presetAddress[i].lon}&fid=${fid}&appType=15&ifTiJiao=1&validate=${validateCode}`;
            const result = await (0, request_1.request)(url, {
                secure: true,
                headers: {
                    Cookie: (0, request_1.cookieSerialize)(cookies),
                },
            });
            if (result.data === 'success') {
                msg = `${dayjs().format('YYYY-MM-DD HH:mm:ss')}: ` + (0, kolorist_1.green)('[位置]签到成功');
                break;
            } else {
                msg = `${dayjs().format('YYYY-MM-DD HH:mm:ss')}: ` + (0, kolorist_1.green)(`[位置]${result.data}`);
                await (0, helper_1.delay)(1);
            }
        }
    }
    console.log(msg);
    return msg;
};
exports.LocationSign = LocationSign;

const LocationSign_2 = async (args) => {
    let msg = '';
    if ('address' in args) {
        const {address, activeId, lat, lon, ...cookies} = args;
        const formdata = `address=${encodeURIComponent(address)}&activeId=${activeId}&uid=${cookies._uid}&clientip=&useragent=&latitude=${lat}&longitude=${lon}&fid=&ifTiJiao=1`;
        const result = await (0, request_1.request)(api_1.CHAT_GROUP.SIGN.URL, {
            secure: true,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                Cookie: (0, request_1.cookieSerialize)(cookies),
            },
        }, formdata);
        const msg = result.data === 'success' ? '[位置]签到成功' : `[位置]${result.data}`;
    } else {
        const {activeId, presetAddress, ...cookies} = args;
        for (let i = 0; i < presetAddress.length; i++) {
            const formdata = `address=${encodeURIComponent(presetAddress[i].address)}&activeId=${activeId}&uid=${cookies._uid}&clientip=&useragent=&latitude=${presetAddress[i].lat}&longitude=${presetAddress[i].lon}&fid=&ifTiJiao=1`;
            const result = await (0, request_1.request)(api_1.CHAT_GROUP.SIGN.URL, {
                secure: true,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    Cookie: (0, request_1.cookieSerialize)(cookies),
                },
            }, formdata);
            if (result.data === 'success') {
                msg = '[位置]签到成功';
                break;
            } else {
                msg = `[位置]${result.data}`;
                await (0, helper_1.delay)(1);
            }
        }
    }
    console.log(msg);
    return msg;
};
exports.LocationSign_2 = LocationSign_2;
const presetAddressChoices = (presetAddress = []) => {
    const arr = [];
    for (let i = 0; i < presetAddress.length; i++) {
        arr.push({
            title: `${presetAddress[i].lon},${presetAddress[i].lat}/${presetAddress[i].address}`,
            value: i,
        });
    }
    arr.push({title: '手动添加', value: -1});
    return [...arr];
};
exports.presetAddressChoices = presetAddressChoices;
