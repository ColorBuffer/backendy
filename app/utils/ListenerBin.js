
module.exports = ({oneResolve}) => {

    let listeners = {};

    return {
        register: function (key, fn, timeout) {
            listeners[key] = {
                fn,
                cleaner: setTimeout(e => {
                    delete listeners[key];
                }, timeout),
                timeout,
            };

        },
        resolve: function (key) {
            let listener = listeners[key];
            if (listener) {
                if (oneResolve) {
                    clearTimeout(listener.cleaner);
                    delete listeners[key];
                }
                else {
                    clearTimeout(listener.cleaner);
                    listener.cleaner = setTimeout(e => {
                        delete listeners[key];
                    }, listener.timeout);
                    listeners[key] = listener;
                }
                return listener.fn;
            }
            return () => null;
        },
    }
};