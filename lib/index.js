'use strict';

const Hoek = require('hoek');
const Pkg = require('./../package.json');
const _ = require('underscore');

const Auth = require('./auth');
const Http = require('./http');

const LogTag = Pkg.name;

/**
 * Default configuration options.
 */
const internals = {
    defaults: {
        config: {
            imApiUrl: 'https://im-stage.altex.ro/',
            enforce: true, // if settings are failing on the route configuration side, access is blocked if auth is enforced
            serviceHeaderName: 'x-service-name', // constant - might not be changed
            serviceHeaderKey: 'x-service-key', // constant - might not be changed
            humanHeaderName: 'x-user-token', // constant - might not be changed
            serviceName: null, // current service name (for service-to-service further communication)
            serviceKey: null, // current service key
            cacheName: 'redisCache', // hapi cache name
            cacheTTL: 120000
        }
    }
};

exports.plugin = {
    register: async (server, options) => {

        const settings = Hoek.applyToDefaults(internals.defaults.config, options);
        server.log([LogTag, 'info'], 'Registering  ' + LogTag);

        // expose cache service if any
        if (settings.cacheName) {
            server.expose(
                'imCacheService',
                server.cache({
                    cache: settings.cacheName,
                    expiresIn: settings.cacheTTL
                })
            );
        }

        const serviceAuthConfiguration = {};
        serviceAuthConfiguration[settings.serviceHeaderName] = settings.serviceName;
        serviceAuthConfiguration[settings.serviceHeaderKey] = settings.serviceKey;
        server.expose('serviceAuthConfiguration', serviceAuthConfiguration);

        // register auth scheme and strategy - im_auth
        server.auth.scheme('im-auth', Auth.schema);
        server.auth.strategy('im-auth', 'im-auth', settings);

        // expose wreck instance decorated with the auth headers
        server.method('imWreck', Http.wreckServiceAuth(serviceAuthConfiguration), {});
    },
    pkg: require('../package.json')
};

exports.pkg = Pkg;