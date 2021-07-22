// 管理 range
const limitInitLength = 30;

// const DIRECTION_TYPE = {
//   UP: 'UP', // scroll up
//   DOWN: 'DOWN' // scroll down
// }

export const EVENT_TYPE = {
  ADD_OLD_NEWS: 'ADD_OLD_NEWS',
  ADD_NEW_NEWS: 'ADD_NEW_NEWS',
}

export default class Virtual {
  constructor(param) {
    this.init(param);
  }

  init(param) {
    // scroll data
    this.offset = 0;
    this.direction = '';
    // range data
    this.range = {
      startId: '',
      endId: '',
    };

    this.dataSourceIds = param.dataSourceIds;
    const length = this.dataSourceIds.length;
    if(length) {
      this.range.endId = this.dataSourceIds[length - 1];
      if(length >= limitInitLength) {
        this.range.startId = this.dataSourceIds[length - limitInitLength];
      } else {
        this.range.startId = this.dataSourceIds[0];
      }
    }
  }

  // return current render range
  getRange() {
    const range = Object.create(null);
    range.startId = this.range.startId;
    range.endId = this.range.endId;
    return range;
  }

  updateDataSourceIds(newVal) {
    this.dataSourceIds = newVal;
  }

  updateRange(type) {
    switch (type) {
      case EVENT_TYPE.ADD_OLD_NEWS: {
        this.range.startId = this.dataSourceIds[0];
        break;
      }
      case EVENT_TYPE.ADD_NEW_NEWS: {
        this.range.endId = this.dataSourceIds[this.dataSourceIds.length - 1];
        break;
      }
    }
  }

  // isUp () {
  //   return this.direction === DIRECTION_TYPE.UP;
  // }

  // isDown () {
  //   return this.direction === DIRECTION_TYPE.DOWN;
  // }

  // handleScroll(offset) {
  //   this.direction = offset < this.offset ? DIRECTION_TYPE.UP : DIRECTION_TYPE.DOWN;
  //   this.offset = offset;
  // }
}