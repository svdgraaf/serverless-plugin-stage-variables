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

    // create a config for the stage
    var config = {
      StageName: this._serverless.service.provider.stage,
      StageDescription: {
        StageName: this._serverless.service.provider.stage,
        Variables: variables,
      }
    }

    // find the deployment resource, and add the stage variables
    Object.keys(template.Resources).forEach(function(key){
      if (template.Resources[key]['Type'] == 'AWS::ApiGateway::Deployment') {
        template.Resources[key] = _.merge(template.Resources[key], config);
      }
    })

    this._serverless.cli.log('Merged stage variables into ApiGateway Deployment');
  },
});
