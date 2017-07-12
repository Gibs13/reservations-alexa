'use strict';

let horaires = {};

var google = require('googleapis');
var googleAuth = require('google-auth-library');
var sheets = google.sheets('v4');

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2("801820678701-mg5qa1itum2uhave87mqpja89mo6j393.apps.googleusercontent.com", "HSXReMn_3Vs_FwpTA4QYVwAX", "urn:ietf:wg:oauth:2.0:oob");
oauth2Client.credentials = { access_token: 'ya29.Glt8BFZClGW4149SklLfluR6j2KAWo6y70HN_rLyYcn4t0fnbOllQIKsX12V7HeLnRAM-8rPIbfsYg-S2LGdZXzgub7dvmTCRgCmWMna5xWSqj6pvgM6dwcAdkSP',
        refresh_token: '1/34_2tUppw8e7pKXNoLVD6-4WXRppNR5O9hWc4GXs14A',
        token_type: 'Bearer',
        expiry_date: 1499077990040 };

function get(resto) {
    return new Promise(resolve => {
    sheets.spreadsheets.values.get({
        auth: oauth2Client,
        spreadsheetId: '1DnlKFhV0vNPJ-vQrixpocbcXRlHL5xKJxx5h7IF_qEc',
        range: "'" + resto + "'"
    }, function(err, response) {

        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        let rows = response.values;
        let row;
        let horaires = {};
        for (let i=0; i < rows.length; i++) {
            row = rows[i];
            row.push(i+1);
            horaires[row.shift()] = row;
        }
        console.log('horaires pretes');
        resolve(horaires);
    })});
}

Promise.resolve()
    .then(function () {
        return Promise.resolve(get('AKABE')).then((val) => {console.log(val['2017-08-22']);});
    })
    .then(function () {
        console.log("ended");
    });