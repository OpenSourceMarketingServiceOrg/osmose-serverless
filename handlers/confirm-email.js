module.exports.sendConfirm = (event, context, callback) => {
  console.log("hi!", event);
  console.log("dynamodb: ", event.Records[0].dynamodb);
}
