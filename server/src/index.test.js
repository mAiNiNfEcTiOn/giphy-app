const originalRequest = require.requireActual('request-promise-native');
const request = require('request-promise-native');
const server = require('./index');
const mockData = require('../../shared/apiResponse.mock');

jest.mock('request-promise-native', () => jest.fn());

describe('API Server', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    /** Kills the server after the tests */
    server.close();
  });

  it('responds to a valid search with proper CORS headers, status code 200 and JSON from the provider', () => {
    request.mockReturnValue({ data: mockData });

    return originalRequest({
      uri: 'http://localhost:3001/search?q=kittens&limit=5&offset=0&rating=g&lang=en',
      resolveWithFullResponse: true,
    })
      .then((response) => {
        expect(request).toHaveBeenCalledTimes(1);
        expect(request).toHaveBeenCalledWith({
          uri: 'https://api.giphy.com/v1/gifs/search',
          qs: {
            lang: 'en',
            limit: 5,
            offset: 0,
            rating: 'g',
            q: 'kittens',
            api_key: process.env.API_KEY,
          },
          json: true,
        });


        expect(response.headers['access-control-allow-origin']).toBe(process.env.ALLOWED_DOMAIN);
        expect(response.headers['access-control-allow-headers']).toBe('Origin, X-Requested-With, Content-Type, Accept');
      });
  });

  it('returns 400 when not all parameters are present', () => {
    return originalRequest('http://localhost:3001/search?q=kittens&offset=0&rating=g&lang=en')
      .catch((err) => {
        expect(err.response.statusCode).toBe(400);
        expect(err.response.body).toBe(err.error);
      });
  });

  it('returns the message "Something went wrong!!" when in production mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    return originalRequest('http://localhost:3001/search?q=kittens&offset=0&rating=g&lang=en')
      .catch((err) => {
        expect(err.response.statusCode).toBe(400);
        expect(err.response.body).toBe('Something went wrong!!');
      }).then(() => {
        process.env.NODE_ENV = originalNodeEnv;
      });
  });
});

