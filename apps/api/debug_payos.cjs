const PayOS = require('@payos/node');
console.log('Type of PayOS:', typeof PayOS);
console.log('PayOS keys:', Object.keys(PayOS));
if (PayOS.default) {
    console.log('Type of PayOS.default:', typeof PayOS.default);
}
