// Byron Whitlock byronwhitlock@google.com 
"use strict";
var Validator = require('jsonschema').Validator;

module.exports = async ValidateSchema(doc,schema){
  const fs = require('fs');
  let schema_raw = await fs.readFile('../schema/'+schema+'.json');
  let schema_json = JSON.parse(schema_raw);


  var v = new Validator();
  result = v.validate(doc, schema_raw)
  if (result.errors)
    throw new Error(JSON.stringify(result.errors))

}