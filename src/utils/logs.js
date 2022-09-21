import { LOG } from '../constants';
import { isType } from './validators';

/**
 *  Logging stuff, works only when debug mode is true
 * @param {boolean} debug - debug mode
 * @param {String} level - log level (error, warning, info, debug, verbose)
 * @param {string} message - any string message
 */
export function log(debug, level, message) {
  if (debug && typeof console !== 'undefined') {
    // parse the arguments into a string if it is an object
    if (arguments[2] && typeof arguments[2] === 'object') {
      arguments[2] = JSON.stringify(arguments[2]);
    }

    const extraArguments = arguments[3]
      ? isType(arguments[3], 'object')
        ? JSON.stringify(arguments[3])
        : arguments[3]
      : '';

    const log = level + message + ' ' + extraArguments;

    switch (level) {
      case LOG.ERROR:
        console.error(log);
        break;
      case LOG.WARNING:
        console.warn(log);
        break;
      case LOG.INFO:
        console.info(log);
        break;
      case LOG.VERBOSE:
        console.log(log);
        break;
      default:
        console.debug(log);
        break;
    }
  }
}
