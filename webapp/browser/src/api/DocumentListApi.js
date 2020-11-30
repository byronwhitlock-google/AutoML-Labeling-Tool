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

import BaseApi from './BaseApi.js'

class DocumentListApi extends BaseApi {
  constructor(accessToken){
    super(accessToken)
  }
 
  async loadDocumentList () {
    try {
      return this.fetch("/list_documents")

    } catch (err) {
      if (err.message == "Not Found")
        throw new Error(`Bucket Not Found: ${this.config.bucketName}. ${err.message}`)
      else
        throw err
    }
  }
}
export default DocumentListApi