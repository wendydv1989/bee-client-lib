const chai = require('chai')
const spies = require('chai-spies')
const util = require('util')
const fs = require('fs')
const swarm = require('swarm-lowlevel')

var path = require('path');

const BeeClient = require('../src/bee-client');
const { assert } = require('console');

const readFileAsync = util.promisify(fs.readFile)

chai.use(spies)
const expect = chai.expect

function delay(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), milliseconds)
    })
}

const wallet = new swarm.unsafeWallet();

const toHex = byteArray => Array.from(byteArray, (byte) => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('')

let tempHash = ''

const userObject = {
    avatar: "",
    username: "Berlin Club Yay",
    status: "accountCreated"
}

const data = new Uint8Array([0x66, 0x6f, 0x6f]);


const file = "";

const bee = new BeeClient("http://localhost:8080/chunks", null)

const topic = new Uint8Array(32) // Say i want to do "userdata"


describe('BeeClient', () => {
    describe('Testing', () => {
        it('creates a feed', async () => {
             const res = await bee.addFeed(wallet)
             const res2 = await bee.updateFeed(data, wallet)
        })
        it('reads a feed', async () => {
            const res = await bee.getFeed(wallet)
            //console.log(res)
            //const res2 = await bee.updateFeed("Hello", wallet)
       })
       it('creates a feed w topic', async () => {
           console.log("set topic: ",topic)
        const res = await bee.addFeedWithTopic(topic, wallet)
        const res2 = await bee.updateFeedWithTopic(topic, data, wallet)
   })
   it('reads a feed w topic', async () => {
       const res = await bee.getFeedWithTopic(topic, wallet)
       console.log(res)
       //const res2 = await bee.updateFeed("Hello", wallet)
  })
        // it('stores item', async () => {
        //     const bee = new BeeClient("http://localhost:8080/chunks", null)
        //     //const fileData = await readFileAsync('/home/michellerhyder/Documents/fds-bee-client/test/byeworld.txt')
        //     const hash = await bee.uploadData(data).then(hash => {
        //         tempHash = toHex(hash)
        //     })
        // })
        // it('retrieves item', async () => {
        //     const bee = new BeeClient("http://localhost:8080/chunks", null)
        //     const hash = await bee.downloadData(tempHash).then(file => {
        //         file = file

        //     })
        //     assert(data, file, "Stored is not the same as retrieved")
        // })
        // it(' userobject', async () => {
        //     // Save the user object to SOC and upload it to bee
        //     const data = JSON.parse(userObject)
        //     const bee = new BeeClient("http://localhost:8080/chunks", null)
        //     //assert(data, file, "Stored is not the same as retrieved")
        // })
        // it('get latest userobject', async () => {
        //     // Retrieve the user object to SOC 
        //     const user = JSON.parse(result)
        //     //assert(data, file, "Stored is not the same as retrieved")
        // })

        
    })
})