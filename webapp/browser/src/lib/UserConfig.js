  class UserConfig {
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
export default UserConfig