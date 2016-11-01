import './index.html';
import PIXI from 'pixi.js';
import BaseContainer from './basecontainer.js';
import Knife from './knife.js';
import GameOptionsContainer from './gameoptions.js';
import GamePlayContainer from './gameplay.js';
import { HighScoreContainer, AboutGameContainer, LoaderContainer } from './others.js';
import { Config } from './config.js';

const renderer = PIXI.autoDetectRenderer(window.innerWidth,
  window.innerHeight, {
  antialiasing: false,
  transparent: false,
  resolution: window.devicePixelRatio,
  autoResize: true,
  backgroundColor: 0x5D371A
});

document.body.appendChild(renderer.view);

class Root extends BaseContainer {
  constructor(...args) {
    super(...args);
    this.h = Config.wh;
    this.w = Config.ww;
    this.interactive = true;

    this.pause = false;
    this.cutting = false; // true if Knife in cutting mode
    this.mouseData = []; // data of mouse movement

    this.containerChange = true;
    this.counter = 0;
    this
      .on('mousedown', this.onMouseDown())
      .on('touchstart', this.onMouseDown())
      .on('mousemove', this.onMouseMove())
      .on('touchmove', this.onMouseMove())
      .on('mouseup', this.onMouseUp())
      .on('mouseupoutside', this.onMouseUp())
      .on('touchend', this.onMouseUp())
      .on('touchendoutside', this.onMouseUp())
      //.on('click', this.onClick)

    this.state = "initial";
    this.filesToLoad = 1;
    this.filesLoaded = 0;

    let options = ["about game", "new game", "high score"];
    let gameContainer = new GameOptionsContainer(options);
    this.add('gameContainer', gameContainer);

    this.loadTextures();
  }

  gameInit() {
    let bg = new PIXI.Sprite(PIXI.Texture.fromFrame('bg.png'));
    bg.height = this.h; bg.width = this.w;
    bg.interactive = true;
    this.add('bg', bg, 0);
  }

  assetsLoaded() {
    this.gameInit();
    this.filesLoaded += 1;
    resize();
  }

  loadTextures() {
    PIXI.loader
      .add('assets/basics.json')
      .load(() => {
        let self = this;
        self.assetsLoaded();
      });
  }

  onClick(x) {
    this.pause = !this.pause;
  }

  onMouseDown() {
    return (x) => {
      let self = this;
      self.cutting = true;
      let position = x.data.global;
      self.mouseData.push({
        x: position.x,
        y: position.y
      });
      self.add('knife', new Knife());
    };
  }

  onMouseUp() {
    return (x) => {
      this.cutting = false;
      this.remove('knife');
      this.mouseData = [];
    };
  }

  onMouseMove() {
    let self = this;
    return (x) => {
      let position = x.data.global;
      if(self.cutting) {
        self.mouseData.push({
          x: position.x,
          y: position.y
        });

        // Keep only last two datapoints
        if(self.mouseData.length == 3)
          self.mouseData.shift();
      }
    };
  }

  reduceInitial(action) {
    // Reduce from Initial state to next state
    // Possible actions: about game, new game, high score
    let gameContainer;

    switch(action) {
      case "about game":
        gameContainer = new AboutGameContainer();
        break;
      case "new game":
        let options = ["archade mode", "zen mode", "back"];
        gameContainer = new GameOptionsContainer(options);
        break;
      case "high score":
        gameContainer = new HighScoreContainer();
        break;
    }
    return gameContainer;
  }

  reduceNewGame(action) {
    // Possible actions: zen mode, archade mode, back
    let gameContainer;

    switch(action) {
      case "zen mode":
      case "archade mode":
        gameContainer = new GamePlayContainer(action);
        break;
      case "back":
        let options = ["about game", "new game", "high score"];
        gameContainer = new GameOptionsContainer(options);
        break;
    }
    return gameContainer;
  }

