'use strict';

const corsHeaders = {
  'Access-Control-Allow-Origin' : '*', // Required for CORS support to work
  'Access-Control-Allow-Credentials' : true // Required for cookies, authorization headers with HTTPS
}
const dynamo = require('../daos/update-item');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

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
      TableName: "SubscriberList"
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
    console.log("body: ", body);
    let emailBinary = new Buffer(body.email).toString("base64");
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
<<<<<<< HEAD
      "UpdateExpression": "SET #FN = :fn, #LN = :ln, #EM = :em",
      "TableName": "SubscriberList"
=======
      "UpdateExpression": "SET #FN = :fn, #LN = :ln",
      "TableName": "ClientList"
>>>>>>> fcc611ea7f15d127a8f9785e62a0325628963d32
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
        },
        "Email": {
          S: event.queryStringParameters.email
        }
      },
      "TableName": "SubscriberList"
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
      console.log("items: ", items);
      let res0 = {
        "title" : "Email List",
        "emailList": items,
        "event" : event
      }
      response = {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(res0)
      };
      callback(null, response);
    }).catch((err)=> {
      console.log("ERROR: ", err);
      response = {
        statusCode: err.statusCode,
        headers: corsHeaders,
        body: err
      };
      callback(null, response);
    });
  } else if (event.httpMethod === "POST") {
    translateToPostParams(event).then((params)=>{
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
      }).catch((err)=>{
        console.log("ERROR: ", err);
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
  } else if (event.httpMethod === "PUT") {
    translateToPostParams(event).then((params)=>{
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
      }).catch((err)=>{
        console.log("ERROR: ", err);
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
        console.log("resForDelete: ", res);
        response = {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            message: "DELETE IT!"
          })
        };
        callback(null, response);
      }).catch((err) => {
        console.log("ERROR: ", err);
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
