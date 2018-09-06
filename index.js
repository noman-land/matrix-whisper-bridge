//const transit = require('transit-js');

const MatrixRiotBridge = require('./app/MatrixRiotBridge');
const { decodeStatusPayload } = require('./utils/statusUtils');

const CHANNEL = 'noman-test';

const bridge = new MatrixRiotBridge();

bridge.init().then(([whisperUtils]) => {
  whisperUtils.getPublicKey().then(publicKey => {
    function isMe(sig) {
      return publicKey === sig;
    }

    whisperUtils.send(CHANNEL, 'Bot is alive');

    whisperUtils.listen(CHANNEL).then(
      subscription => {
        subscription.on('data', ({ payload, sig, timestamp, topic }) => {
          const [, [message]] = decodeStatusPayload(payload);
          const me = isMe(sig);
          const name = me ? 'Bot' : sig.slice(0, 10);

          console.log('From:', name, 'at', timestamp);
          console.log('Topic:', topic);
          console.log('Message:', message, '\n');

          if (!me) {
            whisperUtils.send(CHANNEL, `${message} back`);
          }
        });
      },
    );
  },
  error => console.error(error));
});
