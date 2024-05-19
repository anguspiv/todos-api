import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { schema } from './schema';
import { Context, createContext } from './context';
import { logger } from './utils/logger';

const start = async () => {
  const server = new ApolloServer<Context>({ schema });

  const { url } = await startStandaloneServer(server, {
    context: createContext,
    listen: { port: 4000 },
  });

  logger.box(`🚀 Server Listening at: ${url}`);
};

start();
