var requestify = require('requestify');
var config = require('../../config');
var url = require('url');
var _ = require('lodash');
var queryParam = require('node-jquery-param');
var util = require('../util');
var token = '';
var getToken = function(callback) {
  callback = callback || _.noop;
  var tokenUrl = '/oauth/token?grant_type=client_credentials';
  var getTokenUrl = url.resolve(config.csquireApi.url, tokenUrl);
  requestify
  .request(getTokenUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' +
new Buffer(config.csquireApi.clientId + ':' +
config.csquireApi.clientSecret).toString('base64'),
    },
  })
  .then(function(res) {
    var at = 'access_token';
    token = res.getBody();
    token = token[at];
    global.token = token;
    callback();
  })
  .fail(function(res) {
    console.log('Error:', res.getBody());
    callback(res.getBody());
  });
};
getToken();
function refreshToken(callback) {
  getToken(callback);
}

module.exports = function(method) {
  this.method = method;
  var urlPath = url.resolve(config.csquireApi.url, method);
  var tat = this;
  var getHeader = function(session, cb) {
    var header = '';
    var accToken = 'access_token';
    var refrshToken = 'refresh_token';
    if (session && session.userToken && session.userToken[accToken]) {
      header = {
        usertoken: 'Bearer ' + session.userToken[accToken],
        apitoken: 'Bearer ' + token,
        refreshtoken: 'Bearer ' + session.userToken[refrshToken],
      };
      return cb(header);
    }
    header = {
      Authorization: 'Bearer ' + token,
    };
    cb(header);
  };
  this.get = function(id, options, session, callback) {
    if (typeof (session) === 'function') {
      callback = session;
      session = null;
    }
    getHeader(session, function(header) {
      var oprions = {
        method: 'GET',
        headers: header,
      };
      var getUrl = urlPath + '/' + id + '?' + util.querystring(options);
      console.time('GET:' + urlPath);
      requestify.request(getUrl, oprions)
      .then(function(res) {
        console.timeEnd('GET:' + urlPath);
        return callback(null, res.getBody());
      })
      .fail(function(err) {
        if (err.code === 401) {
          refreshToken(function(err) {
            if (err) {
              return callback(err);
            }
            tat.get(id, options, callback);
          });
        } else {
          err.status = err.code;
          err.header = err.getBody().message;
          callback(err);
        }
      });
    });

  };
  this.getAll = function(data, session, callback) {
    data = data || {};
    data.limit = data.limit || '*';
    if (typeof (session) === 'function') {
      callback = session;
      session = null;
    }
    getHeader(session, function(header) {
      var oprions = {
        method: 'GET',
        headers: header,
      };
      var url = urlPath + '?' + util.querystring(data);
      console.time('GETALL:' + urlPath);
      requestify
.request(url, oprions)
      .then(function(res) {
        console.timeEnd('GETALL:' + urlPath);
        return callback(null, res.getBody());
      })
      .fail(function(err) {
        if (err.code === 401) {
          refreshToken(function(err) {
            if (err) {
              return callback(err);
            }
            tat.getAll(data, callback);
          });
        } else {
          err.status = err.code;
          err.header = err.getBody().message;
          callback(err);
        }
      });
    });
  };
  this.getFirst = function(data, session, callback) {
    data.limit = 1;
    this.getAll(data, session, function(err, docs) {
      if (err) {
        return callback(err);
      }
      callback(null, docs.length?docs[0]:null);
    });
  };
  this.create = function(data, session, callback) {
    if (typeof (session) === 'function') {
      callback = session;
      session = null;
    }
    getHeader(session, function(header) {
      var oprions = {
        method: 'POST',
        body: data,
        headers: header,
      };
      oprions.headers['Content-Length'] =
Buffer.byteLength(JSON.stringify(data));
      console.time('CREATE:' + urlPath);
      requestify.request(urlPath, oprions)
      .then(function(res) {
        console.timeEnd('CREATE:' + urlPath);
        return callback(null, res.getBody());
      })
      .fail(function(err) {
        if (err.code === 401) {
          refreshToken(function(err) {
            if (err) {
              return callback(err);
            }
            tat.create(data, callback);
          });
        } else {
          err.status = err.code;
          err.header = err.getBody().message;
          callback(err);
        }
      });
    });
  };
  this.update = function(id, data, session, callback) {
    if (typeof (session) === 'function') {
      callback = session;
      session = null;
    }
    getHeader(session, function(header) {
      var oprions = {
        method: 'PUT',
        body: data,
        headers: header,
      };
      oprions.headers['Content-Length'] =
Buffer.byteLength(JSON.stringify(data));
      var putUrl = urlPath + '/' + id;
      console.time('UPDATE:' + urlPath);
      requestify.request(putUrl, oprions)
      .then(function(res) {
        console.timeEnd('UPDATE:' + urlPath);
        return callback(null, res.getBody());
      })
      .fail(function(err) {
        if (err.code === 401) {
          refreshToken(function(err) {
            if (err) {
              return callback(err);
            }
            tat.update(id, data, callback);
          });
        } else {
          err.status = err.code;
          err.header = err.getBody().message;
          callback(err);
        }
      });
    });
  };
  this.delete = function(id, session, callback) {
    if (typeof (session) === 'function') {
      callback = session;
      session = null;
    }
    getHeader(session, function(header) {
      var oprions = {
        method: 'DELETE',
        headers: header,
      };
      var deleteUrl = urlPath + '/' + id;
      console.time('DELETE:' + urlPath);
      requestify.request(deleteUrl, oprions)
      .then(function(res) {
        console.timeEnd('DELETE:' + urlPath);
        return callback(null, res.getBody());
      })
      .fail(function(err) {
        if (err.code === 401) {
          refreshToken(function(err) {
            if (err) {
              return callback(err);
            }
            tat.delete(id, callback);
          });
        } else {
          err.status = err.code;
          err.header = err.getBody().message;
          callback(err);
        }
      });
    });
  };
  this.getToken = function(callback) {
    var tat = this;
    setTimeout(function() {
      if (token) {
        return callback();
      }
      tat.getToken(callback);
    }, 1000);
  };
};