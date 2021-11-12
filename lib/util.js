const konsole = {
  LOG_LEVEL: 'info',
  LOG_LEVELS: 
    { all: 0, debug: 1, log: 2, info: 3, warn: 4, error: 5, none: 6 },

  debug: function() { konsole.write('debug', arguments) },
  info: function() { konsole.write('info', arguments) },
  log: function() { konsole.write('log', arguments) },
  warn: function() { konsole.write('warn', arguments) },
  error: function() { konsole.write('error', arguments) },

  setLevel: function(level) { konsole.LOG_LEVEL = level},
  write: function(funcName, args) {
    const restrictedLevel = konsole.LOG_LEVELS[konsole.LOG_LEVEL];
    const requiredLevel = konsole.LOG_LEVELS[funcName];
    if (restrictedLevel <= requiredLevel) {
      console[funcName].apply(console, args);
      return true;
    }
  }
}

module.exports = { konsole };