/*
# Copyright 2020 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#            http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
*/
//https://cloud.google.com/storage/docs/json_api/v1/objects/get
"use strict";
const Dumper = require('dumper').dumper;
const https = require('https');
const bl = require('bl');

module.exports = class GoogleCloud {
  constructor(options) {
    if (!options['accessToken'])
      throw new Error("Missing AccessToken in GoogleCloud constructor.")

    if (!options['hostName'])
      throw new Error("Missing HostName in GoogleCloud constructor.")

    this.accessToken = options.accessToken
    this.hostName = options.hostName
  }


  async httpPost(path,postData,method="POST") {

    postData = JSON.stringify(postData);
    
    var options = {        
        hostname: this.hostName,
        port: 443,
        path: path, //path includes query string https://node.readthedocs.io/en/latest/api/https/#httpsgetoptions-callback
        method: method,
        headers:{
            Authorization:  "Bearer "+ this.accessToken,
            //'Content-Type': 'application/json',
            'Content-Length': postData.length
          }
    };
    //console.log("POST: "+path)
    //Dumper(options)

    return new Promise((resolve, reject) => {
        var req = https.request(
          options,
          response => {
              response.setEncoding('utf8');
              response.pipe(bl((err, data) => {
                  if (err) {
                      reject(err);
                  }
                  resolve(data.toString());
              }));
          })
          req.write(postData)
          req.end();
    });
  }

  async httpGet(path) {

    var options = {        
        hostname:  this.hostName,
        port: 443,
        path: path,//path includes query string https://node.readthedocs.io/en/latest/api/https/#httpsgetoptions-callback
        method: 'GET',
        headers:{
            Authorization:  "Bearer "+ this.accessToken
          }
    };
    //console.log("GET: "+path)
    //Dumper(options)

    return new Promise((resolve, reject) => {
        https.get(
          options,
          response => {
              response.setEncoding('utf8');
              response.pipe(bl((err, data) => {
                  if (err) {
                      reject(err);
                  }
                  resolve(data.toString());
              }));
          });
    });
  }
}