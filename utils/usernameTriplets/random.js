const Chance = require('chance');

const randGen = seed => new Chance(seed);

const seededRandInt = (gen, n) => gen.integer({ min: 0, max: n - 1 });

const seededRandNth = (gen, coll) => coll[seededRandInt(gen, coll.length)];

module.exports = { randGen, seededRandNth };
