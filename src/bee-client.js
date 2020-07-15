const fetch = require('node-fetch')
const swarm = require('swarm-lowlevel')
const join = require('./asyncJoiner')

function BeeClient(chunkDataEndpoint, options) {
    this.chunkDataEndpoint = chunkDataEndpoint
    this.fetch = fetch
    options = options || {};
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
    const hasher = new swarm.fileHasher(chunkCallback)
    const hash = hasher.Hash(data)
    for (const chunk of chunks) {
        const reference = toHex(chunk.reference)
        const data = Uint8Array.from([...chunk.span, ...chunk.data])
        //console.log('uploadData', { chunk })
        await this.uploadChunkData(data, reference)
    }
    return hash
}

BeeClient.prototype.uploadChunkData = async function (data, hash) {
    console.log(this.chunkDataEndpoint)
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
    // console.log('uploadChunk', response, response.headers)
    return hash
}

BeeClient.prototype.downloadChunkData = async function (hash) {
    const endpoint = `${this.chunkDataEndpoint}/${hash}`
    const response = await fetch(endpoint)
    if (!response.ok) {
        throw new Error(response.statusText)
    }
    // console.log('downloadChunk', response, response.headers)
    const bytes = await response.arrayBuffer()
    return bytes
}

BeeClient.prototype.downloadChunks = async function (hash) {
    const chunks = []
    const totalSize = await join(hash, this.downloadChunkData.bind(this), data => {
        console.log('outCallback', data)
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
    console.log(buffers)
}


module.exports = BeeClient