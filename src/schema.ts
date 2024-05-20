import {
  arg,
  asNexusMethod,
  enumType,
  inputObjectType,
  makeSchema,
  objectType,
  nonNull,
  stringArg,
} from 'nexus';
import { DateTimeResolver } from 'graphql-scalars';
import { Context } from './context';

export const DateTime = asNexusMethod(DateTimeResolver, 'date');

const TodoCreateInput = inputObjectType({
  name: 'TodoCreateInput',
  definition(t) {
    t.nonNull.string('description', {
      description: 'Description for the Todo',
    });
  },
});

const TodoUpdateInput = inputObjectType({
  name: 'TodoUpdateInput',
  definition(t) {
    t.string('description', {
      description: 'Description for the Todo',
    });
    t.boolean('completed', {
      description: 'Completed status for the todo',
    });
  },
});

const SortOrder = enumType({
  name: 'SortOrder',
  members: ['asc', 'desc'],
  description: 'Direction to sort the Todos',
});

const OrderBy = enumType({
  name: 'OrderBy',
  members: ['createdAt', 'updatedAt'],
  description: 'Field to order the Todos by',
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
    t.nonNull.boolean('completed', { description: 'Completed status for the Todo' });
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
          orderBy: [
            {
              completed: 'asc',
            },
            ...orderBy,
          ],
        });
      },
    });

    t.nullable.field('todoById', {
      type: 'Todo',
      args: {
        id: stringArg({
          description: 'id of the Todo',
        }),
      },
      resolve: (_parent, args, context: Context) =>
        context.prisma.todo.findUnique({
          where: { id: args.id || undefined },
        }),
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

    t.field('updateTodo', {
      type: 'Todo',
      args: {
        id: nonNull(
          stringArg({
            description: 'id of the Todo to edit',
          }),
        ),
        data: nonNull(
          arg({
            type: 'TodoUpdateInput',
            description: 'Updated data for the Todo',
          }),
        ),
      },
      resolve: async (_, args, context: Context) => {
        try {
          const todo = await context.prisma.todo.update({
            where: { id: args.id || undefined },
            data: {
              completed: args.data?.completed || undefined,
              description: args.data?.description || undefined,
            },
          });

          return todo;
        } catch (err) {
          throw new Error(`Todo with ID ${args.id} does not exist in the database`);
        }
      },
    });

    t.field('deleteTodo', {
      type: 'Todo',
      args: {
        id: nonNull(
          stringArg({
            description: 'id of the todo to delete',
          }),
        ),
      },
      resolve: (_, args, context: Context) =>
        context.prisma.todo.delete({
          where: { id: args.id },
        }),
    });
  },
});

export const schema = makeSchema({
  types: [
    DateTime,
    OrderBy,
    SortOrder,
    TodoCreateInput,
    TodoOrderByInput,
    TodoUpdateInput,
    Todo,
    Query,
    Mutation,
  ],
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
