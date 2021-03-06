var expect = require('chai').expect;
var request = require('../util/request');
var store = require('../util/store');
var buildLogEntry = store.buildEntry;


describe('GET /logs?{start,limit}', function() {

  beforeEach(function (done) {
    store.save([
      buildLogEntry({ date: '2016-02-23T00:00:00.000Z' }),
      buildLogEntry({ date: '2016-02-22T00:00:00.000Z' }),
      buildLogEntry({ date: '2016-02-21T00:00:00.000Z', client_id: "anotherClientId" }),
      buildLogEntry({ date: '2016-02-20T00:00:00.000Z' }),
      buildLogEntry({ date: '2016-02-19T00:00:00.000Z' })
    ], done);
  });

  afterEach(function (done) {
    store.drop(done);
  });

  it('returns page with default limit when no "limit" is defined', function(done) {
    request.validGet('/logs?start=1')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 1, limit: 3, length: 3, total: 4 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ id: "2", date: '2016-02-22T00:00:00.000Z' }),
          buildLogEntry({ id: "4", date: '2016-02-20T00:00:00.000Z' }),
          buildLogEntry({ id: "5", date: '2016-02-19T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('returns page with first entry when no "start" is defined', function(done) {
    request.validGet('/logs?limit=1')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 1, length: 1, total: 4 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ id: "1", date: '2016-02-23T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('returns first page when neither "start" nor "limit" is defined', function(done) {
    request.validGet('/logs')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 3, total: 4 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ id: "1", date: '2016-02-23T00:00:00.000Z' }),
          buildLogEntry({ id: "2", date: '2016-02-22T00:00:00.000Z' }),
          buildLogEntry({ id: "4", date: '2016-02-20T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('returns empty page when there are not more results with that "start" position', function(done) {
    request.validGet('/logs?start=15')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 15, limit: 3, length: 0, total: 4 });
        expect(res.body).to.have.property('logs').and.be.empty;
        done(err);
      });
  });

  it('returns 400 if "start" has invalid format', function(done) {
    request.badGet('/logs?start=a')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.have.property('errors').and.deep.equal([
          { code: 'invalid.param.start', message: 'must be a number', value: 'a' }
        ]);
        done(err);
      });
  });

  it('returns 400 if "limit" has invalid format', function(done) {
    request.badGet('/logs?limit=b')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.have.property('errors').and.deep.equal([
          { code: 'invalid.param.limit', message: 'must be a number', value: 'b' }
        ]);
        done(err);
      });
  });

  it('returns 401 http error code when there is a problem with the JWT used', function(done) {
    request.unauthorizedGet('/logs?start=0&limit=1').end(done);
  });

});