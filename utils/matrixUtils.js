const sdk = require('matrix-js-sdk');

const Bridge = require('matrix-appservice-bridge').Bridge;
const AppServiceRegistration = require('matrix-appservice-bridge').AppServiceRegistration;

const {
  MATRIX_ACCESS_TOKEN,
  STATUS_MATRIX_SERVER_URL,
} = require('../utils/constants');
const { topicFromChannelName } = require('./statusUtils');
const { trimHashSign } = require('./utils');

class MatrixUtils {
  constructor() {
    //this.client = sdk.createClient({
    //  accessToken: MATRIX_ACCESS_TOKEN,
    //  baseUrl: STATUS_MATRIX_SERVER_URL,
    //  userId: '@noman:status.im',
    //});

    this.bridge = new Bridge({
      homeserverUrl: STATUS_MATRIX_SERVER_URL,
      domain: 'status.im',
      registration: 'whisper-registration.yaml',
      controller: {
        onUserQuery: queriedUser => {
          console.log('matrix userQuery', queriedUser);
          return {}; // auto-provision users with no additonal data
        },

        onEvent: (request, context) => {
          const event = request.getData();
          console.log('matrix event', event);
          return;
        },
      },
    }).run(8090, {});

    //this.register();
  }

  register() {
    const reg = new AppServiceRegistration();
    reg.setAppServiceUrl(STATUS_MATRIX_SERVER_URL);
    reg.setId(AppServiceRegistration.generateToken());
    reg.setHomeserverToken(AppServiceRegistration.generateToken());
    reg.setAppServiceToken(AppServiceRegistration.generateToken());
    reg.setSenderLocalpart('whisper-bridge');
    reg.addRegexPattern('users', '@whisper_.*', true);
    reg.outputAsYaml('whisper-registration.yaml');
  }

  getRooms() {
    return this.client.publicRooms().then(({ chunk: rooms }) => {
      return rooms
        .reduce((accum, { name, room_id: roomId }) => {
          const room = trimHashSign(name);
          accum[topicFromChannelName(room)] = {
            name,
            roomId,
          };
          return accum;
        }, {});
    });
  }

  listen() {
    // TODO
  }

  send(roomId, message, mimeType) {
    this.client.sendMessage(roomId, {
      body: message,
      msgtype: mimeType,
    });
  }
}

module.exports = MatrixUtils;
