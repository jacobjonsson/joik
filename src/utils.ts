/**
 * Will loop thru an object and remove all keys that equals key.
 * @param {Object} obj
 * @param {string} key
 */
export function removeKey(obj: any, key: string) {
    if (obj.hasOwnProperty(key)) {
        delete obj[key];
    } else if (obj instanceof Object) {
        for (const k in obj) removeKey(obj[k], key);
    }

    return obj;
}
