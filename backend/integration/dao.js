
var sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "./db/db.sqlite"
const Message = require('../model/message');


function connect() {
    let client = new sqlite3.Database(DBSOURCE);
    return client;
}
/**
 * Fetches all messages from the DB.
 * 
 * @returns Instances of Message.
 */
function getMessages() {
    return new Promise(function (resolve, reject) {
        let db = connect();
        const getMessagesQuery = `SELECT * FROM active_messages`
        db.all(getMessagesQuery, function(err, rows) {
            if(err){
                console.log(err);
                db.close();
                reject({error: err})
            }else{
                db.close();
                var messages = [];
                rows.forEach(row => {
                    messages.push(new Message(row.messageID,row.email, row.passwd, row.send_time, row.create_time))
                });
                resolve(messages);
            }
        });
    });
}
function postMessage(params){
    return new Promise(function (resolve, reject) {
        let db = connect();
        const create_time = Date.now();
        const param_array = [params.passwd, params.email, params.send_time, create_time];
        const postMessageSQL = `INSERT INTO active_messages(passwd, email, send_time, create_time) VALUES(?, ?, ?, ?)`
        db.run(postMessageSQL,param_array, function(err) {
            if(err){
                console.log(err);
                db.close();
                reject({error: err})
            }else{
                db.close();
                resolve({message: "SUCCESS"});
            }
        });
    });
}
/**
 * Deletes all active messages from the DB.
 * 
 */
function deleteMessageQueue() {
    return new Promise(function (resolve, reject) {
        let db = connect();
        const removeMessagesSQL = `DELETE FROM active_messages`
        db.all(removeMessagesSQL, function(err) {
            if(err){
                console.log(err);
                db.close();
                reject({error: err})
            }else{
                db.close();
                resolve({message: 'Sucessfully Deleted All Messages'});
            }
        });
    });
}
/**
 * Deletes a list of messages
 * 
 */
function deleteMessages(messages) {
    return new Promise(function (resolve, reject) {
        let db = connect();
        const addMessageSQL = `INSERT INTO inactive_messages(passwd, email, send_time, create_time) VALUES(?, ?, ?, ?)`;
        const removeMessageSQL = `DELETE FROM active_messages WHERE messageID = ?`;
        let message_array;
        messages.forEach(message => {
            message_array = [message.passwd, message.email, message.send_time, message.create_time];
            db.run(addMessageSQL,message_array, function(err) {
                if(err){
                    console.log(err);
                    db.close();
                    reject({error: err})
                }
            });
            db.run(removeMessageSQL,message.messageID, function(err) {
                if(err){
                    console.log(err);
                    db.close();
                    reject({error: err})
                }
            });
        });
        db.close()
        resolve({message: 'Messages were successfully removed'});
    });
}
module.exports = {
    getMessages,
    postMessage,
    deleteMessageQueue,
    deleteMessages,
}