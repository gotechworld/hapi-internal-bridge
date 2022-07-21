'use strict';

const _ = require('underscore');

const PluginName = require('./../package.json').name;

class DataHandler {

    /**
     * Evaluate current headers and determine the context based on contextHeaders object.
     * @param headers
     * @param contextHeaders
     * @returns {boolean|string}
     */
    static extractContext (headers, contextHeaders) {

        let context = false;
        Object.keys(contextHeaders).forEach((authType) => {

            let checked = true;
            for (let i = 0; i < contextHeaders[authType].length; i++) {
                if (_.isUndefined(headers[contextHeaders[authType][i]])) {
                    checked = false;
                    break;
                }
            }
            if (checked) {
                context = authType;
            }
        });

        return context;
    };

    /**
     * Extract headers based on context.
     * @param headers
     * @param context
     * @param contextHeaders
     * @returns {{}}
     */
    static extractHeaders (headers, context, contextHeaders) {

        const authHeaders = {};
        contextHeaders[context].forEach((headerName) => {
            authHeaders[headerName] = headers[headerName];
        });
        return authHeaders;
    };

    /**
     * Check current route's settings if it's matching the hapi-internal-bridge config bag for securing an entry point.
     * @param route
     * @returns {boolean|object}
     */
    static extractRouteSecuritySettings (route) {

        if (_.isUndefined(route.settings.plugins[PluginName])) {
            return false;
        }

        const settings = route.settings.plugins[PluginName].auth;
        // validate headers
        if (_.isUndefined(settings.role) || _.isUndefined(settings.permission)) {
            return false;
        }
        return settings;
    };
}

module.exports = DataHandler;