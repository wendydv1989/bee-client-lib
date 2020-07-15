const chai = require('chai')
const spies = require('chai-spies')
const util = require('util')
const fs = require('fs')

var path = require('path');

const BeeClient = require('../src/bee-client')

const readFileAsync = util.promisify(fs.readFile)

chai.use(spies)
const expect = chai.expect

function delay(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), milliseconds)
    })
}

const toHex = byteArray => Array.from(byteArray, (byte) => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('')

let tempHash = ''

console.log()
describe('BeeClient', () => {
    describe('Testing', () => {
        it('stores item', async () => {
            const bee = new BeeClient("http://localhost:8080/chunks", null)
            const data = new Uint8Array(4096 * 8 + 1)
            const hash = await bee.uploadData(data).then(hash => {
                tempHash = toHex(hash)
            })
        })
        it('retrieves item', async () => {
            const bee = new BeeClient("http://localhost:8080/chunks", null)
            const hash = await bee.downloadData(tempHash).then(file => {
                console.log(file)
            })
        })
    })
})