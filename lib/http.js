'use strict';

const Wreck = require('wreck');
const ObjectHash = require('object-hash');
const PluginName = require('./../package.json').name;

class HttpUtils {

    /**
     * Generate an unique req id based on items (i.e headers to be sent) ~ object hashing for cache
     * @param items
     * @returns {*}
     */
    static getReqId (items) {

        return ObjectHash(items);
    };

    static async getImUser (imApiUrl, headers, logger, cacheService) {

        const uri = '/api/v1/user';
        headers['content-type'] = 'application/json';
        const options = {
            baseUrl: imApiUrl,
            headers: headers,
            timeout: 5000
        };
        const object = {
            user: false,
            roles: false
        };
        const reqId = HttpUtils.getReqId(headers);

        if (cacheService !== null) {
            const cachedData = await HttpUtils.getFromCache(cacheService, reqId);
            if (cachedData) {
                return cachedData;
            }
        }

        try {
            const promise = Wreck.request('get', uri, options);
            const res = await promise;
            const body = await Wreck.read(res, {json: true});
            if (res.statusCode !== 200) {
                throw 'Error on IM request: ' + JSON.stringify(body);
            }
            object.user = {
                username: body.username,
                email: body.email,
                displayName: body.displayName
            };
            object.roles = body.roles;
            HttpUtils.saveCache(cacheService, reqId, object);
        }
        catch (err) {
            logger(
                [PluginName, 'error'],
                'Error on IM request: ' + err
            );
        }

        return object;
    };

    /**
     * Persist into cache.
     * @param instance
     * @param cacheId
     * @returns {Promise.<boolean>}
     */
    static async getFromCache (instance, cacheId) {

        if (instance === null) {
            return false;
        }
        return instance.get(cacheId);
    };

    /**
     * Save in cache.
     * @param instance
     * @param cacheId
     * @param data
     * @returns void
     */
    static saveCache (instance, cacheId, data) {

        if (instance !== null) {
            instance.set(cacheId, data);
        }
    };

    /**
     * Decorate an instance of wreck.
     * @param authHeaders
     */
    static wreckServiceAuth (authHeaders) {
        const decorated = Wreck.defaults({
            headers: authHeaders
        });

        return () => {
            return decorated
        };
    }
}

module.exports = HttpUtils;