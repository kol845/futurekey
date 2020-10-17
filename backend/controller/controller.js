 
const dao = require('../integration/dao');
const email = require('../model/email');

async function getMessages() {
    try {
        return await dao.getMessages();
    }
    catch (error) {

        throw error
    }
}
async function postMessage(params) {
    try {
        return await dao.postMessage(params);
    }
    catch (error) {
        throw error
    }
}
async function deleteMessageQueue() {
    try {
        return await dao.deleteMessageQueue();
    }
    catch (error) {
        throw error
    }
}

async function checkMailSchedual(){
    try{
        let messages = await getMessages();
        console.log("Messages in queue: "+messages.length);
         if(messages.length>0){
             const delMessages = email.checkMailSchedual(messages);             
             if(delMessages.length>0){
                await dao.deleteMessages(delMessages);
            }
         }else{
             console.log("Message queue is empty? Really?");
         }

    }catch(error){
        throw error;
    }
}
function checkDB(){
    try{
        dao.checkDB();

    }catch(error){
        throw error;
    }
}
module.exports = {
    postMessage,
    checkMailSchedual,
    deleteMessageQueue,
    getMessages,
    checkDB,
}