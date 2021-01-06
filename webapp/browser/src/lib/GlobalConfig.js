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

  constructor(configData){

    this.data = this.defaultData
    console.log("We constructing from config data")
    console.log(configData)
    
    if (configData && configData.hasOwnProperty("menuItems"))
      this.data = configData;

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

  getMenuItemByText(text)
  {
      for(var idx in this.data.menuItems)
      {
          if (this.data.menuItems[idx].text == text)
              return this.data.menuItems[idx];
      }
      return {text:text,color:'#A9A9A9'} // unkown labels are dark gray 
  }
  getMenuItems() {
      // TODO: Add automl API call for prediction here.
      return  this.data.menuItems;
  }

  getDefaultModelName()
  {
    //if (this.data.hasOwnProperty('defaultModelName')) {
     //console.log("got defgault model "+this.data.defaultModelName)
      return this.data.defaultModelName
    //}
    //else 
    //  return "";
  }


  defaultData = {
      defaultModelName: "",
      menuItems : [ // these will be dynamically replaced by values fetched in App::refreshConfig()
      /*{
        text:"Problem",
        color: "#F2D7D5"
        },
      {
        text:"Cause",        
        color: "#EBDEF0"
      },
      {
        text:"Remediation",        
        color: "#D4E6F1"
      }*/
    ] 
  }
}
export default GlobalConfig



