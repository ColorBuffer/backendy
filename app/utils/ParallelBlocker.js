
module.exports = function ParallelBlocker() {

    let inProgress = {}

    return function call(key, fn) {
        return new Promise(async (resolve, reject) => {
            if (inProgress[key]) {
                inProgress[key].push({resolve, reject})
                return
            }

            // Set it as in progress validation.
            inProgress[key] = [
                {resolve, reject},
            ]

            try {
                const result = await fn()
                inProgress[key].map(({resolve, reject}) => resolve(result))
            }
            catch (e) {
                inProgress[key].map(({resolve, reject}) => reject(e))
            }
            finally {
                delete inProgress[key]
            }
        })
    }
}