"use strict";
const getSalts = require("./chaoxingCaptcha.js").getSalts;

Object.defineProperty(exports, "__esModule", {value: true});
exports.getClassName = exports.getSignCode = exports.getValidateCode = exports.loadCaptcha = exports.getIfValidate = exports.getSignResult = exports.getSignType = exports.speculateType = exports.preSign2 = exports.preSign = exports.getPPTActiveInfo = exports.getActivity = exports.traverseCourseActivity = void 0;
const kolorist_1 = require("kolorist");
const api_1 = require("../configs/api");
const request_1 = require("../utils/request");
const jsdom_1 = require("jsdom");
const dayjs = require('dayjs');
const {Canvas, createCanvas, Image, ImageData, loadImage} = require('canvas');
// const location_1 = require("./location");
// const general_1 = require("./general");
// const photo_1 = require("./photo");
const JSDOM = new jsdom_1.JSDOM('', {url: 'https://im.chaoxing.com/webim/me'});
//加载dom和canvas给opencv.js使用
global.window = JSDOM.window;
global.location = JSDOM.window.location;
global.document = JSDOM.window.document;
global.Image = Image;
global.HTMLImageElement = Image;
global.HTMLCanvasElement = Canvas;
global.ImageData = ImageData;

function loadOpenCV() {
    return new Promise(resolve => {
        global.Module = {
            onRuntimeInitialized: resolve
        };
        global.cv = require('./opencv.js');
    });
}

const getDisForVerify = async (backgroundImageUrl, cutImageUrl) => {
    try {
        if (cv) {
            // console.log("opencv已经加载过了");
        }
    } catch (e) {
        try {
            await loadOpenCV();
            // console.log("opencv加载成功");
        } catch
            (e) {
            // console.log("opencv加载失败" + e);
        }

    }
    const backGroundImage = await loadImage(backgroundImageUrl);
    const bg_img = cv.imread(backGroundImage);
    const cutImage = await loadImage(cutImageUrl);
    const cut_img = cv.imread(cutImage);
    const edgesBg = new cv.Mat();
    const edgesCut = new cv.Mat();
    //将图片边缘化,去除不需要的部分以便匹配边缘
    cv.Canny(bg_img, edgesBg, 100, 200);
    cv.Canny(cut_img, edgesCut, 100, 200);
    //将图片转为灰度图,去除颜色匹配率更高
    cv.cvtColor(bg_img, bg_img, cv.COLOR_RGBA2GRAY, 0);
    cv.cvtColor(cut_img, cut_img, cv.COLOR_RGBA2GRAY, 0);
    const result = new cv.Mat();
    cv.matchTemplate(edgesBg, edgesCut, result, cv.TM_CCOEFF_NORMED);
    const minMax = cv.minMaxLoc(result);
    const maxLoc = minMax.maxLoc;
    // console.log(maxLoc['x']);
    return maxLoc['x'];
}

const traverseCourseActivity = async (args) => {
    console.log('正在查询有效签到活动，等待时间视网络情况而定...');
    const {courses, ...cookies} = args;
    let i = 0;
    let tasks = [];
    if (courses.length === 1) {
        try {
            return await (0, exports.getActivity)({course: courses[0], ...cookies});
        } catch (err) {
            console.log('未检测到有效签到活动！');
            return 'NoActivity';
        }
    }
    tasks.push((0, exports.getActivity)({course: courses[0], ...cookies}));
    for (i = 1; i < courses.length; i++) {
        tasks.push((0, exports.getActivity)({course: courses[i], ...cookies}));
        if (i % 5 === 0 || i === courses.length - 1) {
            try {
                return await Promise.any(tasks);
            } catch (error) {
            }
            tasks = [];
        }
    }
    console.log('未检测到有效签到活动！');
    return 'NoActivity';
};
exports.traverseCourseActivity = traverseCourseActivity;

