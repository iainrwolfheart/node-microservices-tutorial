var Express = require('express')
var session = require("express-session");

var Seneca = require('seneca')
var Web = require("seneca-web");
var seneca = Seneca();

var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;

var path = require("path");
var bodyparser = require('body-parser');


var senecaWebConfig = {
    context: Express(),
    adapter: require('seneca-web-adapter-express'),
    options: { parseBody: false, includeRequest: true, includeResponse: true}
}

// IRL IP would also be specified for each microservice
seneca.use(Web, senecaWebConfig)
.client({ port: '10201', pin: 'role:restaurant' })
.client({ port: '10202', pin: 'role:cart' })
.client({ port: '10203', pin: 'role:payment' })
.client({ port: '10204', pin: 'role:order' });


seneca.ready(() => {
    const app = seneca.export('web/context')();

    // Replaced bodyparser w/express as deprecated
    app.use(Express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded());

    app.set('views', path.join(__dirname, '../public/views'));
    app.set('view engine', 'pug');
});

const oktaSettings = {
    clientId: process.env.OKTA_CLIENTID,
    clientSecret: process.env.OKTA_CLIENTSECRET,
    url: process.env.OKTA_URL_BASE,
    appBaseUrl: process.env.OKTA_APP_BASE_URL
};

const oidc = new ExpressOIDC({
    issuer: oktaSettings.url + '/oauth2/default',
    client_id: oktaSettings.clientId,
    client_secret: oktaSettings.clientSecret,
    appBaseUrl: oktaSettings.appBaseUrl,
    scope: 'openid profile',
    routes: {
        login: {
            path: '/users/login'
        },
        callback: {
            path: 'authorization-code/callback',
            defaultRedirect: '/'
        }
    }
});

app.use(
    session({
        secret: "ladhnsfolnjaerovklnoisag093q4jgpijbfimdposjg5904mbgomcpasjdg'pomp;m",
        resave: true,
        saveUninitialized: false
    })
);

app.use(oidc.router);