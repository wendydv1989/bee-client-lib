const fetch = require('node-fetch')
const swarm = require('swarm-lowlevel')
const join = require('./asyncJoiner')
const dfeeds = require('dfeeds')

function BeeClient(chunkDataEndpoint, options) {
    this.chunkDataEndpoint = chunkDataEndpoint
    this.fetch = fetch
    options = options || {}
    this.feeds = {}
}

const toHex = byteArray => Array.from(byteArray, (byte) => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('')

BeeClient.prototype.mergeUint8Arrays = (arrays) => {
    const size = arrays.reduce((prev, curr) => prev + curr.length, 0)
    const r = new Uint8Array(size)
    let offset = 0
    for (const arr of arrays) {
        r.set(arr, offset)
        offset += arr.length
    }
    return r
}

BeeClient.prototype.uploadData = async function (data) {
    const chunks = []
    const chunkCallback = (chunk) => chunks.push(chunk)
    const splitter = new swarm.fileSplitter(chunkCallback)
    const hash = splitter.split(data)
    for (const chunk of chunks) {
        const reference = toHex(chunk.reference)
        const data = Uint8Array.from([...chunk.span, ...chunk.data])
        await this.uploadChunkData(data, reference)
    }
    return hash
}

BeeClient.prototype.addFeed = async function (wallet, startIndex = 0) {
    const indexedSocIdGen = new dfeeds.indexed(wallet.address)
    if (startIndex >= 0) {
        indexedSocIdGen.skip(startIndex)
    }
    this.feeds[wallet.address] = indexedSocIdGen
}

BeeClient.prototype.updateFeed = async function (data, wallet) {
    const indexedSocIdGen = this.feeds[wallet.address]
    const nextId = indexedSocIdGen.next()
    const splitter = new swarm.fileSplitter(undefined, true)
    const chunk = splitter.split(data)
    const soc = new swarm.soc(nextId, chunk, wallet)
    soc.sign()
    const socAddress = soc.getAddress()
    const socData = soc.serializeData()
    const res = await this.uploadChunkData(socData, toHex(socAddress))
    return res
}

BeeClient.prototype.getFeed = async function (wallet) {
    const indexedSocIdGen = this.feeds[wallet.address]
    const thisId = indexedSocIdGen.current()
    const soc = new swarm.soc(thisId, undefined, wallet)
    const socAddress = soc.getAddress()
    const rawRes = await this.downloadChunkData(toHex(socAddress))
    const ch = { data: new Uint8Array(rawRes) }
    const res = new swarm.socFromSocChunk(ch)
    return res
}

BeeClient.prototype.addFeedWithTopic = async function (topic, wallet, startIndex = 0) {
    const indexedSaltedSocIdGen = new dfeeds.saltIndexed(wallet.address, topic)
    if (startIndex >= 0) {
        indexedSaltedSocIdGen.skip(startIndex)
    }
    this.feeds[topic] = indexedSaltedSocIdGen
}

BeeClient.prototype.updateFeedWithTopic = async function (topic, data, wallet) {
    const indexedSaltedSocIdGen = this.feeds[topic]
    const nextId = indexedSaltedSocIdGen.next()
    const splitter = new swarm.fileSplitter(undefined, true)
    const chunk = splitter.split(data)
    const soc = new swarm.soc(nextId, chunk, wallet)
    soc.sign()
    const socAddress = soc.getAddress()
    const socData = soc.serializeData()
    const res = await this.uploadChunkData(socData, toHex(socAddress))
    return res
}

BeeClient.prototype.getFeedWithTopic = async function (topic, wallet) {
    const indexedSaltedSocIdGen = this.feeds[topic]
    const thisId = indexedSaltedSocIdGen.current()
    const soc = new swarm.soc(thisId, undefined, wallet)
    const socAddress = soc.getAddress()
    const rawRes = await this.downloadChunkData(toHex(socAddress))
    const ch = { data: new Uint8Array(rawRes) }
    const res = new swarm.socFromSocChunk(ch)
    return res
}

BeeClient.prototype.uploadChunkData = async function (data, hash) {
    const options = {
        headers: {
            'Content-Type': 'binary/octet-stream',
        },
        method: 'POST',
        body: data,
    }
    const endpoint = `${this.chunkDataEndpoint}/${hash}`
    const response = await fetch(endpoint, options)
    if (!response.ok) {
        throw new Error('invalid response: ' + response.statusText)
    }
    return hash
}

BeeClient.prototype.downloadChunkData = async function (hash) {
    const endpoint = `${this.chunkDataEndpoint}/${hash}`
    const response = await fetch(endpoint)
    if (!response.ok) {
        throw new Error(response.statusText)
    }
    const bytes = await response.arrayBuffer()
    return bytes
}

BeeClient.prototype.downloadChunks = async function (hash) {
    const chunks = []
    const totalSize = await join(hash, this.downloadChunkData.bind(this), data => {
        chunks.push(data)
    })
    return chunks
}

BeeClient.prototype.downloadData = async function (hash) {
    const chunks = await this.downloadChunks(hash)
    const buffers = chunks.map(chunk => chunk.data)
    return this.mergeUint8Arrays(buffers)
}

BeeClient.prototype.testUploadAndDownload = async function () {
    const data = new Uint8Array(4096 * 8 + 1)
    const hash = await this.uploadData(data)
    const buffers = await this.downloadData(hash)
}

module.exports = BeeClient