
module.exports = function TimeStorage(expireTime) {

    const map = new Map();
    const extendable = true;

    function note(key, value) {
        let already = map.get(key);
        if (already && already.date > +(new Date()) - expireTime) {
            if (extendable) {
                already.date = +(new Date());
            }
            return already.value;
        }
        map.delete(key);
        map.set(key, {
            date: +(new Date()),
            value,
        });
        return value;
    }

    function read(key) {
        let already = map.get(key);
        if (!already || already.date < +(new Date()) - expireTime) {
            return null;
        }
        return already.value;
    }

    function remove(key) {
        map.delete(key);
    }

    function timeToExpire(key) {
        let already = map.get(key);
        if (!already) {
            return 0;
        }
        return Math.max(expireTime - (+(new Date()) - already.date), 0);
    }

    return {
        note,
        read,
        remove,
        timeToExpire,
    }
};
