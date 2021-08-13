// 管理渲染区域 render-range
export const EVENT_TYPE = {
  ADD_OLD_MSGS: 'ADD_OLD_MSGS',
  ADD_NEW_MSGS: 'ADD_NEW_MSGS',
  RENDER_MSGS_BEFORE_LOCATE: 'RENDER_MSGS_BEFORE_LOCATE',
};

export default class Virtual {
  constructor(param) {
    this.init(param);
  }
  init(param) {
    // 每次优化时, range移动一屏, [要保证大于topOberser.margin, 才会触发topOberser]
    this.msgNumPerScreen = param.msgNumPerScreen; // 单屏可渲染出的最大消息数
    this.maxMsgNum = param.msgNumPerScreen * param.screenNumByRender; // 可渲染出的最大消息数
    // range data
    this.range = {
      startId: '',
      // startIndex: 0, // 先不自行维护index了，先看每次需要动态算的性能如何
    };

    this.dataSourceIds = param.dataSourceIds;
    const { length } = this.dataSourceIds;
    if (length) {
      [this.range.startId] = this.dataSourceIds;
    }
  }
  getRange() {
    const range = Object.create(null);
    range.startId = this.range.startId;
    return range;
  }
  resetRange() {
    this.range = {
      startId: '',
    };
  }
  updateDataSourceIds(newVal) {
    this.dataSourceIds = newVal;
  }
  updateRange(type, params) {
    switch (type) {
      case EVENT_TYPE.ADD_OLD_MSGS: {
        const startIndex = this.dataSourceIds.indexOf(this.range.startId);
        const newStartIdx = Math.min(
          Math.max(startIndex - this.msgNumPerScreen, 0),
          Math.max(this.dataSourceIds.length - this.maxMsgNum, 0),
        );
        this.range.startId = this.dataSourceIds[newStartIdx];
        break;
      }
      case EVENT_TYPE.ADD_NEW_MSGS: {
        const { length } = params;
        // 如果是从空列表添加新消息
        if (!this.range.startId) return ([this.range.startId] = this.dataSourceIds);
        const startIndex = this.dataSourceIds.indexOf(this.range.startId);
        const newStartIdx = Math.min(
          startIndex + length,
          Math.max(this.dataSourceIds.length - this.maxMsgNum, 0),
        );
        this.range.startId = this.dataSourceIds[newStartIdx];
        break;
      }
      case EVENT_TYPE.RENDER_MSGS_BEFORE_LOCATE: {
        const { locateId } = params;
        const locateIdx = this.dataSourceIds.indexOf(locateId);
        const newStartIdx = Math.min(
          Math.max(locateIdx - this.msgNumPerScreen, 0),
          Math.max(this.dataSourceIds.length - this.maxMsgNum, 0),
        );
        this.range.startId = this.dataSourceIds[newStartIdx];
        break;
      }
    }
  }
  restoreMsgFromTop() {
    if (!this.dataSourceIds.length) return false;
    if (this.dataSourceIds[0] === this.range.startId) return false; // 当前 range 已经移到最上方
    const startIndex = this.dataSourceIds.indexOf(this.range.startId);
    const newStartIdx = Math.max(startIndex - this.msgNumPerScreen, 0);
    const newStartId = this.dataSourceIds[newStartIdx];
    if (newStartId) {
      this.range.startId = newStartId;
      return true;
    }
    return false;
  }
  restoreMsgFromBottom() {
    if (!this.dataSourceIds.length) return false;
    const startIndex = this.dataSourceIds.indexOf(this.range.startId);
    const newStartIdx = Math.min(
      startIndex + this.msgNumPerScreen,
      Math.max(this.dataSourceIds.length - this.maxMsgNum, 0),
    );
    if (startIndex === newStartIdx) return false; // 当前 range 已经移到最下方
    const newStartId = this.dataSourceIds[newStartIdx];
    if (newStartId) {
      this.range.startId = newStartId;
      return true;
    }
    return false;
  }
}
