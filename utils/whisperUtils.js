const net = require('net');
const Web3 = require('web3');

const {
  createStatusPayload,
  topicFromChannelName,
} = require('./statusUtils');

const CHANNEL = 'noman-test';

class WhisperUtils {
  init() {
    this.web3 = new Web3(new Web3.providers.IpcProvider(
      process.env.GETH_IPC_PATH,
      net,
    ));

    this.shh = this.web3.shh;

    return new Promise((resolve, reject) => {
      this.createWhisperIdentity().then(
        sig => {
          this.sig = sig;
          resolve(this);
        },
        error => reject(error),
      );
    });
  }

  createWhisperIdentity() {
    return this.shh.newKeyPair();
  }

  getPublicKey() {
    return this.shh.getPublicKey(this.sig);
  }

  listen(channel) {
    const topic = topicFromChannelName(channel);

    return new Promise(resolve => {
      this.shh.generateSymKeyFromPassword(channel)
        .then(symKeyID => {
          const subscription = this.shh.subscribe('messages', {
            minPow: 0.002,
            symKeyID,
            topics: [topic],
          });
          resolve(subscription);
        });
    });
  }

  send(channel, message) {
    const payload = createStatusPayload({ content: message });

    return this.shh.generateSymKeyFromPassword(channel)
      .then(symKeyID => this.shh.post({
        payload,
        powTarget: 0.002,
        powTime: 1,
        sig: this.sig,
        symKeyID,
        topic: topicFromChannelName(channel),
        ttl: 10,
      }));
  }
}

module.exports = WhisperUtils;
