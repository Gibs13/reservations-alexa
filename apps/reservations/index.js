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
const RESTAURANTS = ["velicious","akabe","la cloche a fromage","habibi","aristide","kim","le monastir","la patrie","pasta et ravioli","en afghanistan","au diable bleu","lard et crème","meteoreat","le pied de mammouth","cinecitta","la vetta","le moulin du diable","l'absinthe","pur etc","la cocotte","milas","la grappa","block out","gavroche","aux quatre vents"]

const PROPOSITION = ["My suggestion is ","I may suggest you ","A possible choice would be ","I allowed myself to choose ","Maybe "];
const MISUNDERSTAND = ["Sorry, I didn't understand. ","What did you just said ? ","I didn't heared well. "];
const AGREE = ["Do you agree ? ","Is it ok for you ? ","Is it alright ? "];
const FINISH = ["May I place a reservation ? ","Is everything right ? ","May I proceed ? "];
const READY = ["A table is available ","There's still place ","It's possible to reserve "];
const SUCCESS = ["Your reservation was completed under the name of ","Everything went well. The table was ordered with the name ","The reservation was made under the name : "];
const WELCOME = ["Welcome ! You can book a restaurant's table in Strasbourg. ","Hello ! I'm able to get a reservation for a restaurant in Strasbourg. ","Howdy ! Do you want a reservation in a Strasbourg's restaurant ? "];
const BYE = ["Alright then, come back soon ! ","Well, goodbye. See you soon.","You're leaving yet ? Until next time !"];
const CHANGE = ["What should I change ? ","Tell me what has to be modified. ","What has to be replaced ? "];
const NOROOM = ["There is no room ","They haven't got any seats ","It's not possible to book "];

const ASK_RESTO = ["Sure, what's the restaurant ?",
"Sure, where are you eating ?",
"Sure, give me the restaurants name please.",
"Sure,where woud you like to make your reservation ?",
"Okay, where are you eating ?","Okay, what's the restaurant ?",
"Okay, give me the restaurants name please.",
"Okay, where woud you like to make your reservation ?",
"Alright, give me the restaurants name please.",
"Alright,  whats the restaurant ?",
"Alright, where are you eating ?",
"Alright, where woud you like to make your reservation ?",
"Absolutely, where woud you like to make your reservation ?",
"Absolutely, what's the restaurant ?",
"Absolutely, where are you eating ?",
"Absolutely, give me the restaurants name please."];
const ASK_DATE = ["Which date ?",
"Understood, what day will you be joining us on?",
"Can you just tell me what day you like the reservation for.",
"For which day?",
"May I also know what day you will like the reservation for?",
"Which day would you like book your table?"];
const ASK_TIME = ["What time would you like the reservation for?",
"What time will you be eating?",
"What time do you think that you would like to eat there?",
"What time do you want the table?",
"For what time?",
"At what time?",
"What time will you be arriving?",
"When would you like book your table?"];
const ASK_NUMBER = ["How many persons are coming ?",
"How many people will you need the reservation for ?",
"How many guests will be in your party?",
"How many diners will be in your group?",
"How many in your group?",
"How many in your party?",
"How many persons would be present?",
"For how many?",
"How large a group are you expecting?",
"And how many people will attend?",
"A table for how many guests?"];
const ASK_NAME = ["Under which name should I book the tables ?",
"If you would kindly give me your name.",
"Please just give me your name",
"If you would just give me your name.",
"Can I have the name on the reservation?",
"And the name on the reservation?",
"May I have your name please?",
"May I have your name, sir?",
"May I please know what name I should make the reservation under ?",
"May I have your last name please?"];
const ASK_VALUE = ["What's the new value ?",
"Give me the new value please.",
"What would you like to try ?"];
const MONTH = ["January",
"February",
"March",
"April",
"May",
"June",
"July",
"August",
"September",
"October",
"November",
"December"];
const DAY = ["first",
"second",
"third",
"fourth",
"fifth",
"sixth",
"seventh",
"eighth",
"ninth",
"tenth",
"eleventh",
"twelfth",
"thirteenth",
"fourteenth",
"fifteenth",
"sixteenth",
"seventeenth",
"eighteenth",
"nineteenth",
"twentieth",
"twenty-first",
"twenty-second",
"twenty-third",
"twenty-fourth",
"twenty-fifth",
"twenty-sixth",
"twenty-seventh",
"twenty-eighth",
"twenty-ninth",
"thirtieth",
"thirty-first"];


