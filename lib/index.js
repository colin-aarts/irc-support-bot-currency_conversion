// Generated by LiveScript 1.5.0
(function(){
  'use strict';
  var util, http, convert;
  util = require('util');
  http = require('http');
  module.exports = function(){
    var this$ = this;
    return this.register_special_command({
      name: '$',
      description: 'Perform currency conversion or retrieve exchange rate.',
      admin_only: false,
      fn: function(event, inputData, outputData){
        var apiKey, ref$, ref1$, message, argsMatch, from, to, amount;
        apiKey = (ref$ = this$.botOptions.pluginOptions) != null ? (ref1$ = ref$['irc-support-bot-currency_conversion']) != null ? ref1$.apiKey : void 8 : void 8;
        if (!apiKey) {
          return console.warn("API key for plug-in « irc-support-bot-currency_conversion » not found");
        }
        if (in$('?', inputData.flags)) {
          message = '$ <from> <to> [<amount>] • Perform currency conversion or retrieve exchange rate. If <amount> is not specified, shows exchange rate. <from> and <to> must be three-letter country codes.';
        } else if (!inputData.args) {
          message = "Insufficient arguments specified for currency conversion command; see " + inputData.trigger + "$/? for details";
        } else {
          argsMatch = inputData.args.match(/^(\w{3})\s+(\w{3})(\s+([\d\.,]+))?$/);
          if (!argsMatch) {
            message = "Invalid format specified for currency conversion command; see " + inputData.trigger + "$/? for details";
          } else {
            from = argsMatch[1].toUpperCase();
            to = argsMatch[2].toUpperCase();
            amount = argsMatch[4] ? argsMatch[4].replace(',', '.') : '';
            convert(from, to, amount, apiKey, function(err, result){
              var message;
              result = +result;
              if (err) {
                message = 'Oops, something went wrong!';
              }
              if (!amount) {
                message = "Current exchange rate " + from + " → " + to + " is " + result;
              } else {
                message = amount + " " + from + " is currently " + result + " " + to;
              }
              if (message) {
                return this$.send(outputData.method, outputData.recipient, message);
              }
            });
          }
          if (message) {
            this$.send(outputData.method, outputData.recipient, message);
          }
        }
        if (message) {
          return this$.send(outputData.method, outputData.recipient, message);
        }
      }
    });
  };
  convert = function(from, to, amount, apiKey, cb){
    var result, conf, resFn, req;
    result = [];
    conf = {
      hostname: 'www.exchangerate-api.com',
      path: "/" + from + "/" + to + "/" + amount + "?k=" + apiKey,
      method: 'get'
    };
    resFn = function(res){
      res.setEncoding('utf-8');
      res.on('data', function(data){
        return result.push(data);
      });
      return res.on('end', function(){
        var err;
        result = result.join('');
        if (!result) {
          err = true;
        }
        return cb(err, result);
      });
    };
    req = http.request(conf, resFn);
    req.on('error', function(err){
      return cb(err, null);
    });
    return req.end();
  };
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);
