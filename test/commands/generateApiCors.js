'use strict';

var should = require('should');
var path = require('path');
var generateApi = require('../../lib/commands/generateApi/generateApi');
var generateSkeleton = require('../../lib/commands/generateApi/generateSkeleton.js')
var fs = require('fs');
var rimraf = require('rimraf');
var xml2js = require('xml2js');

describe('generateApi with CORS proxy', function() {
  var options = {
    source : path.join(__dirname, '/swagger_files/cors.yaml'),
    destination : path.join(__dirname, '../../api_bundles'),
    apiProxy :'petStoreCors'
  };
  var bundle = path.join(options.destination);
  // Remove generated bundles.
  rimraf.sync(bundle);

  describe('generate', function() {
    it('Correct swagger file should generate proxy', function(done) {
      var options = {
        source : path.join(__dirname, '/swagger_files/cors.yaml'),
        destination : path.join(__dirname, '../../api_bundles'),
        apiProxy :'petStoreCors'
      }
      generateApi.generateApi(options.apiProxy, options, function(err, reply) {
        should.equal(err, null);
        done();
      })
    });
  });

  describe('Add cors policy', function() {
    it('Cors policy should be generated', function(done) {
      var corsFilePath = path.join(options.destination, options.apiProxy + "/apiproxy/policies/add-cors.xml");
      var corsFile = fs.lstatSync(corsFilePath);
      should.equal(corsFile.isFile(), true);

      var corsFileData = fs.readFileSync(corsFilePath);
      var parser = new xml2js.Parser();
      parser.parseString(corsFileData, function (err, result) {
        result.should.have.property('AssignMessage');
        result.should.have.property('AssignMessage').property('Add');
        var headers = result.AssignMessage.Add[0].Headers[0];
        // Check Header name and value
        should.equal(headers.Header[0].$.name, 'Access-Control-Allow-Origin', 'Access-Control-Allow-Origin not found: ');
        should.equal(headers.Header[0]._, '*', 'Access-Control-Allow-Origin not correct');
        done();
      });
    });
    it('Proxy should contain add-cors policy', function(done) {
      var proxyFilePath = path.join(options.destination, options.apiProxy, '/apiproxy/', options.apiProxy + '.xml');
      var proxyFileData = fs.readFileSync(proxyFilePath);
      var parser = new xml2js.Parser();
      parser.parseString(proxyFileData, function (err, result) {
        result.should.have.property('APIProxy');
        result.should.have.property('APIProxy').property('Policies');
        done();
      });
    });

  });

  // describe('generateProxy', function() {
  //   it('....', function() {
  //
  //   });
  // });
  //
  // describe('generateProxyEndPoint', function() {
  //   it('....', function() {
  //
  //   });
  // });
  //
  // describe('generateTargetEndPoint', function() {
  //   it('....', function() {
  //
  //   });
  // });

});