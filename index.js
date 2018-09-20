//const transit = require('transit-js');

const MatrixWhisperBridge = require('./app/MatrixWhisperBridge');

const bridge = new MatrixWhisperBridge();

bridge.start();
