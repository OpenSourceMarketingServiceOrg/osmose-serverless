const corsHeaders = {
    'Access-Control-Allow-Origin' : '*', // Required for CORS support to work
    'Access-Control-Allow-Credentials' : true // Required for cookies, authorization headers with HTTPS
  }

const osmose = require('osmose-email-engine');

module.exports.postEmail = (event, context, callback) => {
    console.log("Going to post a great email!");
    // console.log(event);
    console.log(event.body);
    event.body = JSON.parse(event.body);

    let addresses = {
        ToAddresses: event.body.to
      };
    let email = {
        subject: event.body.subject,
        body: event.body.content
    };
    let from = 'opensourcemarketingservice@gmail.com';

    console.log("<<<<<<<<<<<<<<<<<<  osmose  >>>>>>>>>>>>>>>>>>>");
    console.log(osmose);
    console.log("<<<<<<<<<<<<<<<<<<  addresses  >>>>>>>>>>>>>>>>>>>");
    console.log(addresses);
    console.log("<<<<<<<<<<<<<<<<<<  email  >>>>>>>>>>>>>>>>>>>");
    console.log(email);

    osmose.osmoseSendEmail(addresses, email, from);
}