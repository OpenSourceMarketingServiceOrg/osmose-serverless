if (!global._babelPolyfill) {
   require('babel-polyfill');
}

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

export const saveEmailStatus = (event, context, callback) => {

  const p = new Promise((resolve, reject) => {
    resolve("success");
  });

	var addressList = [];

	console.log("Message", event.Records[0].Sns.Message);

	event.Records[0].Sns.Message.mail.destination.forEach((addr) => {
		addressList.push(addr);
	})

	var status;
	if (event.Records[0].Sns.Message.mail.notificationType === "Delivery") {
		status = "Delivered";
	} else if (event.Records[0].Sns.Message.mail.bounce) {
		if (event.Records[0].Sns.Message.mail.bounce.bounceSubtype === "General") {
			status = "No domain";
		} else {
			status = "Bad email address";
		}
	} else {
		status = "Complaint";
	}

	var messageId = event.Records[0].Sns.Message.mail.messageId;

	var params = {
		"Key": {
			"MessageId": {
				S: messageId
			}
		},
		"ReturnValues":"NONE",
		"ExpressionAttributeNames": {
			"#AL": "Addresses",
			"#S":"Status"
		},
		"ExpressionAttributeValues": {
			":al": {
				"SS":addressList
			},
			":s": {
				"S":status
			}
		},
		"UpdateExpression": "SET #AL = :al, #S = :s",
  		"TableName": "SentEmailStatus"
	};

	postToDynamoDB(params).then((res) => {
		console.log("resForPost", res);
	})

  p.then(r=> {
    console.log("r: ", r);
  })

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
