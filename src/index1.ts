import { RESTDataSource } from '@apollo/datasource-rest';
// KeyValueCache is the type of Apollo server's default cache

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

class MoviesAPI extends RESTDataSource {
  baseURL = 'https://movies-api.example.com/';

  constructor(options) {
    super(options); // this sends our server's `cache` through
    this.token = options.token;
  }

  willSendRequest(path, request) {
    request.headers.authorization = this.token;
  }

  async getMovie(id) {
    return this.get(`movies/${encodeURIComponent(id)}`);
  }

  async updateMovie(movie) {
    return this.patch(
      'movies',
      // Note the way we pass request bodies has also changed!
      { body: { id: movie.id, movie } },
    );
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => {
    const token = getTokenFromRequest(req);
    const { cache } = server;
    return {
      token,
      //highlight-start
      dataSources: {
        moviesAPI: new MoviesAPI({ cache, token }),
      },
      //highlight-end
    };
  },
});

console.log(`🚀  Server ready at ${url}`);