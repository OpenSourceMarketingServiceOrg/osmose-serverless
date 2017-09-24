'use strict';

module.exports.emailList = (event, context, callback) => {

  console.log("event", event);
  console.log("context", context);
  console.log("callback", callback);


  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "Lambda and webpack playing nicely with the serverless framework",
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
