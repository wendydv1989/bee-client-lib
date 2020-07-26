const base32Encode = require ('base32-encode')
const base32Decode = require ('base32-decode')
const utf8 = require ('utf8-encoder')

const base32Variant = 'Crockford'

const encodeId = (buffer) => base32Encode(buffer, base32Variant)
const decodeId = (id) => {
    // console.log('decodeId', {id})
    return new Uint8Array(base32Decode(id, base32Variant))
}

const numbersToByteArray = (numbers, size) => {
    if (size == null) {
        return new Uint8Array(numbers)
    }
    if (numbers.length >= size) {
        return numbersToByteArray(numbers.slice(0, size))
    }
    const bytes = new Uint8Array(size)
    bytes.set(numbers, size - numbers.length)
    return bytes
}

const byteArrayToHex = (byteArray, withPrefix = true) => {
    const prefix = withPrefix ? '0x' : '';
    return prefix + Array.from(byteArray, (byte) => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
};

const byteArrayToNumbers = (bytes) => bytes.reduce((prev, curr) => [...prev, curr], [])
const hexPrefix = '0x'
const toHex = (byteArray, withPrefix = true) =>
    (withPrefix ? hexPrefix : '') + Array.from(byteArray, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('')

const hexToNumbers = (hex) => {
    const hexWithoutPrefix = hex.startsWith('0x') ? hex.slice(2) : hex
    const subStrings = []
    for (let i = 0; i < hexWithoutPrefix.length; i += 2) {
        subStrings.push(hexWithoutPrefix.substr(i, 2))
    }
    return subStrings.map(s => parseInt(s, 16))
}
const hexToByteArray = (hex, size) => numbersToByteArray(hexToNumbers(hex), size)
const stripHexPrefix = (hex) => hex.startsWith(hexPrefix) ? hex.slice(hexPrefix.length) : hex
const stringToUint8Array = (data) => utf8.fromString(data);

module.exports = {toHex, numbersToByteArray, stringToUint8Array, hexToByteArray, byteArrayToHex}