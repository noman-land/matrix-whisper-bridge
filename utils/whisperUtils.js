const net = require('net');
const Web3 = require('web3');

const { STATUS_POW } = require('./constants');

const {
  createStatusPayload,
  topicFromChannelName,
} = require('./statusUtils');

class WhisperUtils {
  constructor() {
    this.web3 = new Web3(new Web3.providers.IpcProvider(
      process.env.GETH_IPC_PATH,
      net,
    ));

    this.shh = this.web3.shh;
    this.symKeyFromChannelName = this.symKeyFromChannelName();
  }

  init() {
    return this.shh.newKeyPair().then(sig => {
      this.sig = sig;
      return this.shh.getPublicKey(sig);
    });
  }

  symKeyFromChannelName() {
    const channels = {};
    return room => {
      if (channels[room]) {
        return Promise.resolve(channels[room]);
      }

      return this.shh.generateSymKeyFromPassword(room).then(symKeyID => {
        channels[room] = symKeyID;
        return channels[room];
      });
    };
  }

  listen(channel) {
    const topic = topicFromChannelName(channel);

    return this.symKeyFromChannelName(channel)
      .then(symKeyID => this.shh.subscribe('messages', {
        minPow: STATUS_POW,
        symKeyID,
        topics: [topic],
      }));
  }

  send(channel, message) {
    const payload = createStatusPayload({ content: message });

    return this.symKeyFromChannelName(channel)
      .then(symKeyID => this.shh.post({
        payload,
        powTarget: STATUS_POW,
        powTime: 1,
        sig: this.sig,
        symKeyID,
        topic: topicFromChannelName(channel),
        ttl: 10,
      }));
  }
}

module.exports = WhisperUtils;