  reduce(action) {
    // Switch to new state based on action

    let prevState = this.state;

    if(this.state == "about game" || this.state == "high score")
      this.state = "initial";
    else
      this.state = action;

    let gameContainer;

    switch(prevState) {
      case "initial":
        gameContainer = this.reduceInitial(action);
        break;
      case "about game":
      case "high score":
        // go back
        let options = ["about game", "new game", "high score"];
        gameContainer = new GameOptionsContainer(options);
        break;
      case "new game":
        gameContainer = this.reduceNewGame(action);
        break;
    }
    return gameContainer;
  }

  animate() {
    if(this.pause)
      return;


    this.get('gameContainer').animate();

    let action = this.get('gameContainer').handleOptionSelection();
    if(action != undefined) {
        this.remove('gameContainer');
        this.containerChange = true;
        this.add('gameContainer', this.reduce(action));
        resizeGameContainer();
    }

    if(this.get('knife') != undefined)
      this.get('knife').animate();
  }

// End class
}

const stage = new Root();

let prev = null;

function resizeGameContainer() {

  let gameContainer = stage.get('gameContainer');
  let state = stage.state;
  if(state == "archade mode" || state == "zen mode") {
    if(stage.containerChange) {
      gameContainer.scale.x *= window.innerWidth/Config.ww;
      gameContainer.scale.y *= window.innerHeight/Config.wh;
      stage.containerChange = false;
    }
    else {
      gameContainer.scale.x *= renderer.width/stage.w - 0.1;
      gameContainer.scale.y *= renderer.height/stage.h;
    }
  }
  else {
    if(gameContainer.loading) {
      prev = {'x': gameContainer.scale.x, 'y': gameContainer.scale.y};
      gameContainer.scale.x *= window.innerWidth/Config.ww;
      gameContainer.scale.y *= window.innerHeight/Config.wh;
    }
    else{
      if(prev != null) {
        gameContainer.scale.x = prev.x;
        gameContainer.scale.y = prev.y;
      }

      if(stage.containerChange) {
        let scale = window.innerHeight/Config.wh;
        if(window.innerHeight < 400) scale += 0.05;
        // let scale = window.innerWidth/Config.ww;
        gameContainer.scale.x *= scale;
        gameContainer.scale.y *= scale;
        stage.containerChange = false;
      }
      else {
        let scale = renderer.height/stage.h;
        if(renderer.width < 400) scale += 0.05;
        // let scale = window.innerWidth/Config.ww;
        gameContainer.scale.x *= scale;
        gameContainer.scale.y *= scale;
      }
    }
  }
}

function resize(){
  // Called after load is complete
  renderer.resize(window.innerWidth, window.innerHeight);

  if(stage.filesLoaded == stage.filesToLoad) {
    let bg = stage.get('bg');
    bg.scale.x *= renderer.width/stage.w;
    bg.scale.y *= renderer.height/stage.h;
    // resize transition animation too
    resizeGameContainer();
  }

  stage.w = renderer.width;
  stage.h = renderer.height;
}
/*

function resizeGameContainer() {
  let gameContainer = stage.get('gameContainer');
  let state = gameContainer.state;
  if(state == "archade mode" || state == "zen mode") {
    gameContainer.scale.x *= window.innerWidth/Config.ww;
    gameContainer.scale.y *= window.innerHeight/Config.wh;
  }
  else {
    let scale = window.innerHeight/Config.wh;
    if(window.innerHeight < 400) scale += 0.05;
    // let scale = window.innerWidth/Config.ww;
    gameContainer.scale.x *= scale;
    gameContainer.scale.y *= scale;
  }
}

function resize(){
  // Called after load is complete

  let bg = stage.get('bg');
  bg.scale.x *= window.innerWidth/Config.ww;
  bg.scale.y *= window.innerHeight/Config.wh;
  // resize transition animation too

  resizeGameContainer();
  renderer.resize(window.innerWidth, window.innerHeight);
}*/

function resizeTransitionContainer() {

}

function animate() {
  stage.animate();
  renderer.render(stage);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
animate();


