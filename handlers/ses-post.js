const corsHeaders = {
    'Access-Control-Allow-Origin' : '*', // Required for CORS support to work
    'Access-Control-Allow-Credentials' : true // Required for cookies, authorization headers with HTTPS
  }

module.exports.postEmail = (event, context, callback) => {
    console.log("Going to post a great email!");


}