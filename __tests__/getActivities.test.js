/* eslint-env jest */
/* eslint no-underscore-dangle: 0 */
const fs = require('fs');
const path = require('path');
const httpMocks = require('node-mocks-http');
const events = require('events');

const getActivities = require('../controllers/getActivities');

describe('getActivities', () => {
  // use path.join to get location of filename
  const filePath = path.join(__dirname, '../controllers', 'user.json');

  it('gets a list of the users activities', (done) => {
    expect.assertions(2);
    // adding in some activities to user object
    const user = {
      profile: {
        activities: [{
          activityId: 'short-walk',
          quantity: 1,
        }, {
          activityId: 'red-meat',
          quantity: 2,
        }],
      },
    };

    // convert file contents to JSON string
    fs.writeFile(filePath, JSON.stringify(user), () => {
      // mock a request object
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/profile/activities',
      });
      // mock a response object
      const response = httpMocks.createResponse({
        // event emitter to trigger an end event
        eventEmitter: events.EventEmitter,
      });
      // pass request/response objects into controller
      getActivities(request, response);

      // listen out for end event that listen for `on` event
      response.on('end', () => {
        expect(response.statusCode).toEqual(200);
        expect(response._getData()).toEqual(user.profile.activities);
        done();
      });
    });
  });
  it('gets a single user activity', (done) => {
    expect.assertions(2);
    const user = {
      profile: {
        activities: [{
          _id: 'abc123',
          activityId: 'short-walk',
          quantity: 1,
        }, {
          _id: 'def456',
          activityId: 'red-meat',
          quantity: 2,
        }],
      },
    };

    fs.writeFile(filePath, JSON.stringify(user), () => {
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/profile/activities/def456',
        params: { profileActivityId: 'def456' },
      });
      const response = httpMocks.createResponse({
        eventEmitter: events.EventEmitter,
      });
      getActivities(request, response);

      response.on('end', () => {
        expect(response.statusCode).toEqual(200);
        expect(response._getData()).toEqual(expect.objectContaining(user.profile.activities[1]));
        done();
      });
    });
  });
  // file reset to its initial state prior to test
  afterEach(() => {
    fs.writeFileSync(filePath, '{"profile" : {"activities":[]}}');
  });
});
