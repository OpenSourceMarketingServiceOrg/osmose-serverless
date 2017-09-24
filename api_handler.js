'use strict';

module.exports.emailList = (event, context, callback) => {

  console.log("event.httpMethod", event.httpMethod);

  var response;

  if(event.httpMethod === "GET") {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "GET IT!",
        input: event,
      }),
    };
  } else if (event.httpMethod === "POST") {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "POST IT!",
        input: event,
      }),
    };
  } else if (event.httpMethod === "PUT") {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "PUT IT!",
        input: event,
      }),
    };
  } else if (event.httpMethod === "DELETE") {
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
