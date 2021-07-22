// 管理 range

// const DIRECTION_TYPE = {
//   UP: 'UP', // scroll up
//   DOWN: 'DOWN' // scroll down
// }

export const EVENT_TYPE = {
  ADD_OLD_NEWS: 'ADD_OLD_NEWS',
  ADD_NEW_NEWS: 'ADD_NEW_NEWS',
  DELETE_NEWS_FROM_TOP: 'DELETE_NEWS_FROM_TOP',
  DELETE_NEWS_FROM_BOTTOM: 'DELETE_NEWS_FROM_BOTTOM',
}

export default class Virtual {
  constructor(param) {
    this.init(param);
  }

  init(param) {
    this.limitInitLength = param.limitInitLength;
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
      if(length >= this.limitInitLength) {
        this.range.startId = this.dataSourceIds[length - this.limitInitLength];
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

  resetRange() {
    this.range = {
      startId: '',
      endId: '',
    };
  }

  updateDataSourceIds(newVal) {
    this.dataSourceIds = newVal;
  }

  updateRange(type) {
    switch (type) {
      case EVENT_TYPE.ADD_OLD_NEWS:
      case EVENT_TYPE.DELETE_NEWS_FROM_TOP: {
        this.range.startId = this.dataSourceIds[0];
        break;
      }
      case EVENT_TYPE.ADD_NEW_NEWS:
      case EVENT_TYPE.DELETE_NEWS_FROM_BOTTOM: {
        this.range.endId = this.dataSourceIds[this.dataSourceIds.length - 1];
        if(!this.range.startId) this.range.startId = this.dataSourceIds[0];
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