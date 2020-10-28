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

class GlobalConfig {
    // This only changes per server installation!
  clientId =  '976239279537-uo7h85trcol8nl5shb0k9ai7iufbs2ta.apps.googleusercontent.com';

  constructor(){
    this.bucketName = localStorage.getItem("bucketName")|| ""
    this.projectId = localStorage.getItem("projectId") || ""
    this.locationId = localStorage.getItem("locationId")|| ""
    

    if (!this.locationId)  
      this.locationId = 'us-central1' // default location
  }
  
  persist() {
    localStorage.setItem("bucketName",this.bucketName)
    localStorage.setItem("projectId",this.projectId)
    localStorage.setItem("locationId",this.locationId)
  }

  menuItems = [
      {
        key: "problem",
        text:"Problem",
        confidence: 0, //Math.floor(Math.random()*1000)/10
        color: "#F2D7D5"
        },
      {
        key: "cause",
        text:"Cause",
        confidence: 0,//Math.floor(Math.random()*1000)/10
        color: "#EBDEF0"
      },
      {
        key: "remediation",
        text:"Remediation",
        confidence: 0,//Math.floor(Math.random()*1000)/10
        color: "#D4E6F1"
      }

    ]   
    
    getMenuItemByText(text)
    {
      for(var idx in this.menuItems)
      {
        if (this.menuItems[idx].text == text)
        return this.menuItems[idx];
      }
      return {text:'',color:''}
    }
    getMenuItems() {
      // TODO: Add automl API call for prediction here.
      return  this.menuItems;
    }
}
export default GlobalConfig



