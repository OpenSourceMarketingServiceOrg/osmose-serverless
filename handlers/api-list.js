'use strict';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
}
const dynamo = require('../daos/update-item');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const dynamoDoc = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const uuidv4 = require('uuid/v4');

function deleteItemFromDynamoDB(params) {
    return new Promise((resolve, reject) => {
        dynamodb.deleteItem(params, (err, data) => {
            if (err) {
                console.log("ERROR: ", err);
                console.log("These params were rejected: ", params);
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
}

function getItemsFromDynamoDB() {
    return new Promise((resolve, reject) => {

        //TODO move to models dir
        let params = {
            TableName: "ClientList"
        };

        dynamodb.scan(params, (err, data) => {
            if (err) {
                console.log("ERROR: ", err);
                console.log("These params were rejected: ", params);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

//TODO move to models dir
function translateToPostParams(event, uuid) {
    return new Promise((resolve, reject) => {
        let body = JSON.parse(event.body);
        let emailBinary = new Buffer(body.email.trim()).toString("base64");
        let params = {
            "Key": {
                "EmailBinary": {
                    B: emailBinary
                },
                "Email": {
                    S: body.email.trim()
                }
            },
            "ReturnValues": "NONE",
            "ExpressionAttributeNames": {
                "#FN": "FirstName",
                "#LN": "LastName"
            },
            "ExpressionAttributeValues": {
                ":fn": {
                    "S": body.fname
                },
                ":ln": {
                    "S": body.lname
                }
            },
            "UpdateExpression": "SET #FN = :fn, #LN = :ln",
            "TableName": "ClientList"
        };
        if(uuid) {
            params.ExpressionAttributeNames['#CU'] = "ConfirmUUID";
            params.ExpressionAttributeNames['#CD'] = "Confirmed";
            params.ExpressionAttributeNames['#CS'] = "ConfirmedEmailSent";
            params.ExpressionAttributeValues[':cu'] = { "S": uuid };
            params.ExpressionAttributeValues[':cd'] = { "BOOL": false };
            params.ExpressionAttributeValues[':cs'] = { "BOOL": false };
            params.UpdateExpression = params.UpdateExpression + ', #CU = :cu, #CD = :cd, #CS = :cs';
        }
        resolve(params);
    });
}

//TODO move to models dir
function translateToDeleteParams(event) {
    return new Promise((resolve, reject) => {
        let emailBinary = new Buffer(event.queryStringParameters.emailToDelete).toString("base64")
        let params = {
            "Key": {
                "EmailBinary": {
                    B: emailBinary
                },
                "Email": {
                    S: event.queryStringParameters.emailToDelete
                }
            },
            "TableName": "ClientList"
        };
        resolve(params);
    });
}

function getUUID() {
    return new Promise((resolve, reject) => {
        let uuid = uuidv4();
        let params = {
            TableName: 'ClientList', /* required */
            IndexName: 'UUID',
            ExpressionAttributeValues: {
                ':cu':  uuid
            },
            KeyConditionExpression: 'ConfirmUUID = :cu'
          };
        dynamoDoc.query(params, (err, data) => {
            if (err) {
                console.log("ERROR: ", err);
                console.log("These params were rejected: ", params);
                reject(err);
            } else {
                if(data.Count === 0) {
                    resolve(uuid);
                } else {
                    console.log('uuid has been used');
                    getUUID().then((results) => {
                        resolve(results);
                    });
                }
            }
        });
    });
}

module.exports.emailList = (event, context, callback) => {

    let response;
    let items;
    let emails = [];
    //TODO Change to switch
    if (event.httpMethod === "GET") {
        getItemsFromDynamoDB().then((res) => {
            items = res.Items;
            let res0 = {
                "title": "Email List",
                "emailList": items,
                "event": event
            }
            response = {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify(res0)
            };
            callback(null, response);
        }).catch((err) => {
            console.error("ERROR: ", err);
            response = {
                statusCode: err.statusCode,
                headers: corsHeaders,
                body: err
            };
            callback(null, response);
        });
    } else if (event.httpMethod === "POST") {

        getUUID().then((uuid) => {
            translateToPostParams(event, uuid).then((params) => {
                dynamo.updateItem(params).then((res) => {
                    response = {
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify({
                            message: "POST IT!",
                            input: res
                        })
                    };
                    callback(null, response);
                }).catch((err) => {
                    console.error("ERROR: ", err);
                    response = {
                        statusCode: err.statusCode,
                        headers: corsHeaders,
                        body: JSON.stringify({
                            message: "ERROR IT!",
                            input: err
                        })
                    };
                    callback(null, response);
                });
            });
        });
    } else if (event.httpMethod === "PUT") {
        translateToPostParams(event).then((params) => {
            dynamo.updateItem(params).then((res) => {
                response = {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        message: "PUT IT!",
                        input: res
                    })
                };
                callback(null, response);
            }).catch((err) => {
                console.error("ERROR: ", err);
                response = {
                    statusCode: err.statusCode,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        message: "ERROR IT!",
                        input: err
                    })
                };
                callback(null, response);
            });
        });
    } else if (event.httpMethod === "DELETE") {
        translateToDeleteParams(event).then((params) => {
            deleteItemFromDynamoDB(params).then((res) => {
                response = {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        message: "DELETE IT!"
                    })
                };
                callback(null, response);
            }).catch((err) => {
                console.error("ERROR: ", err);
                response = {
                    statusCode: err.statusCode,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        message: "ERROR IT!",
                        input: err
                    })
                };
                callback(null, response);
            });
        });
    } else {
        response = {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                message: "I AIN'T IT!",
                input: event
            })
        };
        callback(null, response);
    }
};