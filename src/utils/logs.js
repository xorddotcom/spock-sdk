import { logEnums } from '../constants';

export function log(debug, level, message) {
  if (debug && typeof console !== 'undefined') {
    // parse the arguments into a string if it is an object
    if (arguments[2] && typeof arguments[2] === 'object') {
      arguments[2] = JSON.stringify(arguments[2]);
    }

    // append level, message and args
    let extraArguments = '';
    for (var i = 3; i < arguments.length; i++) {
      extraArguments += ` ${arguments[i]}`;
    }

    const log = level + message + extraArguments;

    switch (level) {
      case logEnums.ERROR:
        console.error(log);
        break;
      case logEnums.WARNING:
        console.warn(log);
        break;
      case logEnums.INFO:
        console.info(log);
        break;
      case logEnums.VERBOSE:
        console.log(log);
        break;
      default:
        console.debug(log);
        break;
    }
  }
}
