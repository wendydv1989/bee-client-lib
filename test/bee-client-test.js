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

console.log()
describe('BeeClient', () => {
    describe('Testing', () => {
        it('stores item', async () => {
            const bee = new BeeClient("http://localhost:8500")
            console.log(bee)

            const fileData = await readFileAsync('/home/michellerhyder/Documents/fds-bee-client/test/byeworld.txt')
            console.log(fileData)
            let data = Buffer.from('foo');

            const hash = await bee.uploadData(data).then(hash => {
                console.log(toHex(hash))
            })
        })
    })
})