const IMAGE = 'https://reservation01.herokuapp.com/images/';


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

function modify(resto, date, creneau, places, valeur, nom, time, date2){
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
            [resto + " " + date2 + " " + time + " " + places + " " + nom + " (via alexa)"]]
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

    T = disponible(response, date, minutes, function(T) {
    if (T === false) {
        //Pas de place ce jour
        console.log("Pas de place ce jour");
        if (tries == 0 && !response.session('proposition')) {
            response.session('proposition',true);
            let message = response.session('message');
            message+= R(NOROOM) + "this day. ";
            response.session('message',message);
        }
        if (tries == 7) {
            return null;
        }
        tries++;
        day++;
        if (day > maxDays) {
            month++;
            day = 1;
        }
        date = date.substring(0,4)+'-'+('0'+month.toString()).slice(-2)+'-'+('0'+day.toString()).slice(-2);
        return false;
    } else {
        console.log("Time set")
        response.session('time',T);
        return T;
    } });
        
    } 
    let m = response.session('message');
    if (T === null) {
        console.log("Pas de place la semaine")
        response.shouldEndSession(false).say(R(NOROOM) + "this day and the week after. You may try another date. ");
        return;
    }

    let message = createMessage(response);
        
    response.session('state',YES_NO_STATE);
    if (!!response.session('proposition')) {
        console.log("proposition");
        response.say(m + R(PROPOSITION) + message + R(AGREE)).shouldEndSession(false);
        return;
    } else {
        console.log("validation");
        response.say(m + R(READY) + message + R(FINISH)).shouldEndSession(false);
        return;
    }        
}

function createMessage(response) {
    let cd = response.session('cd');
    let cr = response.session('cr');
    let cln = response.session('cln');
    let cn = response.session('cn');
    let ct = response.session('ct');
    let dateMessage;
    let timeMessage;
    if (!cd) {dateMessage="";}
    else {
    let date = response.session('date');
    let day = today.getDate();
    if (day == parseInt(date.substring(8,10))) {
        dateMessage = "today ";
    } else if (day+1 == parseInt(date.substring(8,10))) {
        dateMessage = "tomorrow ";
    } else if (day+2 == parseInt(date.substring(8,10))) {
        dateMessage = "in two days ";
    } else {
        dateMessage = "on the "+DAY[parseInt(date.slice(8))-1]+" of "+MONTH[parseInt(date.slice(5,7))-1]+" ";
    }}
    if (!ct) {timeMessage="";}
    else {
        let time = response.session('time');
        timeMessage = "at "+(time.slice(0,2)<10?time.slice(1,2):time.slice(0,2))+" hours "+(time.slice(3,5)!=0?time.slice(3,5)+" minutes ":"");
    }
    let message = (cn?"for "+response.session('places')+" person"+(response.session('places')>1?"s ":" "):"")+(cr?"the restaurant "+response.session('restaurant').toLowerCase()+" ":"")+dateMessage+timeMessage+(cln?"with the name "+response.session('name')+" ":"")+". ";
    response.session('cd',0);
    response.session('cr',0);
    response.session('cln',0);
    response.session('cn',0);
    response.session('ct',0);
    return message;
}

function reserver (response) {
    let restaurant = response.session('restaurant');
    let date = response.session('date');
    let creneau = response.session('creneau');
    console.log(restaurant + " " + date + " " + creneau);
    return Promise.resolve(get(restaurant))
    .then(function(horaires) {
        let placeRestante = parseInt(horaires[date][creneau].substring(6));
        let places = response.session('places');
        let name = response.session('name');
        console.log("reservation à " + horaires[date][creneau]);
        if (placeRestante-places>=0) {
            //response.setContext('reserve', 0);
            console.log("valide");
            let valeur = horaires[date][creneau].substring(0,6) + (placeRestante-places).toString();
            response.say(R(SUCCESS) + name);
            modify(restaurant,horaires[date][horaires[date].length-1],String.fromCharCode(66 + creneau),places,valeur,name,response.session('time'),response.session('date'));
            return;
        } else {
            console.log("invalide");
            response.shouldEndSession(false).say("Sorry, looks like the places are not available anymore. ");
            return;
        }
    });
}

