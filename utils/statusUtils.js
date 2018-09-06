const Web3 = require('web3');

const web3 = new Web3();

const { utils: { asciiToHex, hexToAscii, sha3 } } = web3;

function createStatusPayload(
  {
    tag = '~#c4',
    content = 'This is a whisper/slack test!',
    messageType = '~:public-group-user-message',
    clockValue = (new Date().getTime()) * 100,
    contentType = 'text/plain',
    timestamp = new Date().getTime(),
  } = {},
) {
  return asciiToHex(
    JSON.stringify([
      tag,
      [
        content,
        contentType,
        messageType,
        clockValue,
        timestamp,
      ],
    ]),
  );
}

function decodeStatusPayload(payload) {
  return JSON.parse(hexToAscii(payload));
}

function topicFromChannelName(channelName) {
  return sha3(channelName).slice(0, 10);
}

module.exports = {
  createStatusPayload,
  decodeStatusPayload,
  topicFromChannelName,
};
