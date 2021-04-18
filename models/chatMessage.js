const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;


class ChatMessage {
    constructor(name, message){
        this.name = name;
        this.message = message;
    }

    save(){
        const db = getDb();
        db.collection('chatMessages')
            .insertOne(this)
            .then(result =>{
                console.log(result);
            })
            .catch(err => {
                console.log(err);
            })
    }

    static fetchMsgByUser(name){
        const db = getDb();
        return db.collection('chatMessages')
            .find({name: name})
            .toArray()
            .then(chatMessages => {
                return chatMessages;
            }).catch(err => {
                console.log(err);
            });
    }
}

module.exports = ChatMessage;