// Knife move special effects

import PIXI from 'pixi.js';

import BaseContainer from './basecontainer';


export default class Knife extends BaseContainer {
  constructor(...args) {
    super(...args);
  }

  drawBlade(p1, p2) {
    // Draw knife move effect b/w two points

    const line = new PIXI.Graphics();
    line.beginFill(0xFF3300);
    line.lineStyle(5, 0xffd900, 1);
    line.moveTo(p1.x, p1.y);
    line.lineTo(p2.x, p2.y);
    line.endFill();
    this.add('blade', line);
  }

  animate() {
    this.getAll('blade').forEach((blade) => {
      if (blade.alpha < 0)
        this.remove('blade', blade.name);
      blade.alpha -= 0.1;
    });

    if (this.parent.mouseData.length < 2)
      return;

    this.drawBlade(...this.parent.mouseData);
  }
}
