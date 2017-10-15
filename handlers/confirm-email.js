'use strict';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
}
const AWS = require('aws-sdk');
const osmose = require('osmose-email-engine');
let dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

module.exports.sendConfirm = (event, context, callback) => {

  console.log("hi!", event);
  console.log("dynamodb: ", event.Records[0].dynamodb);

  event.Records.forEach((record) => {

    let emailAddress = record.dynamodb.NewImage.Email.S;
    let first = record.dynamodb.NewImage.FirstName.S;
    let last = record.dynamodb.NewImage.LastName.S;
    let key = record.dynamodb.Keys.EmailBinary.B;
    let addresses = {
      ToAddresses: [emailAddress]
    };
    let email = {
      subject: 'You\'ve Been Signed Up For OSMoSE Mail!',
      body: '<html><body><h1>Welcome to OSMoSE Mail!</h1><h3>Hi ' + first + '!</h3><p>You\'ve been signed up for OSMoSE Mail!</p></body></html>'
    };
    let from = 'opensourcemarketingservice@gmail.com';
    console.log('osmose: ', osmose);
    osmose.osmoseSendEmail(addresses, email, from);
  });
}
