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

const td = new textEncoding.TextDecoder("utf-8")
const te = new textEncoding.TextEncoder("utf-8")

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
let fileData = ''
const userObject = {
    avatar: "data",
    username: "Boys Club Berlin",
    status: "accountCreated"
}

const rawTopic = te.encode("userdata");
const uint8 = new Uint8Array(32);
uint8.set(rawTopic, 0)
const salt = uint8

const data = te.encode(JSON.stringify(userObject))

const bee = new BeeClient("http://localhost:8080/chunks", { timeout: 1000 })

describe('BeeClient', () => {
    describe('Testing the Lib <3', () => {
        it('stores item', async () => {
            fileData = await readFileAsync('/home/michellerhyder/Documents/fds-bee-client/test/byeworld.txt')
            const hash = await bee.uploadData(fileData).then(hash => {
                tempHash = toHex(hash)
            })
        })
        it('retrieves item', async () => {
            const newHash = tempHash.startsWith('0x') ? tempHash.slice(2) : tempHash
            const res = await bee.downloadData(newHash)
            const result = Buffer.from(res)
            assert.equal(result.toString(), fileData.toString(), "Stored is not the same as retrieved")
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
        it('creates a feed w salt', async () => {
            const res = await bee.addFeedWithSalt(salt, wallet)
            const res2 = await bee.updateFeedWithSalt(salt, data, wallet)
        })
        it('reads a feed w salt', async () => {
            const res = await bee.getFeedWithSalt(salt, wallet)
            var string = td.decode(res.chunk.data);
            assert.equal(string, JSON.stringify(userObject), 'userObject is not found')
        })
    })
})