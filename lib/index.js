'use strict';

const _ = require('lodash');
const Fs = require('fs');
const os = require('os');
const Sentry = require('@sentry/node');

const errorRequestListener = (request, h) => {

    const { response } = request;

    if (!response.isBoom) {
        return h.continue;
    }
    else if (_.get(response, 'output.statusCode', 200) === 500) {
        Sentry.configureScope((scope) => {
            scope.setLevel('error');
        });
        Sentry.captureException(response);
    }
    else if (_.get(response, 'output.statusCode', 200) === 400) {
        const tags = {
            serverName: os.hostname(),
            url: request.url.href,
            method: request.method
        };
        if (
            !_.isUndefined(response._object) &&
            ['post', 'put', 'patch'].includes(request.method)
        ) {
            tags.payload = JSON.stringify(response._object).slice(0, 1000)
        }

        Sentry.configureScope((scope) => {
            scope.setLevel('warning');
        });
        Sentry.captureEvent({
            message: JSON.stringify(response.output.payload),
            tags: tags
        });
    }

    return h.continue;
};

exports.register = (server, options) => {

    if (!_.isUndefined(options.dsn)) {
        
        const configuration = {
            dsn: options.dsn
        };

        console.log('##########');
        console.log(process.env.ENVIRONMENT);
        console.log('##########');
        if (!_.isUndefined(process.env.release)) {
            configuration.release = process.env.release;
        }
        else {
            //update the release configuration
            Fs.readFile(options.releaseFile, { encoding: 'utf-8' }, (err, data) => {
                if (!err) {
                    data = data.split('|info=');
                    if (!_.isUndefined(data[1])) {
                        configuration.release = data[1];
                    }
                } else {
                    configuration.release = 'unknown';
                }
            });
        }

        Sentry.init(configuration);
        for (const exposedFunction of ['captureEvent', 'captureMessage', 'captureException', 'configureScope']) {
            server.method(exposedFunction, Sentry[exposedFunction], {});
        }
    }

    server.ext('onPreResponse', errorRequestListener);
};

exports.pkg = require('../package'); 