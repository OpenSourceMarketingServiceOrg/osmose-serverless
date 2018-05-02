# Welcome to Osmose!
## An Email Notification and Marketing Tool that runs in AWS's Permanent Free Tier

You read that right, this application runs for free (well, almost) in AWS's permanent free tier. An email tool that you can run in your existing AWS systems that compares to MailChimp, Exact Target, and Adobe Campaigns.

This project contains the Lambda functions and was built using the [Serverless Framework](https://serverless.com/). That and the [aws-cli](https://aws.amazon.com/cli/) are required for this project.

The other projects:
* [osmose-client](https://github.com/OpenSourceMarketingServiceOrg/osmose-client/tree/dev) - Vuejs application that manages the Receipent list, sends emails, and shows reports.
* [osmose-self-signup](https://github.com/OpenSourceMarketingServiceOrg/osmose-self-signup) - Vuejs components that allow the recipients to signup for emails, and edit their account.
* [osmose-email-engine](https://github.com/OpenSourceMarketingServiceOrg/osmose-email-engine) - A Javascript component that handles sending the S.E.S.

### Setup Steps

1. Creating 2 tables in [DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
  1. ```
      Table name: ClientList
      Primary partition key: SentEmailStatus (Binary)
      Primary sort key: Email (String) 
      Read Capacity Unit: 5
      Write Capacity Unit: 5
     ``` 
  2. ```
      Table name: SentEmailStatus
      Primary partition key: MessageId (String)
      Read Capacity Unit: 5
      Write Capacity Unit: 5  
     ```
2. Install [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
3. (Configure)[https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html] aws-cli with the region you created your DynamoDB tables in.
4. Install [Serverless](https://serverless.com/)
5. Run `npm install`
6. Configure serverless.yml and comment out the `saveEmailStatus` and `confirmEmail` function declaration and their declared properties. We'll readd these later afer we setup the SNS and DynamoDB Stream.
7. When you're ready to deploy your functions to AWS run `serverless deploy`. The cli will give you api routes. Add these to the [config file](https://github.com/OpenSourceMarketingServiceOrg/osmose-client/blob/dev/config/osmose.js) in osmose-client.
2. Configure [SES](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/getting-started.html) and add your email address to the `from` key in [config file](https://github.com/OpenSourceMarketingServiceOrg/osmose-serverless/blob/dev/config/osmose.js) in this project.
3. You should now be able to edit the Client List and send emails from the client!

### Dev Notes

* `/config` contains the configuration files
* `/daos` is a wrapper around a DynamoDB function (and needs to be renamed as such)
* `/events` contains json events to test and develop functions. Some of the events are up to date with the code and some aren't. Sorry, I guess? You can test them out with the npm commands named package.json
* `/handlers` contains the Lamda functions









#### Note saved for more documenation to be written in the future concerning email bounce tracking and recipient confirmation emails. These functions work, they just need to be documented.
Create a [Global Secondary Index](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.OnlineOps.html) in the ClientList table by clicking on the **Indexes** and then click the **Create index** button. Make the sort key for this index `UUID`

