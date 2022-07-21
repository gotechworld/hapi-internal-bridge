'use strict';

const DataHandler = require('./dataHandler');
const Http = require('./http');
const Boom = require('boom');
const _ = require('underscore');

const PluginName = require('./../package.json').name;

let cacheInstance = null;

class Auth {

    /**
     * Auth schema logic definition.
     * @param server
     * @param options
     * @returns {{authenticate: (function(*, *))}}
     */
    static schema (server, options) {

        const contextHeaders = {
            'service': [options.serviceHeaderName, options.serviceHeaderKey],
            'human': [options.humanHeaderName]
        };

        if (cacheInstance === null && !_.isUndefined(server.plugins[PluginName].imCacheService)) {
            cacheInstance = server.plugins[PluginName].imCacheService;
        }

        return {
            authenticate: async (request, h) => {

                const context = DataHandler.extractContext(request.headers, contextHeaders);
                const settings = DataHandler.extractRouteSecuritySettings(request.route);

                if (!context || !settings) {
                    console.error(
                        [PluginName, 'error'],
                        'Invalid auth params for route: ' + JSON.stringify([request.route.method, request.route.path])
                    );
                    if (options.enforce) {
                        return Boom.unauthorized();
                    }
                }
                else {
                    const headers = DataHandler.extractHeaders(request.headers, context, contextHeaders);
                    const apiUser = await Http.getImUser(options.imApiUrl, headers, console.error, cacheInstance);

                    if (!apiUser.user) {
                        return Boom.unauthorized();
                    }

                    if (!Auth.isGranted(apiUser, settings)) {
                        return Boom.unauthorized();
                    }

                    return h.authenticated({credentials: {user: apiUser.user}});
                }
            }
        };
    };

    /**
     * Check if access is granted.
     * @param apiUser
     * @param routeConfig
     * @returns {boolean}
     */
    static isGranted (apiUser, routeConfig) {

        let granted = false;
        apiUser.roles.forEach((role) => {

            if (role.name === routeConfig.role) {
                role.permissions.forEach((permission) => {

                    if (permission.name === routeConfig.permission) {
                        granted = true;
                    }
                });
            }
        });

        return granted;
    };
}

module.exports = Auth;