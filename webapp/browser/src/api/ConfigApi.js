import BaseApi from './BaseApi.js';

class ConfigApi extends BaseApi {
    constructor(accessToken) {
        super(accessToken);
        //this.loadConfig()        
    }

    async loadConfig() {
        try {
            console.log("Geting Config");
            var res = await this.fetch("/get_config");
            console.log(res);
            return res
        } catch (err) {
            if (err.message == "Not Found")
                throw new Error(`Bucket Not Found: ${this.config.bucketName}. ${err.message}`);

            else
                throw err;
        }
    }

    async saveConfig(config) {
        try {
            console.log("Geting Config");
            var res = await this.post("/save_config",config);
            console.log(res);
            return res
        } catch (err) {
            if (err.message == "Not Found")
                throw new Error(`Bucket Not Found: ${this.config.bucketName}. ${err.message}`);

            else
                throw err;
        }
    }
}

export default ConfigApi