function disponible(response, date, time, callback) {
    let p = response.session('places');
    let heure;
    let possibleTime = [];
    let placeRestante;
    let horairesJour = horaires[date];
    if (isNaN(time)) {
        console.log("Nan");
    }
    if (horairesJour == undefined) {return callback (false);}
    if (horairesJour.length <= 1) {return callback (false);}
    for (let i = 0; i<horairesJour.length;i++) {
        if (!isNaN(horairesJour[i])) {
            continue;
        }
        placeRestante = parseInt(horairesJour[i].substring(6));
        heure = parseInt(horairesJour[i].substring(0,2))*60 + parseInt(horairesJour[i].substring(3,5));

        console.log("heure : "+heure+" time : "+time+" places : "+placeRestante);

            // Teste si le créneau est bon
            // Si oui, assez de place => on revoit une heure acceptable, pas assez => On va annoncer qu'il n'y avait pas assez de place
            // Si non, est ce que le créneau avant ou celui après est disponible 

        if (heure<=time && time<heure+30) {
            if (placeRestante >= p) {
                response.session('creneau',i);
                let rightTime;
                if (time != heure) {
                    if (!response.session('proposition')){
                        let message = response.session('message');
                        message+= "You can only reserve a bit earlier. ";
                        response.session('message',message);
                    }
                } 
                rightTime = heure;
                console.log("rightTime : " + rightTime);
                return callback( ('0' + Math.floor(rightTime/60).toString()).slice(-2) + ':' + ('0' + (rightTime-Math.floor(rightTime/60)*60).toString()).slice(-2));
            } else {
                if (!response.session('proposition')) {
                    let message = response.session('message');
                    message += "There's only "+placeRestante+" seats at this hour. ";
                    response.session('message',message);
                    response.session('proposition',true);
                    response.session('ct',1);
                }
            }
        } else if (placeRestante >= p) {
            if (time>heure && today.getDate() != parseInt(date.substring(8,10) )) {
                possibleTime[0] = heure;
                possibleTime[2] = i;
            } else if (time<heure && possibleTime[1] == undefined) {
                possibleTime[1] = heure;
                possibleTime[3] = i;
            }
        }
    }
    console.log('array ' + possibleTime.toString());
    let rightTime;
    if (!possibleTime[0] && !possibleTime[1]) {
        return callback (false);
    } else if (!possibleTime[0]) {
        rightTime = possibleTime[1];
    } else if (!possibleTime[1]) {
        rightTime = possibleTime[0];
    } else {
        rightTime = possibleTime[1]-time <= time-possibleTime[0] ? possibleTime[1] : possibleTime[0];
    }
    response.session('creneau',rightTime == possibleTime[0] ? possibleTime[2] : possibleTime[3]);
    response.session('ct',1);
    response.session('proposition',true);
    let answer = ('0' + Math.floor(rightTime/60).toString()).slice(-2) + ':' + ('0' + (rightTime-Math.floor(rightTime/60)*60).toString()).slice(-2);
    console.log("temps proposé : " + answer);
    return callback (answer);
}

function testRestaurant(response, restaurantslot) {
    if (!restaurantslot && !response.session('restaurant')) {
        response.clear();
        response.say(R(ASK_RESTO));
        return 1;
    } else if (!!restaurantslot) {
        for (let i=0;i<RESTAURANTS.length;i++) {
            if (restaurantslot == RESTAURANTS[i]) {
                response.session('restaurant',restaurantslot.toUpperCase());
                response.session('cr',1);
                return 0;
            }
        }
        if (restaurantslot.slice(2,3) == ':') {
            response.session('time',restaurantslot);
            response.session('ct',1);
        }
    }
    return 0;
}

