var should = require('should');
var request = require('supertest');
var apicache = require('apicache');
var server = require('../../../app');
var db = require('../../../api/helpers/db')
var Client = require('../../../api/helpers/clients').Client

let MongoClient = require('mongodb').MongoClient

describe('controllers', function() {
  describe('clients', function() {
    let client1 = null
    beforeEach(function(done) {
      let clientObj = {
        name: "Mark Douglas Jamieson",
        address: "123 Fake St",
        postalCode: "A1A 1A1",
        phone: "222 555 8888",
        email: "markjamieson0@gmail.com",
        dob: "1980-01-01",
        accounts: [{
          type: 'savings',
          status: 'active'
        }]
      }
      db.insertClient(clientObj).then(client => {
        client1 = client
        done()
      })
    })
    afterEach(function(done) {
      Client.remove({}).then(() => {
        done()
      })
    })
    describe('GET /clients', function() {
      it('should return a list of 1 item', function(done) {
        request(server)
          .get('/clients')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            Client.find().then(function(clients){
              should(clients.length).eql(1)
              done()
            })
          });
      });
    });

    describe('POST /clients', function() {
      let clientObj = {
        name: "Mark 2",
        address: "234 Fake St",
        postalCode: "B1A 1A1",
        phone: "333 555 8888",
        email: "mark2@gmail.com",
        dob: "1980-01-01"
      }
      it('should add a record to clients collection', function(done) {
        request(server)
          .post('/clients')
          .send(clientObj)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(201)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql('');

            Client.find().then(function(clients){
              should(clients.length).eql(2)
              done()
            })
          });
      });
    });
    describe('GET /clients/{clientId}', function(){
      let resBody = null
      it('should retrieve a client record...', function(done) {
        request(server)
          .get(`/clients/${client1._id}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            resBody = res.body
            resBody.name.should.eql('Mark Douglas Jamieson')
            done()
          })
      })
      it('...that has a normalized phone number', function(done){
        resBody.phone.should.eql('+1 222-555-8888')
        done()
      })
      it('...and a normalized DOB', function(done){
        resBody.dob.should.eql('1980-01-01T00:00:00.000Z')
        done()
      })
    })
    describe('PUT /clients/{clientId}', function(){
      let update = {name: 'Ashley'}
      it('should update a client record', function(done) {
        request(server)
          .put(`/clients/${client1._id}`)
          .send(update)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.should.eql('');

            db.getClientById(client1._id).then(client => {
              should(client.name).eql('Ashley')
              done()
            })
          })
      })
    })
    describe('DELETE /clients/{clientId}', function(){
      it('should delete a client record', function(done) {
        request(server)
          .delete(`/clients/${client1._id}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.should.eql('');

            db.getClients().then(clients => {
              should(clients.length).eql(0)
              done()
            })
          })
      })
    })
    describe('GET /clients/find', function(){
      let goodURLs = [
        '/clients/find?phone=2225558888',
        '/clients/find?email=markjamieson0@gmail.com'
      ]
      let badURLs = [
        '/clients/find?phone=2225559999',
        '/clients/find?email=bademail@gmail.com',
        '/clients/find?account=5'
      ]
      goodURLs.forEach(url => {
        it('should return a single record for each good url', function(done) {
          request(server)
            .get(url)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              should(res.body._id).eql(client1._id.toString())
              done()
            })
        })
      })
      it('should return a single record for each good url', function(done) {
        // Need to construct the account URL inside this callback because account number
        // isn't available until beforeEach callback returns
        request(server)
          .get(`/clients/find?account=${client1.accounts[0].number}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            should(res.body._id).eql(client1._id.toString())
            done()
          })
      })
      badURLs.forEach(url => {
        it('should 404 for each bad url', function(done) {
          request(server)
            .get(url)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function(err, res) {
              done()
            })
        })
      })
    })
    describe('GET /clients/search', function(){
      it ('should perform text search by name', function(done){
        request(server)
          .get('/clients/search?name=Mark')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            should(res.body.length).eql(1)
            done()
          })
      })
      it ('should search by age range (with results)', function(done){
        request(server)
          .get('/clients/search?minAge=30&maxAge=40')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            should(res.body.length).eql(1)
            done()
          })
      })
      it ('should search by age range (without results)', function(done){
        request(server)
          .get('/clients/search?minAge=20&maxAge=30')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            should(res.body.length).eql(0)
            done()
          })
      })
    })
    describe('CACHING search', function(){
      before(function(done){
        apicache.clear()
        // The request to cache
        request(server)
          .get('/clients/search?name=Mark')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            done()
          })
      })
      it ('should not update cached search results ...', function(done){
        let clientObj = {
          name: "Mark Douglas Jamieson",
          address: "123 Fake St",
          postalCode: "A1A 1A1",
          phone: "222 555 9999",
          email: "markjamieson0+1@gmail.com",
          dob: "1990-01-01",
          accounts: [{
            type: 'savings',
            status: 'active'
          }]
        }
        db.insertClient(clientObj).then(client => {
          client1 = client
          request(server)
            .get('/clients/search?name=Mark')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              should.not.exist(err);
              should(res.body.length).eql(0)
              done()
            })
        })
      })
      it ('... until cache is cleared ...', function(done){
        request(server)
          .get('/clearcache')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            done()
          })
      })
      it ('... and the search results should be up to date', function(done){
        request(server)
          .get('/clients/search?name=Mark')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            should(res.body.length).eql(1)
            done()
          })
      })
    })
  });
});
