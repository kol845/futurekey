# FutureKey
Create and send passwords to your email in a desired date and time.

Helpfull tool for stopping digital entertainment addiction.

Create a password, change your account to this new password and send it to your future mail. Now you can't acces the account untill you get your FutureKey.

## Installation
1. Clone git
```shell
git clone https://github.com/kol845/futurekey.git
```
2. Download package dependencies
```shell
npm install
```
3. Install *nodemon* globaly to your system path
```shell
npm install -g nodemon
```
4. Edit the *mail_cred.jason* file and add your email credentials. Example of this might be;
```js
{
    "host": "mailcluster.loopia.se", // The mail server for outgoing mail
    "port": 587,  // Port of mail server for outgoing mail
    "auth": {
        "user": "test@test.test", // Email you want to use for sending
        "pass": "abc123"  // Password for sending email
    }
}
```
5. Run the server with nodemon
```shell
nodemon
```
Now the server should be up! Visit the page in your browser by typing 'localhost:3000'.
