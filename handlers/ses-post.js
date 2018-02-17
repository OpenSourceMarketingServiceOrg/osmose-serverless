const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
}

const osmose = require('osmose-email-engine');

module.exports.postEmail = (event, context, callback) => {

    console.log(event.body);
    event.body = JSON.parse(event.body);
    osmose.osmoseSendEmail(event.body);

    response = {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
            message: "EMAIL SENT!"
        })
    };
    callback(null, response);
}