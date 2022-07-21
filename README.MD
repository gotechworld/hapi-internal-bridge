# HAPI - Bridge Bundle

### Verify service permissions

You can decorate your route with your desired role and permission. The auth schema is named 'im-auth'.
You should simply add few members in the **options** object for a route, as it follows:
```
route: {
    options: {
        [...]
        auth: 'im-auth', // auth schema
        plugins: {
            'hapi-internal-bridge': {
                auth: {
                    role: 'ROLE_NS', // role name
                    permission: 'SEND' // permission name
                }
            }
        }
    }
}
```

### Sending signed requests

You should first make sure that your current  API (service) has configured correctly his credentials. (i.e serviceName and serviceKey)
This plugin exposes a wreck instance which will enforce the auth headers. This is done through server methods.
Server method name:
Doc: https://hapijs.com/api#-servermethods
Simply call it like this:
```
server.methods.imWreck
```

### Caching

Each auth request can and will be cached if configured - this way we decrease the number of internal HTTP calls to IM service. It's recommended to have a decent TTL ~ 10mins should be on the safe side of things.

### Configuration reference
```
{
    imApiUrl: 'https://im-stage.altex.ro/', // string - IM API base url
    enforce: true, // bool - if settings are failing on the route configuration side, access is blocked if auth is enforced
    serviceHeaderName: 'x-service-name', // constant - might not be changed
    serviceHeaderKey: 'x-service-key', // constant - might not be changed
    humanHeaderName: 'x-user-token', // constant - might not be changed
    serviceName: null, // string - current service name (for service-to-service further communication)
    serviceKey: null, // string - current service key
    cacheName: 'redisCache', // string - hapi cache name
    cacheTTL: 120000 // int - cache TTL
}
```