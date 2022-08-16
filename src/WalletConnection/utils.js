const TXN_REJECT_ERROR_CODES = [4001, -32000, -32603];

export function txnRejected(error) {
  if (TXN_REJECT_ERROR_CODES.includes(error?.code) || error?.message?.match(/rejected|denied transaction/)) return true;
  else return false;
}
