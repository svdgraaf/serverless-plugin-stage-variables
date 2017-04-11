'use strict';

const _ = require('lodash');
const Class = require('class.extend');

module.exports = Class.extend({

  init: function(serverless, opts) {
    this._serverless = serverless;
    this._opts = opts;

    this.hooks = {
      'before:deploy:deploy': this.addStageVariables.bind(this),
    };
  },

  addStageVariables: function() {
    const template = this._serverless.service.provider.compiledCloudFormationTemplate;

    // setup variables, if any are defined
    var variables = {};
    if (this._serverless.service.custom.stageVariables) {
      variables = this._serverless.service.custom.stageVariables;
    }

    // find the correct stage name
    var stage = this._serverless.service.provider.stage;
    if (this._serverless.variables.options.stage) {
      stage = this._serverless.variables.options.stage;
    }

    // override the deployment config, which can be ignored, see:
    // http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-deployment.html
    var deploymentConfig = {
      StageName: `${stage}na`,
    }

    // create a stage resource, which sets the stage and variables correctly
    var stageConfig = {
      Type: "AWS::ApiGateway::Stage",
      Properties: {
        StageName: stage,
        Description: stage,
        RestApiId: {"Ref": "ApiGatewayRestApi"},
        DeploymentId: null,
        Variables: variables,
      }
    }

    // find the deployment resource, and add the stage resource
    Object.keys(template.Resources).forEach(function(key){
      if (template.Resources[key]['Type'] == 'AWS::ApiGateway::Deployment') {
        delete template.Resources[key].Properties.StageName;

        // add stage config
        stageConfig.Properties.DeploymentId = {"Ref":key}
        template.Resources.ApiGatewayStage = stageConfig;
      }

      // we need to make all api keys dependend on the stage, not the deployment
      if (template.Resources[key]['Type'] == 'AWS::ApiGateway::ApiKey') {
        template.Resources[key]['DependsOn'] = 'ApiGatewayStage';
      }
    })


    this._serverless.cli.log('Merged stage variables into ApiGateway Deployment');
  },
});
