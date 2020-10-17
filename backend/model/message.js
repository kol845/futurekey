module.exports = class Message{
    /**
     *Creates an instance of User.
     * @param {Integer} messageID - Auto-Increment message ID, Primary Key
     * @param {String} email - Email of the user
     * @param {String} password - Password of the user
     * @param {String} send_time - Time that the message is to be sent. Unix time format.
     * @param {String} create_time - Time that the message was created. Unix time format.
     */
    constructor(messageID,email,passwd,send_time,create_time){
        this.messageID = messageID;
        this.email = email;
        this.passwd = passwd;
        this.send_time = send_time;
        this.create_time = create_time;
    }
    display() {
        console.log(this.email + " " + this.passwd);
    }
}