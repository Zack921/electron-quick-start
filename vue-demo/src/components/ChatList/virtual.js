// 管理渲染区域 render-range

export const EVENT_TYPE = {
  ADD_OLD_NEWS: 'ADD_OLD_NEWS',
  ADD_NEW_NEWS: 'ADD_NEW_NEWS',
  DELETE_NEWS_FROM_TOP: 'DELETE_NEWS_FROM_TOP',
  DELETE_NEWS_FROM_BOTTOM: 'DELETE_NEWS_FROM_BOTTOM',
  // 保持 range 在合理的范围
  IMPROVE_BY_DELETE_TOP: 'IMPROVE_BY_DELETE_TOP',
  IMPROVE_BY_DELETE_BOTTOM: 'IMPROVE_BY_DELETE_BOTTOM',
}

export default class Virtual {
  constructor(param) {
    this.init(param);
  }
  init(param) {
    // range data
    this.range = {
      startId: '',
      endId: '',
      deleteFromTop: [],
      deleteFromBottom: [],
      deleteNumFromTop: 0,
      deleteNumFromBottom: 0,
    };

    this.dataSourceIds = param.dataSourceIds;
    const length = this.dataSourceIds.length;
    if(length) {
      this.range.startId = this.dataSourceIds[0];
      this.range.endId = this.dataSourceIds[length - 1];
    }
  }
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
      // 以下参数用于动态优化渲染区域
      deleteFromTop: [],
      deleteFromBottom: [],
      deleteNumFromTop: 0,
      deleteNumFromBottom: 0,
    };
  }
  updateDataSourceIds(newVal) {
    this.dataSourceIds = newVal;
  }
  // deleteNum: 需要删减的消息数
  updateRange(type, deleteNum) {
    switch (type) {
      case EVENT_TYPE.ADD_OLD_NEWS:
      case EVENT_TYPE.DELETE_NEWS_FROM_TOP: {
        this.range.startId = this.dataSourceIds[0];
        this.range.deleteFromTop= [];
        this.range.deleteNumFromTop= 0;
        break;
      }
      case EVENT_TYPE.ADD_NEW_NEWS:
      case EVENT_TYPE.DELETE_NEWS_FROM_BOTTOM: {
        this.range.endId = this.dataSourceIds[this.dataSourceIds.length - 1];
        this.range.deleteFromBottom = [];
        this.range.deleteNumFromBottom = 0;
        if(!this.range.startId) this.range.startId = this.dataSourceIds[0]; // 从清空状态添加消息, 此时 startId 为空
        break;
      }
      case EVENT_TYPE.IMPROVE_BY_DELETE_BOTTOM: {
        this.range.deleteFromBottom.push({
          id: this.range.endId,
          deleteNum,
        });
        this.range.deleteNumFromBottom += deleteNum;
        const deleteId = this.dataSourceIds[this.dataSourceIds.length - this.range.deleteNumFromBottom];
        this.range.endId = deleteId;
        break;
      }
      case EVENT_TYPE.IMPROVE_BY_DELETE_TOP: {
        this.range.deleteFromTop.push({
          id: this.range.startId,
          deleteNum,
        });
        this.range.deleteNumFromTop += deleteNum;
        const deleteId = this.dataSourceIds[this.range.deleteNumFromTop];
        this.range.startId = deleteId;
        break;
      }
    }
  }
  resetFromImproveByBottom() {
    console.log('resetFromImproveByBottom: ');
    if(!this.range.deleteFromBottom.length) return false;
    const deleteIdToReset = this.range.deleteFromBottom.pop();
    this.range.endId = deleteIdToReset.id;
    this.range.deleteNumFromBottom -= deleteIdToReset.deleteNum;
    return true;
  }
  resetFromImproveByTop() {
    console.log('resetFromImproveByTop: ');
    if(!this.range.deleteFromTop.length) return false;
    const scrollToId = this.range.startId;
    const deleteIdToReset = this.range.deleteFromTop.pop();
    this.range.startId = deleteIdToReset.id;
    this.range.deleteNumFromTop -= deleteIdToReset.deleteNum;
    return scrollToId;
  }
}