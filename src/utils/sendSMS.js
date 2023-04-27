var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256");
var Base64 = require("crypto-js/enc-base64");
var request = require("request");

const sendSMS = (phone, key)=>{
  var user_phone_number = phone;
  var user_auth_number = key;
  var resultCode = 404;
  const date = Date.now().toString();
  const uri = process.env.SERVICE_ID;
  const secretKey = process.env.NCP_SECRET_KEY;
  const accessKey = process.env.NCP_KEY;
  const method = "POST";
  const space = " ";
  const newLine = "\n";
  const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
  const url2 = `/sms/v2/services/${uri}/messages`;
  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

  hmac.update(method);
  hmac.update(space);
  hmac.update(url2);
  hmac.update(newLine);
  hmac.update(date);
  hmac.update(newLine);
  hmac.update(accessKey);

  const hash = hmac.finalize();
  const signature = hash.toString(CryptoJS.enc.Base64);
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
        from: process.env.SEND_PHONE,
        content: `인증번호 ${user_auth_number} 입니다.`,
        messages: [
          {
            to: `${user_phone_number}`,
          },
        ],
      },
    },
    function (err, res, html) {
      if (err) console.log(err);
      else {
        resultCode = 200;
        console.log(html);
      }
    }
  );
  return resultCode;
}


export default sendSMS;