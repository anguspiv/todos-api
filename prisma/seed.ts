import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();

const todosData: Prisma.TodoCreateInput[] = [
  {
    description: 'Example Todo',
  },
  {
    description: 'Example Completed Todo',
    completed: true,
  },
];

const createTodo = async (data: Prisma.TodoCreateInput) => {
  const todo = await prisma.todo.create({
    data,
  });

  logger.log(`Created todo with id: ${todo.id}`);
};

const main = async () => {
  logger.start('Start seeding...');

  logger.start('Seeding Todos...');
  await Promise.allSettled(todosData.map(createTodo));
  logger.success('Finished Todos');

  logger.success('Seeding Finished');
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    logger.error(err);

    await prisma.$disconnect();

    process.exit(1);
  });
