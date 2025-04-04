const nodemailer = require("nodemailer")

const sendEmail = async (userEmail, sub, msg) => {
    const transport = nodemailer.createTransport({
        host: process.env.NODEMAILER_HOST,
        port: process.env.NODEMAILER_PORT,
        sender: true,
        secure: true,
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.APP_PASS
        }
    })
    try {
        console.log(userEmail)
        const info = await transport.sendMail({
            from: '"TEAM AI"<harshit.t@consultadd.com>',
            to: userEmail,
            subject: sub,
            html: msg
        })
        console.log("Msg send: ", info.messageId)
        return true
    } catch (error) {
        console.log(error)
        throw Error("Error in sending mail")
    }
}

module.exports = sendEmail