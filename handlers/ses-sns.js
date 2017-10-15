'use strict';

const dynamo = require('../daos/update-item');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

module.exports.saveEmailStatus = (event, context, callback) => {

  console.log("event: ", event);

  let addressList = [];
  //TODO add for each for Records
  let message = JSON.parse(event.Records[0].Sns.Message);
  let notificationType = message.notificationType;
  let delivery = message.delivery;
  let mail = message.mail;
  let dest = mail.destination;

  if (dest !== null) {
    dest.forEach((addr) => {
      addressList.push(addr);
    });

		//TODO add binary  for status
    let status;
    if (message.notificationType === "Delivery") {
      status = "Delivered";
    } else if (message.mail.bounce) {
      if (message.mail.bounce.bounceSubtype === "General") {
        status = "No domain";
      } else {
        status = "Bad email address";
      }
    } else {
      status = "Complaint";
    }

    let messageId = message.mail.messageId;

		//TODO move to database models folder
    let params = {
      "Key": {
        "MessageId": {
          "S": messageId
        }
      },
      "ReturnValues": "NONE",
      "ExpressionAttributeNames": {
        "#AL": "Addresses",
        "#S": "Status"
      },
      "ExpressionAttributeValues": {
        ":al": {
          "SS": addressList
        },
        ":s": {
          "S": status
        }
      },
      "UpdateExpression": "SET #AL = :al, #S = :s",
      "TableName": "SentEmailStatus"
    };

    dynamo.updateItem(params).then((res) => {
      console.log("resForPost", res);
    });
  } else {
    console.log("Destination was null ");
  }
};
