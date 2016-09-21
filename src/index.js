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
    var template = this._serverless.service.provider.compiledCloudFormationTemplate;

    config = {
      StageName: 'Foobar',
      StageDescription: {
        StageName: 'Foobar',
        Variables: {
          "Foo": "Bar"
        }
      }
    }

    // find the deployment, and add the stage variables
    Object.keys(template.Resources).forEach(function(key){
      if (template.Resources[key]['Type'] == 'AWS::ApiGateway::Deployment') {
        template.Resources[key] = _.merge(template.Resources[key], config);
      }
    })

    console.log(template.Resources);
  },
});
