'use strict';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
}
const osmose = require('osmose-email-engine');
const dynamo = require('../daos/update-item');
const AWS = require('aws-sdk');
const dynamoDoc = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const config = require('../config/osmose');

function sendConfirmEmailToUser(record) {

    let emailAddress = record.dynamodb.NewImage.Email.S.trim();
    let emailBinary = new Buffer(emailAddress).toString("base64");
    if(!record.dynamodb.NewImage.Confirmed.BOOL) {
        let email = {
            from: config.email.confirm.from,
            to: {
                BccAddresses: [],
                CccAddresses: [],
                ToAddresses: [emailAddress]
            },
            subject: config.email.confirm.subject,
            content: '<html><body><h1>Welcome to OSMoSE Mail!</h1><h3>Hi ' + record.dynamodb.NewImage.FirstName.S + '!</h3><p>You\'ve been signed up for OSMoSE Mail!</p><p>Please click this link to <a href="' + config.email.confirm.apiUrl + record.dynamodb.NewImage.ConfirmUUID.S + '">confirm</a>.</p></body></html>'
        };
        osmose.osmoseSendEmail(email);
        let params = {
            "Key": {
                "EmailBinary": {
                    B: emailBinary
                },
                "Email": {
                    S: emailAddress
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
            "TableName": config.database.recipientTable
        };
        dynamo.updateItem(params).then((res) => {
            //console.log('updateSuccess: ', res);
        }).catch((err) => {
            console.error("ERROR: ", err);
        });
    }
}

function confirmUserWithUuid(uuid) {
    return new Promise((resolve, reject) => {
        let params = {
            TableName: 'ClientList', /* required */
            IndexName: 'UUID',
            ExpressionAttributeValues: {
                ':cu':  uuid
            },
            KeyConditionExpression: 'ConfirmUUID = :cu'
        };
        dynamoDoc.query(params, (err, data) => {
            let response;
            if (err) {
                console.error("ERROR: ", err);
                console.error("These params were rejected: ", params);
                response = {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: 'Internal Server Error'
                };
                resolve(response);                       
            } else {
                if(data.Count > 0) {
                    data.Items.forEach((item) => {
                        let params = {
                            "Key": {
                                "EmailBinary": {
                                    B: item.EmailBinary
                                },
                                "Email": {
                                    S: item.Email
                                }
                            },
                            "ReturnValues": "NONE",
                            "ExpressionAttributeNames": {
                                "#CD": "Confirmed"
                            },
                            "ExpressionAttributeValues": {
                                ":cd": {
                                    "BOOL": true
                                }
                            },
                            "UpdateExpression": "SET #CD = :cd",
                            "TableName": config.database.recipientTable
                        };
                        dynamo.updateItem(params).then((res) => {
                            response = {
                                statusCode: 200,
                                headers: corsHeaders,
                                body: JSON.stringify({
                                    message: "CONFRIM IT!",
                                    input: res
                                })
                            };
                            resolve(response);
                        }).catch((err) => {
                            console.error("ERROR: ", err);
                        });                                 
                    });
                } else {
                    response = {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: 'Bad Request'
                    };                
                    resolve(response);
                }
            }
        });
    });
}

module.exports.sendConfirm = (event, context, callback) => {
    if (event.resource) {
        // this section is for the API
        let response;
        if (event.httpMethod === "GET") {
            if(event.queryStringParameters.confirmUuid) {
                confirmUserWithUuid(event.queryStringParameters.confirmUuid).then(res => {
                    response = res;
                    callback(null, response);
                });
            } else {
                response = {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: 'Bad Request'
                };                
                callback(null, response);
            }
        } else {
            response = {
                statusCode: 400,
                headers: corsHeaders,
                body: 'Bad Request'
            };
            callback(null, response);
        }
    } else {
        //this section is for the DynamoDBStreams event from the ClientList table
        event.Records.forEach((record) => {
            if(record.eventName === 'INSERT') {
                if(!record.dynamodb.NewImage.Confirmed.BOOL && !record.dynamodb.NewImage.ConfirmedEmailSent.BOOL) {
                    sendConfirmEmailToUser(record);
                }
            }         
        });
    }
}
