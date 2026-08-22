// Structured logging: one JSON object per line.
//
// "Structured" means a machine can read it. `console.log('user 4 logged in')`
// is fine for a human and useless for anything else. A JSON line can be
// searched, filtered and counted by any log tool without parsing English.

type Level = 'info' | 'warn' | 'error';

// Anything extra we want to attach to a line: a path, a duration, an id.
type Details = Record<string, unknown>;

function write(level: Level, message: string, details: Details): void {
  console.log(JSON.stringify({ time: new Date().toISOString(), level, message, ...details }));
}

export const logger = {
  info: (message: string, details: Details = {}) => write('info', message, details),
  warn: (message: string, details: Details = {}) => write('warn', message, details),
  error: (message: string, details: Details = {}) => write('error', message, details),
};
