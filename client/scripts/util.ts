'use strict';

export class Util {
  static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
