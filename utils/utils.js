function trimHashSign(channelName) {
  return channelName.replace(/#/g, '');
}

module.exports = {
  trimHashSign,
};
