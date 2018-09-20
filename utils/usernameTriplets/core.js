// Wholesale ripoff of https://github.com/status-im/status-react/blob/e7427997d253ed04e0c5f7044fbfefa24b31a7a8/src/status_im/utils/gfycat/core.cljs

const adjectives = require('./adjectives');
const animals = require('./animals');
const { randGen, seededRandNth } = require('./random');
const { capitalizeFirstLetter } = require('../utils');

const pickRandom = (gen, vector) => seededRandNth(gen, vector);

const buildGfy = publicKey => {
  const gen = randGen(publicKey);
  const firstAdjective = capitalizeFirstLetter(pickRandom(gen, adjectives));
  const secondAdjective = capitalizeFirstLetter(pickRandom(gen, adjectives));
  const animal = capitalizeFirstLetter(pickRandom(gen, animals));
  return `${firstAdjective} ${secondAdjective} ${animal}`;
};

const generateGfy = publicKey => {
  if (publicKey === null || publicKey === '0') {
    return 'Unknown';
  }

  if (typeof publicKey === 'undefined') {
    return buildGfy(new Date().getTime());
  }

  return buildGfy(publicKey);
};

module.exports = { generateGfy };
