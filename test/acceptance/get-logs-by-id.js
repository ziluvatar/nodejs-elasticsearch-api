var expect = require('chai').expect;
var request = require('../util/request');
var store = require('../util/store');

describe('GET /logs/{id}', function() {

  beforeEach(function (done) {
    store.save([
      store.buildEntry(),
      store.buildEntry({ client_id: 'anotherId' })
    ], done);
  });

  afterEach(function (done) {
    store.drop(done);
  });

  it('returns a client entry when it exists', function(done) {
    request.validGet('/logs/1')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.eql(store.buildEntry({ id: "1" }));
        done(err);
      });
  });

  it('returns 404 when an entry which belongs to another client is requested', function(done) {
    request.notFoundGet('/logs/2').end(done);
  });

  it('returns 401 http error code when there is a problem with the JWT used', function(done) {
    request.unauthorizedGet('/logs/1').end(done);
  });

  it('returns 404 http error code when entry is not found', function(done) {
    request.notFoundGet('/logs/0').end(done);
  });

});
