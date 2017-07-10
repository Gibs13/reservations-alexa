'use strict';

var alexa = require( 'alexa-app' );
var app = new alexa.app( 'reservations' );


let horaires = {};

var google = require('googleapis');
var googleAuth = require('google-auth-library');
var sheets = google.sheets('v4');
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
let descriptions = require('./descriptions.js');
let today;


var auth = new googleAuth();
var oauth2Client = new auth.OAuth2("801820678701-mg5qa1itum2uhave87mqpja89mo6j393.apps.googleusercontent.com", "HSXReMn_3Vs_FwpTA4QYVwAX", "urn:ietf:wg:oauth:2.0:oob");
oauth2Client.credentials = { access_token: 'ya29.Glt8BFZClGW4149SklLfluR6j2KAWo6y70HN_rLyYcn4t0fnbOllQIKsX12V7HeLnRAM-8rPIbfsYg-S2LGdZXzgub7dvmTCRgCmWMna5xWSqj6pvgM6dwcAdkSP',
        refresh_token: '1/34_2tUppw8e7pKXNoLVD6-4WXRppNR5O9hWc4GXs14A',
        token_type: 'Bearer',
        expiry_date: 1499077990040 };

const WELCOME_STATE = 'welcome';
const RESERVE_STATE = 'reserve';
const CHOOSE_STATE = 'choose';
const CONFIRM_STATE = 'confirm';
const YES_NO_STATE = 'yes_no';
const GIVE_NAME_STATE = 'give_name';
const CHANGE_STATE= "change";

const PROPOSITION = ["My suggestion is ","I may suggest you ","A possible choice would be ","I allowed myself to choose ","Maybe "];
const MISUNDERSTAND = ["Sorry, I didn't understand. ","What did you just said ? ","I didn't heared well. "];
const AGREE = ["Do you agree ? ","Is it ok for you ? ","Is it alright ? "];
const FINISH = ["May I place an order ? ","Is everything right ? ","May I proceed ? "];
const READY = ["A table is available ","There's still place ","It's possible to reserve "];
const SUCCESS = ["Your reservation was completed under the name of ","Everything went well. The table was ordered with the name ","The order was made under the name : "];
const WELCOME = ["Welcome ! You can book a restaurant's table in Strasbourg. ","Hello ! I'm able to get a reservation for a restaurant in Strasbourg. ","Howdy ! Do you want a reservation in a Strasbourg's restaurant ? "];
const BYE = ["Alright then, come back soon ! ","Well, goodbye. See you soon.","You're leaving yet ? Until next time !"];
const CHANGE = ["What should I change ? ","Tell me what has to be modified. ","What has to be replaced ? "];
const NOROOM = ["There is no room ","They haven't got any seats ","It's not possible to order "];

const IMAGE = 'https://reservation01.herokuapp.com/images/'


// Function Handler


    // Pour selectionner un element d'une liste
    function R(array) {
        return array[Math.floor(Math.random() * (array.length))];
    }

    // Pour interagir avec le google sheet 


        /*var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
        });

        console.log('Visit the url: ', authUrl);*/

/*      oauth2Client.getToken('4/2JSXXHjr1P8FxrImwNgH7Gi4T9R-CqCbL2buhIW1bxs', function (err, tokens) {
        if (err) {
            console.log('The Auth returned an error: ' + err);
            return;
        }
      // set tokens to the client
      // TODO: tokens should be set by OAuth2 client.
        oauth2Client.credentials = tokens;
        console.log(oauth2Client.credentials);
        callback();
        });*/

function get(resto, callback) {
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
        callback(horaires);
    })
}

