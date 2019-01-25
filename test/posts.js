"Test: posts/create route"

const app = require("./../server");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const agent = chai.request.agent(app);

// Import the Post model from models folder so we can use it in tests
const Post = require('../models/post');
const User = require("../models/user");
const server = require('../server');

chai.should();
chai.use(chaiHttp);

describe('Posts', function() {

  const agent = chai.request.agent(server);

  // Post that we'll use for testing
  const newPost = {
    title: 'test post title',
    url: 'https://www.google.com',
    summary: 'test post summary',
  };

  // Dummy user
  const user = {
    username: 'poststest',
    password: 'testposts'
  };

  // Before hook. Sets up prereqs for testing, just as after hooks do cleanup after the fact
  before(function(done) {
    agent
      .post('/sign-up')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(user)
      .then(function(res) {
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('Should create with valid attributes at POST /posts/new', function(done) {
    // Checks how many posts there are now
    Post.estimatedDocumentCount()
      .then(function(initialDocCount) {
        chai
          .request(app)
          .post("/posts/new")
          // The following masquerades as form post b/c we won't actually fill one while testing
          .set("content-type", "application/x-www-form-urlencoded")
          // Make a request to create another
          .send(newPost)
          .then(function(res) {
            Post.estimatedDocumentCount()
              .then(function(newDocCount) {
                // Check that the database has one more post in it
                expect(res).to.have.status(200);
                // Check that the database has one more post in it
                expect(newDocCount).to.be.equal(initialDocCount + 1)
                done();
              })
              .catch(function(err) {
                done(err);
              });
          })
          .catch(function(err) {
            done(err);
          });
      })
      .catch(function(err) {
        done(err);
      });
  });

  // Deletes post after test run so we're not accumulating useless dummy posts. Also must delete dummy user for the same reason
  after(function(done) {
    Post.findOneAndDelete(newPost)
      .then(function(res) {
        agent.close()

        User.findOneAndDelete({
            username: user.username
          })
          .then(function(res) {
            done()
          })
          .catch(function(err) {
            done(err);
          });
      })
      .catch(function(err) {
        done(err);
      });
  });

});
