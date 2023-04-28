const nodemailer = require('nodemailer');


  export const sendVerificationEmail = async(email, key)=>{
    const account ={
        "host": "smtp.naver.com",
        "port": 587,
        "secure": false,
        "auth":{
            "user":process.env.EMAIL,
            "pass": process.env.EMAIL_PASSWORD
        }
      }
    
    const content = {
        from: "alsgp0424@naver.com",
        to:email,
        subject:"muber에서 보내는 인증 메일입니다",
        text: `Verify your email by clicking <a href="http://nuber.com/verification/${key}/">here</a>`
      }
    nodemailer.createTransport(account).sendMail(content,  (error, info) => {
        if(error){
            console.log(error)
        }
        else{
            console.log(info)
            return info.response
        }
        
    })
  }
