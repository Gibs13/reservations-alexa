'use strict';

var AlexaAppServer = require( 'alexa-app-server' );

var server = new AlexaAppServer( {
	public_html: "./public",
	httpsEnabled: false,
	port: process.env.PORT || 80
} );

server.start();