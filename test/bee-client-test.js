const chai = require('chai')
const spies = require('chai-spies')
const util = require('util')
const fs = require('fs')
const swarm = require('swarm-lowlevel')
const { toHex, hexToByteArray, byteArrayToHex, numbersToByteArray, stringToUint8Array } = require('./conversion')
const utf8 = require('utf8-encoder')
const base32Encode = require('base32-encode')
const base32Decode = require('base32-decode')
const base32Variant = 'Crockford'
const textEncoding = require('text-encoding')
var TextDecoder = textEncoding.TextDecoder
var TextEncoder = textEncoding.TextEncoder

const td = new TextDecoder("utf-8")
const te = new TextEncoder("utf-8")
//const encodeId = (buffer) => base32Encode(buffer, base32Variant)
// const decodeId = (id) => {
//     // console.log('decodeId', {id})
//     return new Uint8Array(base32Decode(id, base32Variant))
// }

var path = require('path');

const BeeClient = require('../src/bee-client');
const assert = require('chai').assert

const readFileAsync = util.promisify(fs.readFile)

chai.use(spies)
const expect = chai.expect

function delay(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), milliseconds)
    })
}

const wallet = new swarm.unsafeWallet();

let tempHash = ''

const userObject = {
    avatar: "data",
    username: "Boys Club Berlin",
    status: "accountCreated"
}

const rawTopic = te.encode("userdata");
const uint8 = new Uint8Array(32);
uint8.set(rawTopic, 0)
const topic = uint8

const data = te.encode(JSON.stringify(userObject))

const bee = new BeeClient("http://localhost:8080/chunks", null)

describe('BeeClient', () => {
    describe('Testing', () => {
        it('stores item', async () => {
            const bee = new BeeClient("http://localhost:8080/chunks", null)
            //const fileData = await readFileAsync('/home/michellerhyder/Documents/fds-bee-client/test/byeworld.txt')
            const hash = await bee.uploadData(data).then(hash => {
                tempHash = toHex(hash)
            })
        })
        it('retrieves item', async () => {
            const bee = new BeeClient("http://localhost:8080/chunks", null)
            const hash = await bee.downloadData(tempHash).then(file => {
                file = file
            })
            assert.equal(data, file, "Stored is not the same as retrieved")
        })
        it('creates a feed', async () => {
            const res = await bee.addFeed(wallet)
            const res2 = await bee.updateFeed(data, wallet)
        })
        it('reads a feed', async () => {
            const res = await bee.getFeed(wallet)
            const string = td.decode(res.chunk.data)
            assert.equal(string, JSON.stringify(userObject), 'userObject is not found')
        })
        it('creates a feed w topic', async () => {
            const res = await bee.addFeedWithTopic(topic, wallet)
            const res2 = await bee.updateFeedWithTopic(topic, data, wallet)

        })
        it('reads a feed w topic', async () => {
            const res = await bee.getFeedWithTopic(topic, wallet)
            var string = td.decode(res.chunk.data);
            assert.equal(string, JSON.stringify(userObject), 'userObject is not found')
        })
    })
})