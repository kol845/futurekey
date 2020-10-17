
const nodemailer = require('nodemailer');
//const SendmailTransport = require('nodemailer/lib/sendmail-transport'); //What is this?
const mailCred = require('./../mail_cred.json');

function checkMailSchedual(messages){
    const time_now = Date.now();
    var delMessages = [];
    messages.forEach(message => {
        //console.log(message)
        if(time_now>message.send_time){
            console.log("Sending following mail: ",message)
            delMessages.push(message);
            sendMail(message);
            console.log("Mail sucessfully sent!")
        }
    });
    return delMessages;
}
async function sendMail(message){
    const output = `
    <p>Here is the password that you sent to your future self!</p>        
    <p>Password: ${message.passwd}</p>
        
    `;
    let transporter = nodemailer.createTransport({
        host: mailCred.host,
        port: mailCred.port,
        secure: false, // true for 465, false for other ports
        auth: {
        user: mailCred.auth.user, // generated ethereal user
        pass: mailCred.auth.pass, // generated ethereal password
        },
        tls:{
            rejectUnauthorized:false
        }
    });
    let mailOptions={
        from: "FutureKey <"+mailCred.auth.user+">", // sender address
        to: message.email, // list of receivers
        subject: "Future password has arrived!", // Subject line
        text: "Hello world?", // plain text body
        html: output, // html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) =>{
        if(error){
            console.log(error);
        }else{
            console.log("Message was successfully sent to: %s", message.email);
        }
    });
}
module.exports = {
    checkMailSchedual,
}