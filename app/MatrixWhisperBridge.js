const { EventEmitter } = require('events');

const MatrixUtils = require('../utils/matrixUtils');
const WhisperUtils = require('../utils/whisperUtils');
const { TEST_CHANNEL } = require('../utils/constants');
const { decodeStatusPayload } = require('../utils/statusUtils');
const { generateGfy } = require('../utils/usernameTriplets/core');

class MatrixWhisperBridge {
  constructor() {
    this.eventEmitter = new EventEmitter();
    this.matrix = new MatrixUtils();
    this.whisper = new WhisperUtils();

    this.roomsByTopic = {};

    this.emitMatrixEvent = this.emitMatrixEvent.bind(this);
    this.emitWhisperEvent = this.emitWhisperEvent.bind(this);
    this.handleMatrixMessage = this.handleMatrixMessage.bind(this);
    this.handleWhisperMessage = this.handleWhisperMessage.bind(this);
  }

  start() {
    return Promise
      .all([
        this.matrix.getRooms().then(roomsByTopic => { this.roomsByTopic = roomsByTopic; }),
        this.whisper.init().then(pubKey => { this.pubKey = pubKey; }),
      ])
      .then(() => {
        this.startListening();
        this.startPosting();
      })
      .finally();
  }

  startListening() {
    this.whisper.listen(TEST_CHANNEL).then(subscription => {
      subscription.on('data', this.emitWhisperEvent);
      subscription.on('error', error => console.log('OH NO', error));
      subscription.on('end', () => console.log('ENDED'));
    });
  }

  startPosting() {
    this.eventEmitter.on('whisperMessage', this.handleWhisperMessage);
    this.eventEmitter.on('matrixMessage', this.handleMatrixMessage);
  }

  emitWhisperEvent(data) {
    this.eventEmitter.emit('whisperMessage', data);
  }

  emitMatrixEvent(data) {
    this.eventEmitter.emit('matrixMessage', data);
  }

  handleMatrixMessage(data) {
    console.log(data);
  }

  handleWhisperMessage(options) {
    const { payload, sig, timestamp, topic } = options;
    const [, [message, mimeType]] = decodeStatusPayload(payload);
    //console.log(decodeStatusPayload(payload));

    const username = generateGfy(sig);
    const isMe = this.isMe(sig);

    console.log(`${username}:`, message);
    console.log('At:', timestamp);
    console.log('Topic: [', topic, ']\n');

    const { roomId } = this.roomsByTopic[topic] || {};

    if (!roomId || isMe) {
      return null;
    }

    return this.matrix.send(roomId, `${username}: ${message}`, mimeType);
  }

  isMe(sig) {
    return sig === this.pubKey;
  }
}

module.exports = MatrixWhisperBridge;
