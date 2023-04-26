var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256");
var Base64 = require("crypto-js/enc-base64");
// import CryptoJS from 'crypto-js'
// import request from 'request';
var request = require("request");
const sendSMS = (phone, key)=>{
  console.log(phone);
  console.log(key);
    let userPhoneNumber = phone;
    let resultCode = 404;

    const date = Date.now().toString();
    const uri = process.env.SERVICE_ID;
    const secretKey = process.env.NCP_SECRET_KEY;
    const accessKey = process.env.NCP_KEY;
    const method = "POST";
    const space = " ";
    const newLine = "\n";
    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
    const url2 = `/sms/v2/services/${uri}/messages`;
    console.log(secretKey);
    console.log(accessKey);
  
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

    hmac.update(method);
    hmac.update(space);
    hmac.update(url2);
    hmac.update(newLine);
    hmac.update(date);
    hmac.update(accessKey);

    const hash = hmac.finalize();
    const signature = hash.toString(CryptoJS.enc.Base64);
    console.log(signature);
    
    
    request(
        {
            method: method,
            json: true,
            uri: url,
            headers: {
              "Contenc-type": "application/json; charset=utf-8",
              "x-ncp-iam-access-key": accessKey,
              "x-ncp-apigw-timestamp": date,
              "x-ncp-apigw-signature-v2": signature,
            },
            body: {
              type: "SMS",
              countryCode: "82",
              from: "01026369919",
              content: `인증번호 ${key} 입니다.`,
              messages: [
                {
                  to: `${userPhoneNumber}`,
                },
              ],
            },
          },
          function (err, res, html) {
            if (err) {
              console.log(err);
              console.log("에러")
            }else { 
              resultCode = 200; console.log(html); 
              console.log("성공")
            }
          }
        );
    
    return resultCode;
}

export default sendSMS;