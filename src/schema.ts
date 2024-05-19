import { makeSchema, asNexusMethod, objectType } from 'nexus';
import { DateTimeResolver } from 'graphql-scalars';
import { Context } from './context';

export const DateTime = asNexusMethod(DateTimeResolver, 'date');

const Todo = objectType({
  name: 'Todo',
  definition(t) {
    t.nonNull.string('id', {
      description: 'Unique Identifier for the Todo',
    });
    t.nonNull.field('createdAt', {
      type: 'DateTime',
      description: 'The Date and Time the todo was created',
    });
    t.nonNull.field('updatedAt', { type: 'DateTime' });
    t.string('description');
    t.nonNull.boolean('completed');
  },
});

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('allTodos', {
      type: 'Todo',
      resolve: (_parent, _args, context: Context) => context.prisma.todo.findMany(),
    });
  },
});

export const schema = makeSchema({
  types: [Todo, Query, DateTime],
  outputs: {
    schema: `${__dirname}/../schema.graphql`,
    typegen: `${__dirname}/generated/nexus.ts`,
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
});
