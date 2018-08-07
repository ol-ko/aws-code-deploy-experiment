# Experimental stack

This is a tiny experimental stack with two lambda functions: `LambdaA` and `LambdaB` and an SQS queue `QueueBetweenAAndB`.

Lambda A publishes a message with its current version as a payload to an SQS Queue.
Lambda B is invoked by SQS Queue.

Both Lambdas log event and context to CloudWatch.

There are also two alarms - `LambdaALatestVersionErrorMetricGreaterThanZeroAlarm` and `LambdaBLatestVersionErrorMetricGreaterThanZeroAlarm` - one for each Lambda function.

These alarms are based on Lambda error metrics and will get triggered if the newest version of a corresponding Lambda function (the one that gets created for CodeDeploy gradual deployment) is invoked and results in an error.

Both `LambdaA` and `LambdaB` are deployed using `Linear10PercentEvery2Minutes` deployment preference.
The deployment of both funcitons is configured in such a way, that the aforementioned alarms will prevent deployment of corresponding Lambda functions and cause Cloudformation stack update rollback.

There is a third Lambda function in this project - `PreTrafficLambdaFunction`.
This function is specified as a `PreTraffic` hook for LambdaA DeploymentPreference.
It will be executed once, before CodeDeploy starts shifting traffic.

This function invokes LambdaA's version, that is currently being deployed. This is done to provoke an alarm during the experiment.

# Experiment

In the folder of each Lambda function there are two files with code, which are similar and only use different log messages.
This makes it easy to deploy one or the other "version" of Lambda function, by simply pointing to another handler in Cloudformation.
This is done to make the experiment easy.

Additionally for LambdaA, second verison contains code that would result in an error.
This can be used to test if the deployment rolls back automatically.

Steps:

1. Deploy stack as is using `./deploy.sh`. Don't forget to export AWS_PROFILE variable before doing so.
1. Observe the created resources. Note that DelaySeconds setting for a `QueueBetweenAAndB` has actually taken effect.
1. In a Cloudformation templayte change `Handler` values for both LambdaA and LambdaB to point to a different code file.
1. In a Cloudformation templayte change `DelaySeconds` value for `QueueBetweenAAndB` to provoke update of an SQS Queue resource.
1. Start the deployment of the modified stack using `./deploy.sh` again.
1. In a Management Console, under Events section, note that two CodeDeploy deployments are eventually started.
1. Deployment started for LambdaA should abort automatically soon after PreTraffic hook gets executed, due to corresponding Alarm being triggered.
1. Note that abortion of the deployment for LambdaA triggers abortion of LambdaB deployment and causes Cloudformation to initiate stack update rollback.
1. Note that after rollback, new `DelaySeconds` value specified for `QueueBetweenAAndB` is not applied - which indicates that Cloudformation does the rollback for the complete changeset.

