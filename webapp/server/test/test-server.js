var expect  = require('chai').expect;
var request = require('request');

describe('Basic Server Functionality', function() {
    describe ('List Documents', function() {
        it('status', function(done){
            request('http://localhost:5000/list_documents', function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });
});