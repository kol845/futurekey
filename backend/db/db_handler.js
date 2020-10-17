import database from './database';

let db_handler = {

    getActiveMessages: () => {
        const sql = `SELECT * FROM active_messages`;
        let data = {a:'b'};
        function dataCallback(input){
            data = input;
        }
        database.get(sql, dataCallback);
        //console.log(message)
        return data;   
    }
}

export default db_handler;