const getActivity = async (args) => {
    const {course, ...cookies} = args;
    const result = await (0, request_1.request)(`${api_1.ACTIVELIST.URL}?fid=0&courseId=${course.courseId}&classId=${course.classId}&_=${new Date().getTime()}`, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    const data = JSON.parse(result.data);
    if (data.data !== null) {
        if (data.data.activeList.length !== 0) {
            const otherId = Number(data.data.activeList[0].otherId);
            if (otherId >= 0 && otherId <= 5 && data.data.activeList[0].status === 1) {
                if ((new Date().getTime() - data.data.activeList[0].startTime) / 1000 < 7200) {
                    console.log(`检测到活动：${data.data.activeList[0].nameOne}`);
                    return {
                        activeId: data.data.activeList[0].id,
                        name: data.data.activeList[0].nameOne,
                        courseId: course.courseId,
                        classId: course.classId,
                        otherId,
                    };
                }
            }
        }
    } else {
        console.log('请求似乎有些频繁，获取数据为空!');
        return 'Too Frequent';
    }
    throw 'Not Available';
};
exports.getActivity = getActivity;
const getPPTActiveInfo = async ({activeId, ...cookies}) => {
    const result = await (0, request_1.request)(`${api_1.PPTACTIVEINFO.URL}?activeId=${activeId}`, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    return JSON.parse(result.data).data;
};
exports.getPPTActiveInfo = getPPTActiveInfo;

//api好像没了，暂时不用了
const getIfValidate = async (args) => {
    //console.log("验证")
    const {activeId, ...cookies} = args;
    const getIfValidateResult = await (0, request_1.request)(`https://mobilelearn.chaoxing.com/widget/pcStuSignController/checkIfValidate?DB_STRATEGY=PRIMARY_KEY&STRATEGY_PARA=activeId&activeId=${activeId}&puid=`, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    // data: '{"result":1,"msg":"","data":null,"errorMsg":null}' 这里data对应的是字符串,获取不到对象,需要先转成对象
    const getIfValidateFlag = JSON.parse(getIfValidateResult.data).result
    //return true;
    //return getIfValidateFlag === 1;//{"result":0,"msg":null,"data":null,"errorMsg":""}
};
exports.getIfValidate = getIfValidate;

const loadCaptcha = async () => {
    let timeStamp = Date.now();
    let [captchaKey, loadCaptchaToken, iv] = getSalts(timeStamp);
    loadCaptchaToken = encodeURI(loadCaptchaToken)
    // console.log(captchaKey, loadCaptchaToken, iv)
    const loadCaptchaResult = await (0, request_1.request)(`https://captcha.chaoxing.com/captcha/get/verification/image?callback=cx_captcha_function&captchaId=Qt9FIw9o4pwRjOyqM6yizZBh682qN2TU&type=slide&version=1.1.20&captchaKey=${captchaKey}&token=${loadCaptchaToken}&referer=https%3A%2F%2Fwww.baidu.com&iv=${iv}&_=${timeStamp}`, {
        secure: true,
        headers: {},
    });
    let [token, backgroundImageUrl, cutImageUrl] = [loadCaptchaResult.data.split('"')[3], loadCaptchaResult.data.split('"')[13], loadCaptchaResult.data.split('"')[17]]
    // console.log("token:",token, "backgroundImageUrl:",backgroundImageUrl, "cutImageUrl:",cutImageUrl, "timeStamp:",timeStamp, "iv:",iv)
    return [token, backgroundImageUrl, cutImageUrl, timeStamp, iv]
};
exports.loadCaptcha = loadCaptcha;
const verify = async (args) => {
    // console.log("正在验证")
    const {activeId, ...cookies} = args;
    const [token, backgroundImageUrl, cutImageUrl, timeStamp, iv] = await loadCaptcha();
    // console.log("token:",token, "backgroundImageUrl:",backgroundImageUrl, "cutImageUrl:",cutImageUrl, "timeStamp:",timeStamp, "iv:",iv)
    let textClickArr = await getDisForVerify(backgroundImageUrl, cutImageUrl)
    textClickArr = `[{"x":${textClickArr}}]`;
    textClickArr = encodeURIComponent(textClickArr)
    // console.log("textClickArr" + textClickArr)
    const loadCaptchaResult = await (0, request_1.request)(`https://captcha.chaoxing.com/captcha/check/verification/result?callback=cx_captcha_function&captchaId=Qt9FIw9o4pwRjOyqM6yizZBh682qN2TU&type=slide&token=${token}&textClickArr=${textClickArr}&coordinate=%5B%5D&runEnv=10&version=1.1.20&iv=${iv}&_=${timeStamp}`, {
        secure: true,
        headers: {
            referer: `https://mobilelearn.chaoxing.com/page//signIn?courseId=240899766&classId=92499990&activeId=${activeId}&fid=0&timetable=0`,
            UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    /*
     *loadCaptchaResult.data=`cx_captcha_function({"error":0,"msg":"ok","result":true,"extraData":"{\\"validate\\":\\"validate_Qt9FIw9o4pwRjOyqM6yizZBh682qN2TU_B7C9E2635E9E1A16C2B59067CA5A356C\\"}"})`
     */
    //注意对验证的判断,opencv的处理不会百分百成功
    let verifyResult = JSON.parse(loadCaptchaResult.data.slice(loadCaptchaResult.data.indexOf("(") + 1, loadCaptchaResult.data.indexOf(")"))).result
    if (verifyResult) {
        //验证失败不会出现extraData, 'cx_captcha_function({"error":0,"msg":"ok","result":false})'
        let validateCode = JSON.parse(JSON.parse(loadCaptchaResult.data.slice(loadCaptchaResult.data.indexOf("(") + 1, loadCaptchaResult.data.indexOf(")"))).extraData).validate
        return [true, validateCode]
    }
    return [false, '']
};
exports.verify = verify;

const getValidateCode = async (args) => {
    const needValidate = true;
    //const needValidate = await getIfValidate(args)
    let validateCode = ""
    if (needValidate) {
        let verifyResult = false
        //加入循环直到验证成功才结束
        while (!verifyResult) {
            [verifyResult, validateCode] = await verify(args)
        }
    }
    return validateCode
};
exports.getValidateCode = getValidateCode;
const getSignCode = async (activeId) => {
    // let {activeId} = args
    let signCodeCooke = "chaoxing_cookie=biV3rwoRPFUZpZaHIGCZeGD3HViys8cZEti4mvz7pZBxB%2FqQK1HZCz4K3TKvuNVP8KYa569GOTZxtoFhgRDCzlKhzjttSBN%2FagjKB6IDwt5hEzP%2BTQc%2BpMOnfjJdd9SeFOL4HqhwVIMTJt9aua7%2Bd%2FmUGWB9g2tmxcE%2BuXEj2sGLAn1SisPLotfDSQ0iHrg3kJjKtvBeG9ueBO8c88Y1L1x8SKYij9c1NUq19PKMPJhXzPy3oZ5zQPNOqvl75IlsDg8FQlPOx3urGouyypjmW9vfgkAoBllcHjhkbm2xeo6QJJcqR5MNuolKQ6ICWUCdUm9P7HhSXp8hVJn7B3i45Vl7z1FpGRfuJw6dyrsLQLepPReE7kpG2A%2FU4CJ7H5DtuSi2j9FYeDn2NbpaJFmJlUUEO2YtMCScZ7dejUe5B6T5xavv3y3Jn0g6l2yWY89ZLXUukFhSHrldLVa2QJt2paiGgTi12luqQTOmWDF0gT72RDDktbVI1Qr%2FkpyF29G6Q3nXn9zlyASuem7nBrCRHMBmicADuBvP7lUuKuJQaiFXwK6%2Fl7RGkYdbsN8MlGXo%2FY3WW%2Bj1ma6xjgdxxzWsjeIGs4T%2FRKqdNDEaIP0jRztP7S7kFOlCvUUTOlEcxCsz0ZWjc0x%2Fyy3J%2BALwb6XWIYzIrndQlJJZ4mmOo6lqFFr0wejZ4Ljpr1K7mcjj4%2BIoHAHu%2BBEWvYrY7Rv7EJ2W4nJsa8yjuLyX8usUUCyhPhW8gP88OFHFHdLdQrIc16ApKO9B4TdsV%2FZhsnZS17hQqGgSws6Y88VLebidA1v5JQ3MPV5d%2FOKfuYcY4WK1NAHqPPPzHrDPeQF%2FXFv0aWwca3CcYddb0z3Jb23B2wsHIC17Qzzh4Vphy3PDkq5k%2F6ctsPDklky9jeh%2Fu3r0AUszpy%2BsAaio9ksccwfi0B7yjolse9xqs%2BAteMIC%2Fphh4Dgf%2BDr%2F9SV6DqEwHDwExa4UoMP2r6ABW493kg2Z3D9lBt3ir65R4bq0S9ZTed1CDRLQcpQn5Vk%2BWk4mjd3nIFmy753hokSW%2F1nRVbLV8VqXh2parO6u0Rx%2BGaTXfq1hY8YKtSFrfgE9a4cozpFYyduKaD81xrF6Bv1qMFvnzd%2B%2Fzfc9M6h3ttcwBc6pmzCyGP%2Fy6dWOem%2FK7pAKE2G5TQRlcOr3Dxes2Skes2s8Cjb5ZG0vdeMBSYuOwZUDEQbXOVwSwrsnFeW3%2FRoIkRvcT%2Bh7b1sDfC%2Bqvu%2F8BCL1fCB7L0fkJY5fXgFzDIKATdT8bz63aqsXwPG4yq6YT1X80YoXPFrdcQqFdn6rqnAUygJLTxH5uMtde2AVlKfDVaaGZo8Q2Ms8L%2BxSJo3sGKQWOgaTkK9smuPuANIf4j7ngbhBqXVWY8%2FGYhTGcL2jVw5rFIvE";
    const signCodeResult = await (0, request_1.request)(`https://oicoc.me/sign/passcheck.php?activeId=${activeId}`, {
        secure: true,
        headers: {
            Cookie: signCodeCooke
        },
    });
    //console.log(JSON.parse(CodeResult.data).signcode)
    try {
        return JSON.parse(signCodeResult.data).signcode;
    } catch (e) {
        console.log(e,"签到码获取失败,待修复");
        return "";
    }
};
exports.getSignCode = getSignCode;

//自研失败,只能用于手势签到
// const getSignCode = async (args) => {
//     let {activeId, ...cookies} = args
//     let CodeResult = await (0, request_1.request)(`https://mobilewx.chaoxing.com/widget/weixin/sign/stuSignController/preSign?activeId=${activeId}`, {
//         secure: true,
//         headers: {
//             Cookie: (0, request_1.cookieSerialize)(cookies),
//         },
//     })
//     let CodeHTMLDom = new jsdom_1.JSDOM(Result.data).window.document;
//     // console.log(CodeHTMLDom.getElementById("").value)
//     return CodeHTMLDom.getElementById("").value;
// };
// exports.getSignCode = getSignCode;

const preSign = async (args) => {
    const {activeId, classId, courseId, otherId, ...cookies} = args;
    const CourseNameResult = await (0, request_1.request)(`https://mobilelearn.chaoxing.com/v2/apis/class/getClassDetail?fid=0&courseId=${courseId}&classId=${classId}`, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    let courseName = JSON.parse(CourseNameResult.data).data.course.data[0].name
    let Type = otherId
    switch (Type) {
        case 2: {
            Type = "二维码签到"
            console.log((0, kolorist_1.red)('二维码签到，需人工干预！'));
            break;
        }
        case 4: {
            Type = "位置签到"
            break;
        }
        //手势签到
        case 3: {
            Type = "手势签到"
            break;
        }
        //签到码签到
        case 5: {
            Type = "签到码签到"
            break;
        }
        case 0: {
            Type = "普通签到"
            break;
        }
    }
    // console.log(args)
    console.log(`${dayjs().format('YYYY-MM-DD HH:mm:ss')}: ` + (0, kolorist_1.green)(`收到来自课程「${courseName}」的${Type}!`))

    const preSignResult = await (0, request_1.request)(`${api_1.PRESIGN.URL}?courseId=${courseId}&classId=${classId}&activePrimaryId=${activeId}&general=1&sys=1&ls=1&appType=15&&tid=&uid=${args._uid}&ut=s`, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    // console.log('analysis1 已请求');
    const analysisResult = await (0, request_1.request)(`${api_1.ANALYSIS.URL}?vs=1&DB_STRATEGY=RANDOM&aid=${activeId}`, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    let code = analysisResult.data;
    const code_start = code.indexOf('code=\'+\'') + 8;
    code = code.substring(code_start, code.length);
    const code_end = code.indexOf('\'');
    code = code.substring(0, code_end);
    const analysis2Result = await (0, request_1.request)(`${api_1.ANALYSIS2.URL}?DB_STRATEGY=RANDOM&code=${code}`, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    // console.log(`预签到请求结果：${analysis2Result.data}`);
    await new Promise(resolve => setTimeout(async () => {
        resolve();
    }, 0));//在这里设置延迟或在配置文件中设置
};
exports.preSign = preSign;
const preSign2 = async (args) => {
    const {activeId, chatId, tuid, ...cookies} = args;
    const result = await (0, request_1.request)(`${api_1.CHAT_GROUP.PRESTUSIGN.URL}?activeId=${activeId}&code=&uid=${cookies._uid}&courseId=null&classId=0&general=0&chatId=${chatId}&appType=0&tid=${tuid}&atype=null&sys=0`, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    console.log('[预签]已请求');
    return result.data;
};
exports.preSign2 = preSign2;
const speculateType = (text) => {
    if (text.includes('拍照')) {
        return 'photo';
    } else if (text.includes('位置')) {
        return 'location';
    } else if (text.includes('二维码')) {
        return 'qr';
    }
    return 'general';
};
exports.speculateType = speculateType;
const getSignType = (iptPPTActiveInfo) => {
    switch (iptPPTActiveInfo.otherId) {
        case 0:
            if (iptPPTActiveInfo.ifphoto === 1) {
                return '拍照签到';
            } else {
                return '普通签到';
            }
        case 2:
            return '二维码签到';
        case 3:
            return '手势签到';
        case 4:
            return '位置签到';
        case 5:
            return '签到码签到';
        default:
            return '未知';
    }
};
exports.getSignType = getSignType;
const getSignResult = (iptResult) => {
    switch (iptResult) {
        case 'success':
            return '成功';
        case 'fail':
            return '失败';
        case 'fail-need-qrcode':
            return '请发送二维码';
        default:
            return iptResult;
    }
};
exports.getSignResult = getSignResult;
