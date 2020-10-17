const controller = require('../controller/controller');

const cron = require('node-cron')
// cron.schedule(second minute hour day_of_month month day_of_week)
// cron.schedule(* * * * *) => Every second, Every minute.... once per second
// cron.schedule(*/2 * * * *) => Once every other second
// cron.schedule(1 * * * *) => Once every minute
// cron.schedule(* 1 * * *) => Once every hour
// cron.schedule(0,30 * * * *) => Twice per minute
var task = cron.schedule("0,15,30,45 * * * * *", async function(){
    await controller.checkMailSchedual();
    // await controller.deleteMessageQueue();
});

/**
 * Routes all api requests. 
 * All client requests will be send here and and the right functions here will send a request to the controller.
 *
 * @param {App} router - The express application.
 */
function router(router) {
    router.get('/api/messages', async (req, res) => {
        try {

            const messages = await controller.getMessages();
            console.log("Done messages...");

            res.send(JSON.stringify({ messages: messages }))
        } catch (error) {
            console.log("Error Occured: "+error);

            res.send(JSON.stringify({ error: error }))
        }
    });
    /**
     * Create a new message.
     *
     * @req.query = {passwd, email, send_time}
     */
    router.post('/api/message', async (req, res) => {
        try {
            const message = await controller.postMessage(req.query);
            res.send("Message was created");
        } catch (error) {
            res.send(JSON.stringify({ error: error }))
        }
    });
};
module.exports = {
    router,
}

