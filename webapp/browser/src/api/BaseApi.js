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
import GlobalConfig from '../lib/GlobalConfig.js'

class BaseApi {
  constructor(accessToken){
    this.accessToken = accessToken 
    
    var config = new GlobalConfig();
    this.bucketName = config.bucketName 
    this.projectId = config.projectId 
    this.locationId = config.locationId     
  }
  
  async fetch (url) {    
    console.log("in BaseApi.get()")

    const options = {
      method: "GET",
      headers: { 
        'X-Bearer-Token': this.accessToken,
        'X-Project-Id': this.projectId,
        'X-Bucket-Name': this.bucketName,
        'X-Location-Id': this.locationId
      }
    }

    console.log(options)
    const response = await fetch(url, options);
    return this.handleResponse(response);  
  }

  async post (url,data) {
    const response = await fetch(url, {
          method: "POST",
          headers: { 
            'Content-Type': 'application/json' ,
            'X-Bearer-Token': this.accessToken,
            'X-Project-Id': this.projectId,
            'X-Bucket-Name': this.bucketName,
            'X-Location-Id': this.locationId
          },
          body: JSON.stringify(data)
        });
    return this.handleResponse(response);  
  }

  async handleResponse (response)
  {
    var res = ""
    try {
      res = await response.json();
    } catch (err){
      throw new Error(`Invalid JSON response from server. <Br>${response.status} ${response.statusText}`)
    }    

    if (response.status !== 200) 
      throw Error(res.message)     
    else if (res.hasOwnProperty('error'))
      throw new Error(res.error)
    else if (res.hasOwnProperty('data'))
      return res.data;
    else
      throw new Error("Unknown Error : "+JSON.stringify(res));
  }
}
export default BaseApi