'use strict';

let AWS = require('aws-sdk');
let dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

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
      TableName: "EmailList",
      ProjectionExpression: "Email"
    };

    dynamodb.scan(params, (err, data) => {
      if (err) {
        console.log("ERROR: ", err);
        console.log("These params were rejected: ", params);
        reject(err);
      } else {
        resolve(data);
      }
    })
  });
}

//TODO move to models dir
function translateToPostParams(event) {
  return new Promise((resolve, reject) => {
    let body = JSON.parse(event.body);
    let emailBinary = new Buffer(body.email).toString("base64")
    let params = {
      "Key": {
        "EmailBinary": {
          B: emailBinary
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
          "S": body.fname
        },
        ":ln": {
          "S": body.lname
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

//TODO move to models dir
function translateToDeleteParams(event) {
  return new Promise((resolve, reject) => {
    let emailBinary = new Buffer(event.queryStringParameters.email).toString("base64")
    let params = {
      "Key": {
        "EmailBinary": {
          B: emailBinary
        }
      },
      "TableName": "EmailList"
    };
    resolve(params);
  });
}

module.exports.emailList = (event, context, callback) => {

  console.log("event.httpMethod", event.httpMethod);
  let response;
  let items;
  let emails = [];
  //TODO Change to switch
  if (event.httpMethod === "GET") {
    getItemsFromDynamoDB().then((res) => {
      items = res.Items;
      items.forEach((item) => {
        emails.push(item.Email.S);
      });
      let res0 = {
        "title" : "Email List",
        "emailList": emails,
        "event" : event
      }
      response = {
        statusCode: 200,
        body: JSON.stringify(res0)
      };
      callback(null, response);
    }).catch((err)=> {
      console.log("ERROR: ", err);
      response = {
        statusCode: err.statusCode,
        body: err
      };
      callback(null, response);
    });
  } else if (event.httpMethod === "POST") {
    translateToPostParams(event).then((params)=>{
      postToDynamoDB(params).then((res) => {
        response = {
          statusCode: 200,
          body: JSON.stringify({
            message: "POST IT!",
            input: res
          })
        };
        callback(null, response);
      }).catch((err)=>{
        console.log("ERROR: ", err);
        response = {
          statusCode: err.statusCode,
          body: JSON.stringify({
            message: "ERROR IT!",
            input: err
          })
        };
        callback(null, response);
      });
    });
  } else if (event.httpMethod === "PUT") {
    translateToPostParams(event).then((params)=>{
      postToDynamoDB(params).then((res) => {
        response = {
          statusCode: 200,
          body: JSON.stringify({
            message: "PUT IT!",
            input: res
          })
        };
        callback(null, response);
      }).catch((err)=>{
        console.log("ERROR: ", err);
        response = {
          statusCode: err.statusCode,
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
        console.log("resForDelete: ", res);
        response = {
          statusCode: 200,
          body: JSON.stringify({
            message: "DELETE IT!"
          })
        };
        callback(null, response);
      }).catch((err) => {
        console.log("ERROR: ", err);
        response = {
          statusCode: err.statusCode,
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
      body: JSON.stringify({
        message: "I AIN'T IT!",
        input: event
      })
    };
    callback(null, response);
  }


};
