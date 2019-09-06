'use strict';

import { NativeAppEventEmitter } from 'react-native';
import { Dialogflow } from './js/Dialogflow';
import { Dialogflow_V2 } from './js/Dialogflow_V2';
import Voice from './js/RCTVoice';
import rs  from 'jsrsasign';

/**
 *  DIALOGFLOW V1
 */
var dialogflow = new Dialogflow();

dialogflow.setConfiguration = function (accessToken, languageTag) {
    dialogflow.accessToken = accessToken;
    dialogflow.languageTag = languageTag;
    dialogflow.sessionId = dialogflow.sessionId ? dialogflow.sessionId : dialogflow.guid();

    Voice.onSpeechStart = () => (c) => dialogflow.onListeningStarted(c);
    Voice.onSpeechEnd = () => (c) => dialogflow.onListeningFinished(c);
}

dialogflow.startListening = function (onResult, onError) {

    dialogflow.subscription = NativeAppEventEmitter.addListener(
        'onSpeechResults',
        (result) => {
            if (result.value) {
                dialogflow.requestQuery(result.value[0], onResult, onError);
            }

        }
    );

    Voice.start(dialogflow.languageTag);
}

dialogflow.finishListening = function () {
    Voice.stop();
}

export default dialogflow;


/**
 * DIALOGFLOW V2
 */
var dialogflow2 = new Dialogflow_V2();

dialogflow2.generateJWT = (options = {email: null, key: null}) => {
    if (!options) { throw new Error('options is required'); }
    if (!options.email) { throw new Error('options.email is required'); }
    if (!options.key) { throw new Error('options.key is required'); }


    var iat = Math.floor(new Date().getTime() / 1000),
        exp = iat + Math.floor((options.expiration || 60 * 60 * 1000) / 1000),
        claims = {
            iss: options.email,
            scope: "https://www.googleapis.com/auth/cloud-platform",
            aud: 'https://accounts.google.com/o/oauth2/token',
            exp: exp,
            iat: iat,
            sub: null
        };

    if (options.delegationEmail) {
        claims.sub = options.delegationEmail;
    }

    // Sign JWT && store token on client side
    var sHeader = JSON.stringify({ alg: 'RS256', typ: 'JWT' });
    return rs.jws.JWS.sign("RS256", sHeader, JSON.stringify(claims), options.key);
}

dialogflow2.setConfiguration = async function (jwt, languageTag, projectId) {
    dialogflow2.accessToken = await dialogflow2.generateAccessToken(jwt);
    dialogflow2.languageTag = languageTag;
    dialogflow2.projectId = projectId;
    dialogflow2.sessionId = dialogflow2.sessionId ? dialogflow2.sessionId : dialogflow2.guid();

    // set listeners
    Voice.onSpeechStart = (c) => {
        dialogflow2.speechResult = null;
        if (dialogflow2.onListeningStarted) {
            dialogflow2.onListeningStarted(c);
        }
    }

    Voice.onSpeechEnd = (c) => {

        if (dialogflow2.speechResult) {
            dialogflow2.requestQuery(dialogflow2.speechResult[0], dialogflow2.onResult, dialogflow2.onError);
        }

        if (dialogflow2.onListeningFinished) {
            dialogflow2.onListeningFinished(c);
        }
    }

    Voice.onSpeechVolumeChanged = (c) => {
        if (dialogflow2.onAudioLevel) {
            dialogflow2.onAudioLevel(c);
        }
    }

    Voice.onSpeechResults = (result) => {
        if (result.value) {
            dialogflow2.speechResult = result.value;
        }
    }
}

dialogflow2.startListening = function (onResult, onError) {
    dialogflow2.onResult = onResult;
    dialogflow2.onError = onError;

    Voice.start(dialogflow2.languageTag);
}

dialogflow2.finishListening = function () {
    Voice.stop();
}

export { dialogflow2 as Dialogflow_V2 };

