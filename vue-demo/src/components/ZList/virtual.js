// 管理 range
const limitInitLength = 30;

const DIRECTION_TYPE = {
  UP: 'UP', // scroll up
  DOWN: 'DOWN' // scroll down
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

    this.dataSources = param.dataSources;
    const length = this.dataSources.length;
    if(length) {
      this.range.endId = this.dataSources[length - 1].dataKey;
      if(length >= limitInitLength) {
        this.range.startId = this.dataSources[length - limitInitLength].dataKey;
      } else {
        this.range.startId = this.dataSources[0].dataKey;
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

  updateDataSources(newVal) {
    this.dataSources = newVal;
  }

  updateRange(type) {
    // 如果当前滚动条在最下方
    if(type === 'addNews') {
      this.range.endId = this.dataSources[this.dataSources.length - 1].dataKey;
    } else {
      if(this.isUp()) {
        this.range.startId = this.dataSources[0].dataKey;
      }
    }
  }

  isUp () {
    return this.direction === DIRECTION_TYPE.UP;
  }

  isDown () {
    return this.direction === DIRECTION_TYPE.DOWN;
  }

  handleScroll(offset) {
    this.direction = offset < this.offset ? DIRECTION_TYPE.UP : DIRECTION_TYPE.DOWN;
    this.offset = offset;
  }
}