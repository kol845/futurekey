const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const dropdown = require('./public/js/dropdown.js')
const mailCred = require('./mail_cred.json');

const app = express();


// var hbsHelpers = exphbs.create({
//     helpers: require("./model/handlebars.js").helpers,
//     defaultLayout: 'layout',
//     extname: '.hbs'
// });
app.engine('hbs', exphbs({
    extname: 'hbs', 
    defaultLayout: 'base', 
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir  : [
        //  path to your partials
        path.join(__dirname, 'views/partials'),
    ],
    helpers: {// Helper functions are created here with 'express-handlebars'
        log: function (something) { console.log(something); }, // Function for console loging in hbs
    }
}));

app.set('view engine', 'hbs');

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) =>{
    res.render('home',{
        layout: false,
        test:"Fest",
        dt:dropdown.getDT()      
    });
});
app.post('/send', (req, res)=>{
    const output = `
        <p>Here is the password that you sent to your future self!</p>        
        <p>Password: ${req.body.password}</p>
        
    `;
    // create reusable transporter object using the default SMTP transport
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
        to: req.body.email, // list of receivers
        subject: "Future password has arrived!", // Subject line
        text: "Hello world?", // plain text body
        html: output, // html body
    }
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) =>{
        if(error){
            return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
        //res.redirect('home',{msg: 'Your password has been successfully sent to your future self!', layout: false} )
        res.render('home', {msg: 'Your password has been successfully sent to your future self!', layout: false})
    });


})
app.listen(3000, () => console.log('Server started on port 3000'));