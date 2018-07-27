module.exports.handler = (event, context, callback) => {
    console.log(`Lambda B, code v2: ${context.functionVersion}`);
    console.log(JSON.stringify(event));
    console.log(JSON.stringify(context));
    callback(null);
};
