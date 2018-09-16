const WhisperUtils = require('../utils/whisperUtils');

class MatrixWhisperBridge {
  init() {
    return Promise.all([
      this.connectToWhisper(),
      this.connectToMatrix(),
    ]);
  }

  connectToWhisper() {
    this.whisperUtils = new WhisperUtils();
    return this.whisperUtils.init();
  }

  connectToMatrix() {
    this.matrixUtils = {};
    return this.matrixUtils;
  }
}

module.exports = MatrixWhisperBridge;