function modify(resto, date, creneau, places, valeur, nom, time){
  sheets.spreadsheets.values.batchUpdate({
    auth: oauth2Client,
    spreadsheetId: '1DnlKFhV0vNPJ-vQrixpocbcXRlHL5xKJxx5h7IF_qEc',
    resource: {
      valueInputOption: "RAW",
      data: [{range: resto + '!' + creneau + date,
        values: [
            [valeur]]
        }
  ]}
    }, function(err, response) {
        console.log(response);
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
  });
  sheets.spreadsheets.values.append({
    auth: oauth2Client,
    spreadsheetId: '1DnlKFhV0vNPJ-vQrixpocbcXRlHL5xKJxx5h7IF_qEc',
    range: "Reservations",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: {
        values: [
            [resto + " " + response.session('date') + " " + time + " " + places + " " + nom]]
        }
    }, function(err, response){
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
    }
  );
}



    function confirmation (response) {

        if (response.session('problem') != false) {
            response.shouldEndSession(false).say(response.session('problem'));
            return;
        }
        let time = response.session('time');
        let minutes = parseInt(time.substring(0,2))*60 + parseInt(time.substring(3,5));
        let date = response.session('date');
        let T = false;
        let month = parseInt(date.substring(5,7));
        let day = parseInt(date.substring(8,10));
        let maxDays = new Date(date.substring(0,4),month,0).getDate();
        let tries = 0;

        while (T === false) {


        T = disponible(response, date,minutes);
        if (T === false) {
            //Pas de place ce jour
            console.log("Pas de place ce jour");
            if (tries == 7) {
                break;
            }
            tries++;
            day++;
            if (day > maxDays) {
                month++;
                day = 1;
            }
            date = date.substring(0,4)+'-'+('0'+month.toString()).slice(-2)+'-'+('0'+day.toString()).slice(-2);

        } else {
            response.session('time',T);
        }

        }  
        if (T === false) {
            response.shouldEndSession(false).say(R(NOROOM) + "this day and the week after. You may try another date. ");
            return;
        }

        let message = createMessage(response);
        
        response.session('state',YES_NO_STATE);
        if (response.session('proposition')) {
            response.shouldEndSession(false).say(response.session('message') + R(PROPOSITION) + message + R(AGREE));
            return;
        } else {
            response.shouldEndSession(false).say(response.session('message') + R(READY) + message + R(FINISH));
            return;
        }        
    }

    function createMessage(response) {
        let cd = response.session('cd');
        let cr = response.session('cr');
        let cln = response.session('cln');
        let cn = response.session('cn');
        let ct = response.session('ct');
        return (cn?"for "+response.session('places')+" person"+(response.session('places')>1?"s ":" "):"")+(cr?"the restaurant "+response.session('restaurant').toLowerCase()+" ":"")+(cd?"on "+response.session('date').substring(5)+" ":"")+(ct?"at "+response.session('time')+" ":"")+(cln?"with the name "+response.session('name')+" ":"")+". ";
    }

    function reserver (response) {
        let restaurant = response.session('restaurant');
        get(restaurant, function(horaires) {
            let placeRestante = parseInt(horaires[date][creneau].substring(6));
            let places = response.session('places');
            let name = response.session('name');
            console.log("reservation à " + horaires[date][creneau]);
            if (placeRestante-places>=0) {
                response.setContext('reserve', 0);
                console.log("valide");
                let valeur = horaires[date][creneau].substring(0,6) + (placeRestante-places).toString();
                modify(restaurant,horaires[date][horaires[date].length-1],String.fromCharCode(66 + creneau),places,valeur,name,response.session('time'));
                response.say(R(SUCCESS) + name);
            } else {
                console.log("invalide");
                response.shouldEndSession(false).say("There was an error, the places are not available anymore. ");
            }
        });
        let date = response.session('date');
        let creneau = response.session('creneau');
        console.log(restaurant + " " + date + " " + creneau);
    }

    function disponible(response, date, time) {
        let heure;
        let possibleTime = [];
        let placeRestante;
        let horairesJour = horaires[date];
        if (isNaN(time)) {
            console.log("Nan");
        }
        if (horairesJour == undefined) {return false;}
        if (horairesJour.length <= 1) {return false;}
        for (let i = 0; i<horairesJour.length;i++) {
            if (!isNaN(horairesJour[i])) {
                continue;
            }
            placeRestante = parseInt(horairesJour[i].substring(6));
            heure = parseInt(horairesJour[i].substring(0,2))*60 + parseInt(horairesJour[i].substring(3,5));
            
            console.log("heure : "+heure+"time : "+time);

            // Teste si le créneau est bon
            // Si oui, assez de place => on revoit une heure acceptable, pas assez => On va annoncer qu'il n'y avait pas assez de place
            // Si non, est ce que le créneau avant ou celui après est disponible 

            if (heure<=time && time<heure+30) {
                if (placeRestante >= response.session('places')) {
                    response.session('creneau',i);
                    let rightTime;
                    if (time != heure) {
                        if (!response.session('proposition')){
                            let message = response.session('message');
                            message+= "You can only order a bit earlier. ";
                            response.session('message',message);
                        }
                    } 
                    rightTime = heure;
                    console.log("rightTime : " + rightTime);
                    return ('0' + Math.floor(rightTime/60).toString()).slice(-2) + ':' + ('0' + (rightTime-Math.floor(rightTime/60)*60).toString()).slice(-2);
                } else {
                    if (!response.session('proposition')) {
                        let message = response.session('message');
                        message += "There's only "+placeRestante+" seats at this hour. ";
                        response.session('message',message);
                        response.session('proposition',true);
                        response.session(ct,1);
                    }
                }
            } else if (placeRestante >= response.session('places')) {
                if (time>heure && today.getDate() != parseInt(date.substring(8,10) )) {
                    possibleTime[0] = heure;
                    possibleTime[2] = i;
                } else if (time<heure && possibleTime[1] == undefined) {
                    possibleTime[1] = heure;
                    possibleTime[3] = i;
                }
            }
        }
        let rightTime;
        if (possibleTime == []) {
            return false;
        } else if (!possibleTime[0]) {
            rightTime = possibleTime[1];
        } else if (!possibleTime[1]) {
            rightTime = possibleTime[0];
        } else {
            rightTime = possibleTime[1]-time <= time-possibleTime[0] ? possibleTime[1] : possibleTime[0];
        }
        response.session('creneau',rightTime == possibleTime[0] ? possibleTime[2] : possibleTime[3]);
        response.session('ct',1);
        let answer = ('0' + Math.floor(rightTime/60).toString()).slice(-2) + ':' + ('0' + (rightTime-Math.floor(rightTime/60)*60).toString()).slice(-2);
        console.log("temps proposé : " + answer);
        return answer;
    }