function testDate(response, dateslot) {
    if (!dateslot && !response.session('date')) {
        response.clear();
        response.say(R(ASK_DATE));
        return 1;
    } else if (!!dateslot) {
        response.session('date',dateslot);
        response.session('cd',1);
    }
    return 0;
}

function testTime(response, timeslot) {  
    if (!timeslot && !response.session('time')) {
        response.clear();
        response.say(R(ASK_TIME));
        return 1;
    } else if (!!timeslot) {
        response.session('time',timeslot);
        response.session('ct',1);
    }
    return 0;
}

function testNumber(response, numberslot) {
    if (!numberslot && !response.session('places')) {
        response.clear();
        response.say(R(ASK_NUMBER));
        return 1;
    } else if (!!numberslot) {
        response.session('places',parseInt(numberslot));
        response.session('cn',1);
    }
    return 0;
}

function testName(response, nameslot) {
    if (!nameslot && !response.session('name')) {
        response.clear();
        response.say(R(ASK_NAME));
        return 1;
    } else if (!!nameslot) {
        response.session('name',nameslot);
        response.session('cln',1);
    }
    return 0;
}

function informations(request, response) {
    response.session('state',RESERVE_STATE);
    let notBool = 0;
    notBool += testName(response,request.slot('nameslot'));
    notBool += testNumber(response,request.slot('numberslot'));
    notBool += testTime(response,request.slot('timeslot'));
    notBool += testDate(response,request.slot('dateslot'));
    notBool += testRestaurant(response,request.slot('restaurantslot'));
    if(notBool) {
        response.shouldEndSession(false);
        return;}
    return Promise.resolve(reserve(response));
}

function reserve (response) {

    response.session('proposition',false);
    response.session('message',"");
    response.session('problem',false);        
        

    let restaurant = response.session('restaurant');
    console.log(restaurant);

    return Promise.resolve(get(restaurant)).then(
    function(val) {

        horaires = val;

    if (!horaires) {
        response.shouldEndSession(false).say("I don't know this restaurant. ");
        return;
    }
        if (isNaN(response.session('places'))) {
        response.session('problem',"I didn't understand the number of persons. ");
    }

    confirmation(response);
    });        
        
}

function change (request, response) {
    if (state == RESERVE_STATE) {
        response.say(R(ASK_VALUE)).shouldEndSession(false);
        return;
    } else {
        response.say("You cannot change right now. ").shouldEndSession(false);
        return;
    }
}

function yes (request, response) {
        let state = response.session('state');
        if (state == WELCOME_STATE) {
            response.session('state',RESERVE_STATE);
            response.shouldEndSession(false).say("What do you want to do ? ")
            return;
        } else
        if (state == YES_NO_STATE) {
            response.session('proposition' ,false);
            return Promise.resolve(reserver(response));
        } else {
            response.shouldEndSession(false).say("I'm not sure of what you wanted. ");
        }

    }

function no (request, response) {
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

}

function quit (request, response) {
    response.say(R(BYE));
}

function propose(request, response) {
    response.session('state',RESERVE_STATE);
    let restaurants = ['VELICIOUS','AKABE','LA CLOCHE A FROMAGE'];
    let prompt = 'Here are some cool restaurants. ';
    response.shouldEndSession(false).say(prompt+descriptions[restaurants[0]][0]+'. '+descriptions[restaurants[0]][1]+descriptions[restaurants[1]][0]+'. '+descriptions[restaurants[1]][1]+descriptions[restaurants[2]][0]+'. '+descriptions[restaurants[2]][1]+'.');   
}

    // intents

app.pre = function(request, response, type) {
    today = new Date();
    console.log("today : " + today.getDate()+" "+(today.getMonth()+1)+" "+today.getHours()+" "+today.getMinutes());
    return;
};

app.launch(function( request, response ) {
    console.log("launched");
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
} );

app.intent('Reserve',informations);
app.intent('Propose', propose);
app.intent('Quit',quit);
app.intent('NoIntent',no);
app.intent('YesIntent',yes);
app.intent('Change',change);

module.exports = app;