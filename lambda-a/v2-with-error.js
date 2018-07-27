const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

module.exports.handler = async (event, context, callback) => {
    console.log(`Lambda A, code v2: ${context.functionVersion}`);
    console.log(JSON.stringify(event));
    console.log(JSON.stringify(context));

    // publish this lambda's version to an sqs queue
    const params = {
        MessageBody: `${context.functionVersion}`,
        QueueUrl: process.env.QUEUE_URL
    };

    await sqs.sendMessage(params).promise();

    callback(new Error());
};