function testTime(timebis) {
    let todayNormalized = today.getFullYear().toString()+'-'+('0' + (today.getMonth()+1).toString()).slice(-2)+'-'+('0' + (today.getDate()).toString()).slice(-2);
    if (datebis == "today") {
            response.session('date',todayNormalized);
        } else if (isNaN(parseInt(datebis))) {
            response.session('problem',"What was the date ? ");
        } else {
            response.session('date',datebis);
        }
        let date = response.session('date');
        
}

function testDate(datebis) {

}

    // intents

app.pre = function(request, response, type) {
    today = new Date();
    console.log("today : " + today.getDate()+" "+(today.getMonth()+1)+" "+today.getHours()+" "+today.getMinutes());
};

app.launch(function( request, response ) {
    response.session('proposition',false);
    response.session('message',"");
    response.session('problem',false);
    response.session('date',"");
    response.session('name',"");
    response.session('restaurant',"");
    response.session('places',"");
    response.session('time',"");


    response.session('state',WELCOME_STATE);
    response.shouldEndSession(false).say(R(WELCOME));
	response.say('Welcome, say start to begin the game.').shouldEndSession( false );
} );

app.intent('Changerestaurant', function changedresto(request, response) {
    response.session('restaurant',request.slot('resto').toUpperCase());
    response.session('cr',request.slot('cr'));
});

