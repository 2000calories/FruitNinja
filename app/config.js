export const Config = {
  fruit: {
    size: 50,
    vx: 3,
    vy: -6,
  },
  acc: 0.04,
  drops: {
    rad: 25,
  },
  halfFruit: {
    size: 50,
  },
  splash: {
    size: 150,
  },
  specialFruitLayerColor: {
    frenzy: 0xEC7B17,
    double: 0x118CDE,
    freeze: 0xFFFFFF,
    bomb: 0xFFFFFF,
  },
  ww: window.innerWidth,
  wh: window.innerHeight,
};

export const imageMappings = {};

export const dropsColor = [
  0xff2c2c, 0x00c12c,
  0xff272c, 0xffff00,
  0xff2c2c, 0xffff00,
  0xff2c2c, 0x00c12c,
  0xff272c, 0xffff00,
  0xff272c, 0xff2c2c,
  0xffff00, '',
];

// Ignoring "double"
imageMappings.numFruits = 14;

for (let i = 0; i < 10; i += 1) {
  imageMappings[`fruit${i}`] = {
    hf1: `halffruit${2 * i}`,
    hf2: `halffruit${2 * i + 1}`,
    splash: `splash${i}`,
    dropColor: dropsColor[i],
  };
}

export const specials = ['frenzy', 'freeze', 'double', 'bomb'];

// set mappings of special fruits and bomb here
specials.forEach((e, i) => {
  imageMappings[e] = {
    splash: `splash${i+10}`,
    dropColor: dropsColor[i+10],
  };
});
