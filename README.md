# serverless-plugin-stage-variables
Add stage variables for Serverless 1.x to ApiGateway, so you can use variables in your Lambda's


# Usage
```yaml

custom:
  stageVariables:
      bucket_name: ${self:custom.bucket_name}
      endpoint: { "Fn::GetAtt": "CloudFrontEndpoint.DomainName" }
      foo: bar

plugins:
   - serverless-plugin-stage-variables
```

And then in your lambda's, you can use:

```json
module.exports.foobar = (event, context, cb) => {
  // event.stageVariables.bucket_name
  // event.stageVariables.endpoint
  // event.stageVariables.bar
}
```