app.intent('Changedate', function changeddate(request, response) {
    let datebis = request.slot('datebis');
    response.session('cd',request.slot('cd'));
});

app.intent('Changetime', function changedtime(request, response) {
    let timebis = request.slot('timebis');
    response.session('ct',request.slot('ct'));
});

app.intent('Changenumber', function changednumber(request, response) {
    response.session('places',parseInt(request.slot('number')));
    response.session('cn',request.slot('cn'));
});

app.intent('Changename', function changedname(request, response) {
    response.session('name',request.slot('last-name'));
    response.session('cln',request.slot('cln'));
});

app.intent( 'Reserve', function informations(request, response) {
    response.session('restaurant',request.slot('resto').toUpperCase());
        let datebis = request.slot('datebis');
        let timebis = request.slot('timebis');
        response.session('name',request.slot('last-name'));
        response.session('places',parseInt(request.slot('number')));
        response.session('cd',request.slot('cd'));
        response.session('cr',request.slot('cr'));
        response.session('cln',request.slot('cln'));
        response.session('cn',request.slot('cn'));
        response.session('ct',request.slot('ct'));
});

function reserve (request, response) {

        response.session('proposition',false);
        response.session('message',"");
        response.session('problem',false);
        response.session('state',RESERVE_STATE);
        
        

        let restaurant = response.session('restaurant');
        console.log(restaurant);

        get(restaurant,function(val) {

            horaires = val;

        if (!horaires) {
            response.shouldEndSession(false).say("I don't know this restaurant. ");
            return;
        }

        confirmation(response);
        });

        if (isNaN(response.session('places'))) {
                response.session('problem',"I didn't understand the number of persons. ");
            }

        
        
        if (timebis && !isNaN(parseInt(timebis))) {
            response.session('time',timebis.substring(0,5));
        } else {
            response.session('problem',"At what time you wanted to reserve ? ");
        }
    }

    app.intent('YesIntent', function yes (request, response) {
        let state = response.session('state');
        if (state == WELCOME_STATE) {
            response.session('state',RESERVE_STATE);
            response.shouldEndSession(false).say("What do you want to do ? ")
            return;
        } else
        if (state == YES_NO_STATE) {
            response.session('proposition' ,false);
            reserver(response);;
        } else {
            response.shouldEndSession(false).say("I'm not sure of what you wanted. ");
        }

    });

    app.intent('NoIntent',function no (request, response) {
        let state = response.session('state');
        if (state == WELCOME_STATE) {
            quit(response);
            return;
        } else
        if (state == YES_NO_STATE) {
            response.session('state',RESERVE_STATE);
            response.shouldEndSession(false).say(R(CHANGE));
            return;
        } else {
            response.shouldEndSession(false).say("I'm not sure of what you wanted. ");
        }

    });

    app.intent('Quit',function quit (request, response) {
        response.say(R(BYE));es
    });

    app.intent('intention', function selectionner (request, response) {
        response.session('state',RESERVE_STATE);
        let r = response.getContextArgument('actions_intent_option','OPTION').value;
        response.setContext('next',5,{"ok":r});
        response.shouldEndSession(false).say("The restaurant "+r.toLowerCase()+" was selected. Please say next to continue. ");
    });

    app.intent('Propose', function propose(request, response) {
        let restaurants = ['VELICIOUS','AKABE','LA CLOCHE A FROMAGE'];
        let prompt = 'Here are some cool restaurants. ';
        response.shouldEndSession(false).say(prompt+descriptions[restaurants[0]][0]+'. '+descriptions[restaurants[0]][1]+descriptions[restaurants[1]][0]+'. '+descriptions[restaurants[1]][1]+descriptions[restaurants[2]][0]+'. '+descriptions[restaurants[2]][1]+'.');
        
    });

app.intent('Answerpropose',reserve);

module.exports = app;