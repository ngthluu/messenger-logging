exports.getThreadName = function (api, threadId){
    return new Promise((resolve, reject) => {
        api.getThreadInfo(threadId, (err, info) => {
            if (err) reject (err);
            else resolve(info.nicknames);
        });
    });
}

exports.markAsRead = function(api, threadId){
    return new Promise((resolve, reject) => {
        api.markAsRead(threadId);
        resolve(true);
    });
}

exports.getMostRecentMessages = function(api, threadId){
    return new Promise((resolve, reject) => {
        api.getThreadHistory(threadId, 1, undefined, (err, history) => {
            if (err) reject(err);
            else resolve(history[0]);
        });
    });
}

exports.getMostRecentThread = function (api){
    return new Promise((resolve, reject) => {
        api.getThreadList(2, null, [], (err, list) => {
            resolve(list[0].threadID);
        });
    });
}

exports.isMessageInBox = function(message, box){
    for (let i in box){
        if (box[i]['Message'] === message.body && box[i]['Timestamp'] === message.timestamp) return true;
    }
    return false;
}