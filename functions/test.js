function formatDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需 +1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 返回格式示例：YYYY-MM-DD HH:mm:ss
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const JSDOM = require('jsdom').JSDOM;
const dayjs = require('dayjs');
const request_1 = require("../utils/request");
console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'))
// 使用
console.log(formatDate()); // 当前时间，如 "2024-05-23 15:30:45"
console.log(formatDate(new Date('2023-10-05T14:30:45'))); // 指定日期，输出 "2023-10-05 14:30:45"
// const API_URL = 'https://www.baidu.com';
// const axios = require('axios');
// const url = require("url");
// // 生成100个请求的URL数组
// const urls = Array.from({length: 9999}, (_,i) => {
//   i=i.toString().padStart(4, '0')
//   return `${API_URL}?id=${i}`
// });
// console.log(urls)
//
// async function burstRequests() {
//   try {
//     const responses = await Promise.all(
//       urls.map(url => axios.get(url).catch(e => null)) // 错误静默处理
//     );
//     const validData = responses.filter(r => r?.status === 200);
//     // console.log(responses.map(d => d.data))
//     console.log(`成功获取${validData.length}条数据`);
//   } catch (error) {
//     console.error('全局捕获:', error);
//   }
// }

// burstRequests()

// const fs = require('fs');
//
//
// let codes=[]
// async function getCodes() {
//   return new Promise((resolve, reject) => {
//     fs.readFile('codes.json', 'utf8', (err, data) => {
//       if (err) reject(err);
//       else {
//           codes= JSON.parse(data).codes;
//           resolve(codes);
//       }
//     });
//   });
// }
// async function main(){
//     let codes=await getCodes();
//     console.log(codes)
//     for(let i=0;i<codes.length;i++){
//         console.log(codes[i])
//     }
// }
//
// main()

// let a = `cx_captcha_function({"error":0,"msg":"ok","result":true,"extraData":"{\\"validate\\":\\"validate_Qt9FIw9o4pwRjOyqM6yizZBh682qN2TU_B7C9E2635E9E1A16C2B59067CA5A356C\\"}"})`
// a=`cx_captcha_function({"error":0,"msg":"ok","result":false})`
// console.log(JSON.parse(JSON.parse(a.slice(a.indexOf("(")+1,a.indexOf(")"))).extraData).validate);

// const {Canvas, createCanvas, Image, ImageData, loadImage} = require('canvas');
// const {JSDOM} = require('jsdom');
// const {writeFileSync, existsSync, mkdirSync} = require("fs");
//
// //加载jsdom模拟浏览器,并将全局变量(浏览器中有并且需要使用的)设置为jsdom模拟的变量
// const dom = new JSDOM();
// global.document = dom.window.document;
// global.Image = Image;
// global.HTMLCanvasElement = Canvas;
// global.ImageData = ImageData;
// global.HTMLImageElement = Image;
// function loadOpenCV() {
//     return new Promise(resolve => {
//         global.Module = {
//             onRuntimeInitialized: resolve
//         };
//         global.cv = require('./opencv.js');
//     });
// }
// (async () => {
//     //加载opencv需要异步处理
//     await loadOpenCV();
//     const backGroundImage = await loadImage('https://captcha-b.chaoxing.com/slide/big/AE5ED1C94FF6AD0F043D22E0F708559F.jpg');
//     const bg_img = cv.imread(backGroundImage);
//     const cutImage = await loadImage('https://captcha-b.chaoxing.com/slide/small/AE5ED1C94FF6AD0F043D22E0F708559F.jpg');
//     const cut_img = cv.imread(cutImage);
//     const edgesBg = new cv.Mat();
//     const edgesCut = new cv.Mat();
//     //将图片边缘化,去除不需要的部分以便匹配边缘
//     cv.Canny(bg_img, edgesBg, 100, 200);
//     cv.Canny(cut_img, edgesCut, 100, 200);
//     //将图片转为灰度图,去除颜色匹配率更高
//     cv.cvtColor(bg_img, bg_img, cv.COLOR_RGBA2GRAY, 0);
//     cv.cvtColor(cut_img, cut_img, cv.COLOR_RGBA2GRAY, 0);
//     const result = new cv.Mat();
//     cv.matchTemplate(edgesBg, edgesCut, result, cv.TM_CCOEFF_NORMED);
//     const minMax = cv.minMaxLoc(result);
//     const maxLoc = minMax.maxLoc;
//     console.log(maxLoc['x']);
//     // const canvas = createCanvas(300, 300);//画布的宽高不影响图片的宽高
//     // cv.imshow(canvas, edgesBg);
//     // writeFileSync('output.jpg', canvas.toBuffer('image/jpeg'));
// })();