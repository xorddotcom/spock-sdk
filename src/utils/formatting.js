import { isType, notUndefined } from '../utils/validators';

export function normalizeChainId(chainId) {
  if (isType(chainId, 'string')) {
    chainId = chainId.replace(/^Ox/, '0x');
    const parsedChainId = Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10);
    return parsedChainId;
  } else {
    return chainId;
  }
}

export function extractDomain(url) {
  if (notUndefined(url)) {
    const split = url.split('/');
    if (split.length >= 3) {
      return split[2];
    }
    return '';
  }
}

export class JSON_Formatter {
  /**
   * To execute main JSON functions
   * @callback jsonExecuter
   * @returns {void}
   */

  /**
   * Safely execute JSON functions by handling exceptions
   * @param {jsonExecuter} executer - execute main JSON functions
   */
  static safeExecute(executer) {
    try {
      return executer();
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Convert JSON object into string
   * @param {object} data - JSON object
   */
  static stringify(data) {
    return JSON_Formatter.safeExecute(() => JSON.stringify(data));
  }

  /**
   * Parse string into JSON object
   * @param {String} data - JSON object in string type
   */
  static parse(data) {
    return JSON_Formatter.safeExecute(() => JSON.parse(data));
  }
}
