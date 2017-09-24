'use strict';

let AWS = require('aws-sdk');
let dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

module.exports.emailList = (event, context, callback) => {

  console.log("event.httpMethod", event.httpMethod);
  let response;
  let items;
  let emails = [];
  //TODO Change to switch
  if (event.httpMethod === "GET") {
    getItemsFromDynamoDB().then((res) => {
      console.log("resForGet", res);
      items = res.Items;
      console.log("items", items);
      items.forEach((item) => {
        emails.push(item.Email.S);
      })
      console.log("emails", emails);
    });

    response = {
      statusCode: 200,
      body: JSON.stringify(emails)
    };
  } else if (event.httpMethod === "POST") {
    translateToPostParams(event).then((params)=>{
      response = {
        statusCode: 200,
        body: JSON.stringify({
          message: "POST IT!",
          input: params
        })
      };
      postToDynamoDB(params).then((res) => {
        console.log("resForPost", res);
      }).catch((err)=>{
        console.log("err: ", err.statusCode);
        response = {
          statusCode: 500,
          body: JSON.stringify({
            message: "ERROR IT!",
            input: err
          })
        };
      });
    });
  } else if (event.httpMethod === "PUT") {
    translateToPostParams(event).then((params)=>{
      postToDynamoDB(params).then((res) => {
        console.log("resForPut", res);
        response = {
          statusCode: 200,
          body: JSON.stringify({
            message: "PUT IT!",
            input: params
          })
        };
      }).catch((err)=>{
        console.log("err: ", err);
        response = {
          statusCode: err.statusCode,
          body: JSON.stringify({
            message: "ERROR IT!",
            input: err
          })
        };
      });

    });
  } else if (event.httpMethod === "DELETE") {
    deleteItemFromDynamoDB(translateToDeleteParams(event)).then((res) => {
      console.log("resForDelete", res);
    });

    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "DELETE IT!"
      })
    };
  } else {
    response = {
      statusCode: 400,
      body: JSON.stringify({
        message: "I AIN'T IT!",
        input: event
      })
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
  let params = {
    TableName: "EmailList",
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

//TODO move to models dir
function translateToPostParams(event) {
  return new Promise((resolve, reject) => {
    let body = JSON.parse(event.body);
    let emailBinary = new Buffer(body.email).toString("base64")
    let params = {
      "Key": {
        "EmailBinary": {
          S: emailBinary
        }
      },
      "ReturnValues": "NONE",
      "ExpressionAttributeNames": {
        "#FN": "FirstName",
        "#LN": "LastName",
        "#EM": "Email"
      },
      "ExpressionAttributeValues": {
        ":fn": {
          "S": body.firstName
        },
        ":ln": {
          "S": body.lastName
        },
        ":em": {
          "S": body.email
        }
      },
      "UpdateExpression": "SET #FN = :fn, #LN = :ln, #EM = :em",
      "TableName": "EmailList"
    };
    resolve(params);
  });
}

function translateToDeleteParams(event) {
  let emailBinary = new Buffer(event.queryStringParameters.email).toString("base64")
  return {
    "Key": {
      "EmailBinary": {
        B: emailBinary
      }
    },
    "TableName": "EmailList"
  };
}
