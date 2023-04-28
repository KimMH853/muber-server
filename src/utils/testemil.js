const auth = {
    SendEmail : async(req, res) => {
        const number = generateRandom(111111,999999)

        const { sendEmail } = req.body;

        const mailOptions = {
            from: "정욱이네러버덕",
            to: sendEmail,
            subject: "[러버덕]인증 관련 이메일 입니다",
            text: "오른쪽 숫자 6자리를 입력해주세요 : " + number
        };

        const result = await smtpTransport.sendMail(mailOptions, (error, responses) => {
            if (error) {
                return res.status(statusCode.OK).send(util.fail(statusCode.BAD_REQUEST, responseMsg.AUTH_EMAIL_FAIL))
            } else {
              /* 클라이언트에게 인증 번호를 보내서 사용자가 맞게 입력하는지 확인! */
                return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMsg.AUTH_EMAIL_SUCCESS, {
                    number: number
                }))
            }
            smtpTransport.close();
        });
    }
}