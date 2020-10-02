
const fs      = require('fs')
const mkdirp  = require('mkdirp')
const path    = require('path')
const mime    = require('mime')
const devNull = require('dev-null')
const shortid = require('shortid')
const pump    = require('pump')
const randomString = require('randomstring')

module.exports = function Filer({storageDir, filesURLprefix}) {

    // ensure target directory exists
    if (!fs.existsSync(storageDir)) throw new Error('storageDir doesn\'t exit.')
    
    function prepareFolder(folderName) {
        const pathname = path.join(storageDir, folderName)
        mkdirp.sync(pathname)
    }

    // Ensure upload directory exists
    prepareFolder('uploads')

    function urlOfFilePath(databaseName, pathName) {
        return filesURLprefix + '/' + databaseName + '/' + pathName
    }

    function pathOf(folder, rename) {
        let fullPath = path.join(storageDir, folder)
        if (rename !== undefined) {
            fullPath = path.join(fullPath, rename)
        }
        return fullPath
    }

    function exists(folder, rename) {
        let fullPath = path.join(storageDir, folder)
        if (rename !== undefined) {
            fullPath = path.join(fullPath, rename)
        }
        return fs.existsSync(fullPath)
    }

    function deleteFile(folderName, id) {
        const pathname = path.join(storageDir, folderName, id)
        return new Promise((resolve, reject) => {
            fs.unlink(pathname, (err) => resolve())
        })
    }

    function sizeOfFile(fullPath) {
        const stats = fs.statSync(fullPath)
        return stats.size
    }

    function newName(folder, mimetype) {
        const ext = mime.getExtension(mimetype)
        // if (ext === null) {
        //     ext = filename.split('.')[filename.split('.').length - 1]
        // }
        let rename
        do rename = randomString.generate({length: 32}) + '.' + ext
        while (fs.existsSync(pathOf(folder, rename)))
        return rename
    }

    async function itNow(stream, {folder, rename}) {
        const targetStream = writeStreamOf({folder, rename})
        return new Promise((resolve, reject) =>
            stream
                .on('error', error => {
                    // Delete the truncated file
                    if (stream.truncated && targetStream.path)
                        fs.unlinkSync(targetStream.path)
                    reject(error)
                })
                .pipe(targetStream)
                .on('finish', () => resolve(targetStream.path))
        )
    }

    function writeStreamOf({folder, rename}) {

        if (folder === null) return devNull()

        prepareFolder(folder)

        const fullPath = pathOf(folder, rename)

        return fs.createWriteStream(fullPath)
    }

    function move(fullPath, folderName, id) {

        prepareFolder(folderName)
        const newPath = path.join(pathOf(folderName), id)
        return new Promise((resolve, reject) => {
            fs.rename(fullPath, newPath, e => resolve(true))
        })

        // const destination = fs.createWriteStream(newPath)
        // return new Promise((resolve, reject) => {

        //     stream.pipe(destination)
    
        //     stream.on('end', () => {
        //         resolve()
        //     })
    
        //     destination.on('error', (err) => {
        //         reject(err)
        //     })
        // })
    }

    function getStorageDir() {
        return storageDir
    }

    return {
        urlOfFilePath,
        pathOf,
        exists,
        sizeOfFile,
        newName,
        itNow,
        move,
        getStorageDir,
    }
}
