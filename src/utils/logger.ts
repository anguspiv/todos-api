import { createConsola } from 'consola';

type LevelsMap = {
  [key: string]: number;
};

export const LEVELS: LevelsMap = {
  ERROR: 0,
  WARN: 1,
  LOG: 2,
  INFO: 3,
  DEBUG: 4,
  TRACE: 5,
  SILENT: -999,
  VERBOSE: 999,
};

const logLevel = (process.env.LOG_LEVEL || 'LOG').toUpperCase();

const getLogLevel = (level: string): number => LEVELS[level] || LEVELS.INFO;

const level = getLogLevel(logLevel);

export const logger = createConsola({
  level,
});

logger.debug('LOG_LEVEL:', { logLevel, level });
