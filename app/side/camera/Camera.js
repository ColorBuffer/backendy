
const sharp = require('sharp')
const child_process = require('child_process')
const fs = require('fs')

module.exports = function Camera(config) {

    async function resizeImage(filePath, width, height) {

        // TODO buffer to stream
        const TMP_FILE_NAME = '/tmp/' + new Date + Math.random()

        await sharp(filePath)
            .resize(width, height)
            // .toBuffer()
            .toFile(TMP_FILE_NAME)

        return fs.createReadStream(TMP_FILE_NAME)
    }

    function getDimensionsOfImage(filePath) {

        return sharp(filePath)
            .metadata()
    }

    function createSVGPlaceHolder(filePath, numberOfPrimitives = 10) {
        return new Promise((resolve, reject) => {
            let forked = child_process.fork(config.sqipPath)
            forked.send({
                action: 'create',
                data: {filePath, numberOfPrimitives},
            })
            forked.on('message', (msg) => {
                if (msg.type === 'created') {
                    resolve(msg.result);
                    forked.kill();
                }
            })
        })
    }

    return {
        resizeImage,
        getDimensionsOfImage,
        createSVGPlaceHolder,
    }
}
