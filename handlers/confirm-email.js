'use strict';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
}
const osmose = require('osmose-email-engine');
const uuidv4 = require('uuid/v4');
const dynamo = require('../daos/update-item');

module.exports.sendConfirm = (event, context, callback) => {

  console.log("hi!", event);
  if(event.resource) {

    let confirmId = event.queryStringParameters.confirmId;

  } else {

    event.Records.forEach((record) => {

      console.log("record: ", record);

      let emailAddress = record.dynamodb.NewImage.Email.S;
      let first = record.dynamodb.NewImage.FirstName.S;
      let last = record.dynamodb.NewImage.LastName.S;
      let key = record.dynamodb.Keys.EmailBinary.B;
      let uuid = uuidv4();
      console.log("key: ", key);
      console.log("uuid: ", uuid);
      translateToPostParams(emailAddress, uuid).then((params) => {
        console.log('params: ', params);
        dynamo.updateItem(params);
      });
      let addresses = {
        ToAddresses: [emailAddress]
      };
      let email = {
        subject: 'You\'ve Been Signed Up For OSMoSE Mail!',
        body: '<html><body><h1>Welcome to OSMoSE Mail!</h1><h3>Hi ' + first + '!</h3><p>You\'ve been signed up for OSMoSE Mail!</p></body></html>'
      };
      let from = 'opensourcemarketingservice@gmail.com';
      console.log('osmose: ', osmose);
      //osmose.osmoseSendEmail(addresses, email, from);
    });
  }
}

//TODO move to models dir
function translateToPostParams(emailAddress, uuid) {
  return new Promise((resolve, reject) => {
    let params = {
      "Key": {
        "EmailBinary": {
          B: new Buffer(emailAddress.trim()).toString("base64")
        },
        "Email": {
          S: emailAddress.trim()
        }
      },
      "ReturnValues": "NONE",
      "ExpressionAttributeNames": {
        "#CU": "ConfirmUUID",
        "#C": "Confirmed"
      },
      "ExpressionAttributeValues": {
        ":cu": {
          "S": uuid
        },
        ":c": {
          "BOOL": false
        }
      },
      "UpdateExpression": "SET #CU = :cu, #C = :c",
      "TableName": "SubscriberList"
    };
    resolve(params);
  });
}
