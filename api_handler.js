'use strict';

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports.emailList = (event, context, callback) => {

  console.log("event.httpMethod", event.httpMethod);
  var response;
  var items;
  if(event.httpMethod === "GET") {
    getItemsFromDynamoDB().then((res) => {
      console.log("resForGet", res);
      items = res.Items;
    })
    
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "GET IT!",
        input: items
      }),
    };
  } else if (event.httpMethod === "POST") {
      postToDynamoDB(translateToPostParams(event)).then((res) => {
        console.log("resForPost", res);
      });

    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "POST IT!",
        input: event,
      }),
    };
  } else if (event.httpMethod === "PUT") {
    postToDynamoDB(translateToPostParams(event)).then((res) => {
        console.log("resForPut", res);
      });
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "PUT IT!",
        input: event,
      }),
    };
  } else if (event.httpMethod === "DELETE") {
    deleteItemFromDynamoDB(translateToDeleteParams(event)).then((res) => {
      console.log("resForDelete", res);
       });
    
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "DELETE IT!",
        input: event,
      }),
    };
  } else {
    response = {
      statusCode: 400,
      body: JSON.stringify({
        message: "I AIN'T IT!",
        input: event,
      }),
    };
  }

  callback(null, response);
};

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
  })
}

function deleteItemFromDynamoDB(params) {
    return new Promise((resolve, reject) => {
  
    dynamodb.deleteItem(params, (err, data) => {
      if (err) {
        console.log(err);
        console.log("These params were rejected: ", params);
        reject(err);
      } else {
        resolve(data);
      }
    })
  })
}

function getItemsFromDynamoDB() {
 var params = {
        TableName:"EmailList",
        ProjectionExpression: "Email"
     }; 

   return new Promise((resolve, reject) => {
  
    dynamodb.scan(params, (err, data) => {
      if (err) {
        console.log(err);
        console.log("These params were rejected: ", params);
        reject(err);
      } else {
        resolve(data);
      }
    })
  })
}

function translateToPostParams(event) {
  var body = JSON.parse(event.body);
  var emailBinary = new Buffer(body.email).toString("base64")
  return {
    "Key": {
      "EmailBinary": {
        B: emailBinary
      }
    },
    "ReturnValues":"NONE",
    "ExpressionAttributeNames": {
      "#FN": "FirstName",
      "#LN": "LastName",
      "#EM": "Email"
    },
    "ExpressionAttributeValues": {
      ":fn": {
        "S":body.firstName
      },
      ":ln": {
        "S":body.lastName
      },
      ":em": {
        "S":body.email
      }
    },
    "UpdateExpression": "SET #FN = :fn, #LN = :ln, #EM = :em",
      "TableName": "EmailList"
    };
}

function translateToDeleteParams(event) {
  var emailBinary = new Buffer(event.queryStringParameters.email).toString("base64")
  return {
    "Key": {
      "EmailBinary": {
        B: emailBinary
      }
    },
    "TableName": "EmailList"
    };
}
