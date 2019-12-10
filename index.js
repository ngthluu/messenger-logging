const fs = require('fs');
const login = require('facebook-chat-api');
const readline = require("readline");

const mainScript = require('./main');

// Read stream from command-line
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Credentials setup
let credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
if (fs.existsSync('./appstate.json')){
    console.log("Credential file exists");
    credentials = {appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))};
}

// Login
login(credentials, async (err, api) => {

    if (err) {
        switch (err.error){
            case 'login-approval':
                console.log('Enter code: ');
                rl.on('line', (line) => {
                    err.continue(line);
                    rl.close();
                });
                break;
            default:
                console.error(err);
        }
        return;
    }

    // Save session
    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));

    let messageHistory = {};

    // Loop
    while (true){

        threadID = await mainScript.getMostRecentThread(api);

        // Create a thread node if it's not exist
        if (messageHistory[threadID] === undefined){
            messageHistory[threadID] = {
                'ThreadID': threadID,
                'Message': []
            };
        }
            
        // Get member name list
        let memberNameList = await mainScript.getThreadName(api, threadID);
        
        // Mark as read
        await mainScript.markAsRead(api, threadID);

        // Get most recent message
        let message = await mainScript.getMostRecentMessages(api, threadID);

        if (messageHistory[threadID].Message.length == 0 || !mainScript.isMessageInBox(message, messageHistory[threadID].Message)){
            messageHistory[threadID].Message.push({
                'Username': memberNameList[message.senderID],
                'UserID': message.senderID,
                'Message': message.body,
                'Timestamp': message.timestamp
            });
            console.log(`Push one message from box ${threadID}`);
            fs.writeFileSync('log.json', JSON.stringify(messageHistory, null, 2));
        }
    }
});