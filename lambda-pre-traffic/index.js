const possiblePreTrafficHookStatuses = {
    SUCCEEDED: 'Succeeded',
    FAILED: 'Failed'
};

const aws = require('aws-sdk');
const lambda = new aws.Lambda({ apiVersion: '2015-03-31' });
const codedeploy = new aws.CodeDeploy({ apiVersion: '2014-10-06' });

module.exports.handler = async (event, context, callback) => {
    console.log(JSON.stringify(event));
    console.log(JSON.stringify(context));

    const deploymentId = event.DeploymentId;
    const lifecycleEventHookExecutionId = event.LifecycleEventHookExecutionId;

    // invoking lambda A
    const lambdaAInvokeParams = {
        FunctionName: process.env.FUNCTION_NAME,
        LogType: 'Tail',
        Payload: JSON.stringify({ text: 'Pre-Traffic hook here!'}),
        Qualifier: process.env.FUNCTION_VERSION
    };

    await lambda.invoke(lambdaAInvokeParams).promise();

    // sending response to CodeDeploy
    const params = {
        deploymentId,
        lifecycleEventHookExecutionId,
        status: possiblePreTrafficHookStatuses.SUCCEEDED
    };

    await codedeploy.putLifecycleEventHookExecutionStatus(params).promise();

    console.log('Validation test succeeded');
    callback(null, 'Validation test succeeded');
};
