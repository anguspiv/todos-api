import {
  arg,
  asNexusMethod,
  enumType,
  inputObjectType,
  makeSchema,
  objectType,
  nonNull,
} from 'nexus';
import { DateTimeResolver } from 'graphql-scalars';
import { Context } from './context';

export const DateTime = asNexusMethod(DateTimeResolver, 'date');

const TodoCreateInput = inputObjectType({
  name: 'TodoCreateInput',
  definition(t) {
    t.nonNull.string('description');
  },
});

const SortOrder = enumType({
  name: 'SortOrder',
  members: ['asc', 'desc'],
});

const OrderBy = enumType({
  name: 'OrderBy',
  members: ['createdAt', 'updatedAt'],
});

const Todo = objectType({
  name: 'Todo',
  definition(t) {
    t.nonNull.string('id', {
      description: 'Unique Identifier for the Todo',
    });
    t.nonNull.field('createdAt', {
      type: 'DateTime',
      description: 'DateTime the todo was created',
    });
    t.nonNull.field('updatedAt', {
      type: 'DateTime',
      description: 'DateTime the todo was updated',
    });
    t.string('description', {
      description: 'The Todo description',
    });
    t.nonNull.boolean('completed', { description: 'Completed status' });
  },
});

const TodoOrderByInput = inputObjectType({
  name: 'TodoOrderByInput',
  definition(t) {
    t.field('orderBy', {
      type: 'OrderBy',
      description: 'Field to order the todos by',
    });
    t.field('sort', {
      type: 'SortOrder',
      description: 'Direction to order the todos by',
    });
  },
});

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('allTodos', {
      type: 'Todo',
      args: {
        orderBy: arg({
          type: 'OrderBy',
        }),
        sort: arg({
          type: 'SortOrder',
        }),
      },
      description: 'Query for all todos',
      resolve: (_parent, args, context: Context) => {
        const orderBy = [];

        if (args?.orderBy) {
          orderBy.push({
            [args?.orderBy as string]: args?.sort || 'asc',
          });
        }

        return context.prisma.todo.findMany({
          orderBy,
        });
      },
    });
  },
});

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.field('createTodo', {
      type: 'Todo',
      args: {
        data: nonNull(
          arg({
            type: 'TodoCreateInput',
          }),
        ),
      },
      resolve: (_, args, context: Context) =>
        context.prisma.todo.create({
          data: args.data,
        }),
    });
  },
});

export const schema = makeSchema({
  types: [DateTime, OrderBy, SortOrder, TodoCreateInput, TodoOrderByInput, Todo, Query, Mutation],
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
