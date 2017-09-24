'use strict';

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

module.exports.saveEmailStatus = (event, context, callback) => {

  var addressList = [];
  //TODO add for each for Records
  var message = JSON.parse(event.Records[0].Sns.Message);
  console.log("message1: ", message);
  var notificationType = message.notificationType;
  console.log("notificationType", notificationType);
  var delivery = message.delivery;
  console.log("delivery", delivery);
  var mail = message.mail;
  console.log("mail", mail);
  var dest = mail.destination;
  console.log("dest", dest);


  if (dest !== null) {
    dest.forEach((addr) => {
      addressList.push(addr);
    });

		//TODO add binary  for status
    var status;
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

    var messageId = message.mail.messageId;

		//TODO move to database models folder
    var params = {
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

    postToDynamoDB(params).then((res) => {
      console.log("resForPost", res);
    });
  } else {
    console.log("Destination was null ");
  }
};

//TODO move to database module
function postToDynamoDB(params) {
  return new Promise((resolve, reject) => {
    dynamodb.updateItem(params, (err, data) => {
      if (err) {
        console.log(err);
        console.log("These params were rejected: ", params);
        reject(err);
      } else {
        resolve(data);
      }
    })
  });
}
