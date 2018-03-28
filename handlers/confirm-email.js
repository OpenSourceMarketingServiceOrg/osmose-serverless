'use strict';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
}
const osmose = require('osmose-email-engine');
const uuidv4 = require('uuid/v4');
const dynamo = require('../daos/update-item');

function sendConfirmEmailToUser(record) {

    let first = record.dynamodb.NewImage.FirstName.S;
    let last = record.dynamodb.NewImage.LastName.S;
    let emailAddress = record.dynamodb.NewImage.Email.S;
    let confirmUUID = record.dynamodb.NewImage.ConfirmUUID.S;
    let confirmed = record.dynamodb.NewImage.Confirmed.BOOL;
    let emailBinary = new Buffer(emailAddress.trim()).toString("base64");
    if(!confirmed) {
        let email = {
            from: 'dezzNutz@osmose.tools',
            to: {
                BccAddresses: [],
                CccAddresses: [],
                ToAddresses: [emailAddress]
            },
            subject: 'You\'ve Been Signed Up For OSMoSE Mail!',
            content: '<html><body><h1>Welcome to OSMoSE Mail!</h1><h3>Hi ' + first + '!</h3><p>You\'ve been signed up for OSMoSE Mail!</p><p>Please click this link to <a href="https://zsazrlvshe.execute-api.us-east-1.amazonaws.com/dev1/confirm?' + confirmUUID + '">confirm</a>.</p></body></html>'
        };
        osmose.osmoseSendEmail(email);    
        let emailBinary = new Buffer(emailAddress.trim()).toString("base64");
        let params = {
            "Key": {
                "EmailBinary": {
                    B: emailBinary
                },
                "Email": {
                    S: emailAddress.trim()
                }
            },
            "ReturnValues": "NONE",
            "ExpressionAttributeNames": {
                "#CS": "ConfirmedEmailSent"
            },
            "ExpressionAttributeValues": {
                ":cs": {
                    "BOOL": true
                }
            },
            "UpdateExpression": "SET #CS = :cs",
            "TableName": "ClientList"
        };
        dynamo.updateItem(params).then((res) => {
            console.log('updateSuccess: ', res);
        }).catch((err) => {
            console.log("ERROR: ", err);
        });
    }
}

module.exports.sendConfirm = (event, context, callback) => {
    console.log("hi!", event);
    if (event.resource) {
        console.log('other');
    } else {
        console.log('records length: ', event.Records.length);
        event.Records.forEach((record) => {
            console.log("record: ", record);
            if(record.eventName === 'INSERT') {
                if(!record.dynamodb.NewImage.Confirmed.BOOL && !record.dynamodb.NewImage.ConfirmedEmailSent.BOOL) {
                    sendConfirmEmailToUser(record);
                } else {
                    console.log('email already sent or confirmed');
                }
            } else {
                console.log('record not insert: ', record.eventName);
                if(record.dynamodb.Keys) {
                    console.log('record.dynamodb.Keys.Email: ', record.dynamodb.Keys.Email);
                }
                
            }         
        });
    }
}
