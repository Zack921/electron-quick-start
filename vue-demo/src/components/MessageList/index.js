import { h, toRaw } from 'vue';
import Virtual, { EVENT_TYPE } from './virtual';

export default {
  name: 'MessageList',
  props: {
    dataSources: {
      type: Array,
      required: true,
    },
    dataKey: {
      // key值，不传默认取"dataKey"
      type: String,
      default: 'dataKey',
    },
    dataComponent: {
      type: [Object, Function],
      required: true,
    },
    initFromBottom: {
      type: Boolean,
      default: true,
    },
    msgNumPerScreen: {
      // 单屏可渲染出的最大消息数
      type: Number,
      default: 10,
    },
    screenNumByRender: {
      // 渲染出的屏数
      type: Number,
      default: 3,
    },
  },
  data() {
    return {
      range: null,
      isBottomIntersection: false,
      newMsgsToShow: 0,
      firstNewMsgId: '',
      topObserver: null,
      bottomObserver: null,
      topTarget: null,
      bottomTarget: null,
    };
  },
  created() {
    this.installVirtual();
  },
  mounted() {
    if (this.initFromBottom) {
      this.root.scrollTop = this.getScrollSize();
    }
    this.initIntersectionObserver();
  },
  unmounted() {
    this.topObserver.disconnect();
    this.bottomObserver.disconnect();
  },
  computed: {
    root() {
      return this.$refs.mlRoot;
    },
    renderList() {
      const { dataSources } = this;
      if (!dataSources.length) return [];
      const start = this.getIdxFromId(this.range.startId);
      const maxMsgNum = this.msgNumPerScreen * this.screenNumByRender;
      const end = Math.min(start + maxMsgNum - 1, dataSources.length - 1);
      return dataSources.slice(start, end + 1);
    },
  },
  watch: {
    dataSources(newVal, oldVal) {
      const isAddMsgs = newVal.length && newVal.length > oldVal.length;
      if (isAddMsgs) {
        // 拉取历史消息 或 拉取新消息
        this.updateDataSourceByAdd(newVal, oldVal);
      } else {
        // 业务删减 dataSources, 避免列表过大影响性能
        console.log('updateDataSourceByDelete: ');
        this.updateDataSourceByDelete(newVal, oldVal);
      }
    },
  },
  methods: {
    installVirtual() {
      this.virtual = new Virtual({
        dataSourceIds: this.getDataSourceIds(this.dataSources),
        msgNumPerScreen: this.msgNumPerScreen,
        screenNumByRender: this.screenNumByRender,
      });

      this.range = this.virtual.getRange();
    },
    initIntersectionObserver() {
      const options = {
        root: this.root,
        rootMargin: `${this.root.offsetHeight}px 0px`, // 上下都预渲染'一屏'
        threshold: 1,
      };

      // eslint-disable-next-line jest/unbound-method
      this.topObserver = new IntersectionObserver(
        this.handleTopIntersection.bind(this),
        options,
      );
      // eslint-disable-next-line jest/unbound-method
      this.bottomObserver = new IntersectionObserver(
        this.handleBottomIntersection.bind(this),
        options,
      );

      this.topTarget = document.getElementById('ml-top-target');
      this.bottomTarget = document.getElementById('ml-bottom-target');

      this.topObserver.observe(this.topTarget);
      this.bottomObserver.observe(this.bottomTarget);
    },
    handleTopIntersection(events) {
      if (events.length) {
        const event = events[0];
        if (event.isIntersecting) {
          console.log('上面相交了');
          const hasRestoreFromTop = this.virtual.restoreMsgFromTop();
          console.log('restoreMsgFromTop: ', hasRestoreFromTop);
          if (hasRestoreFromTop) {
            this.range = this.virtual.getRange();
          } else {
            if (this.dataSources.length) this.$emit('toTop'); // 当前列表不为空，才拉历史消息
          }
        }
      }
    },
    handleBottomIntersection(events) {
      if (events.length) {
        const event = events[0];
        this.isBottomIntersection = event.isIntersecting;
        if (event.isIntersecting) {
          console.log('下面相交了');
          const hasRestoreFromBottom = this.virtual.restoreMsgFromBottom();
          console.log('restoreMsgFromBottom: ', hasRestoreFromBottom);
          if (hasRestoreFromBottom) {
            this.range = this.virtual.getRange();
          } else {
            this.$emit('toBottom');
            if (this.newMsgsToShow) {
              // 重置新消息状态
              this.newMsgsToShow = 0;
              this.$emit('updateNewMsgsToShow', this.newMsgsToShow);
            }
          }
        }
      }
    },
    getDataSourceIds(dataSources) {
      return dataSources.map(item => item[this.dataKey]);
    },
    updateDataSourceByAdd(newVal, oldVal) {
      const newDataSourceIds = this.getDataSourceIds(newVal);
      this.virtual.updateDataSourceIds(newDataSourceIds);
      const isAddNewMsgs
        = !oldVal.length // 因为空列表不允许拉历史消息，所以只可能是拉新消息
        || newDataSourceIds[newDataSourceIds.length - 1]
          !== oldVal[oldVal.length - 1][this.dataKey];
      if (isAddNewMsgs) {
        this.handleAddNewMsgs(newVal, oldVal);
      } else {
        this.handleAddOldMsgs(oldVal);
      }
    },
    handleAddNewMsgs(newVal, oldVal) {
      // 拉新消息
      const newDataSourceIds = this.getDataSourceIds(newVal);
      this.virtual.updateDataSourceIds(newDataSourceIds);
      let needAutoLocate = false;

      if (this.isBottomIntersection) {
        // 如果当前滚动条在底部，但是在相交检测区域外
        const newMsgsLength = newVal.length - oldVal.length;
        this.virtual.updateRange(EVENT_TYPE.ADD_NEW_MSGS, {
          length: newMsgsLength,
        });
      }

      if (this.isScrollInBottom()) {
        // 如果当前滚动条在最下方，则自动滚动到最新一条消息
        needAutoLocate = true;
      } else {
        if (!this.firstNewMsgId) this.firstNewMsgId = newDataSourceIds[oldVal.length];

        this.newMsgsToShow += newVal.length - oldVal.length;
        this.$emit('updateNewMsgsToShow', this.newMsgsToShow);
      }

      this.range = this.virtual.getRange();

      this.$nextTick(() => {
        console.log('needAutoLocate', needAutoLocate);
        if (needAutoLocate) {
          // 如果当前滚动条在最下方，则自动滚动到最新一条消息
          console.log('自动滚动到最新一条消息');
          this.scrollToMsg(
            newDataSourceIds[newDataSourceIds.length - 1],
            'end',
          );
        }
      });
    },
    handleAddOldMsgs(oldVal) {
      // 拉历史消息
      this.virtual.updateRange(EVENT_TYPE.ADD_OLD_MSGS);
      this.range = this.virtual.getRange();
      this.$nextTick(() => {
        // 异步拉数据的时候需要重新定位
        const topOldMsgId = oldVal[0][this.dataKey];
        this.scrollToMsg(topOldMsgId);
      });
    },
    updateDataSourceByDelete(newVal) {
      const newDataSourceIds = this.getDataSourceIds(newVal);
      this.virtual.updateDataSourceIds(newDataSourceIds);
      if (!newVal.length) {
        // 清空所有消息
        this.virtual.resetRange();
      }
      this.range = this.virtual.getRange();
    },
    scrollToNewMsg() {
      if (!this.firstNewMsgId) return;
      this.scrollToMsg(this.firstNewMsgId, 'end');
    },
    scrollToMsg(id, block = 'start') {
      console.log('scrollToMsg: ', id);
      if (!id) return;
      if (
        this.dataSources.findIndex(item => item[this.dataKey] === id) === -1
      ) return console.error(`当前列表无此消息：${id}`);
      if (
        this.renderList.findIndex(item => item[this.dataKey] === id) === -1
      ) {
        this.virtual.updateRange(EVENT_TYPE.RENDER_MSGS_BEFORE_LOCATE, {
          locateId: id,
        });
        this.range = this.virtual.getRange();
        return this.$nextTick(() => {
          // 暂时不用 smooth ，避免滚动条延时滚动时，来新消息，可能会导致相交判断异常
          document.getElementById(id).scrollIntoView({
            block,
          });
        });
      }
      document.getElementById(id).scrollIntoView({
        block,
      });
    },
    isScrollInBottom() {
      const offset = this.getOffset(); // root.scrollTop
      const clientSize = this.getClientSize(); // root.clientHeight
      const scrollSize = this.getScrollSize(); // root.scrollHeight
      return offset + clientSize >= scrollSize - 1; // 给个 1px 的误差值
    },
    getOffset() {
      return this.root ? Math.ceil(this.root.scrollTop) : 0;
    },
    getClientSize() {
      return this.root ? Math.ceil(this.root.clientHeight) : 0;
    },
    getScrollSize() {
      return this.root ? Math.ceil(this.root.scrollHeight) : 0;
    },
    getIdxFromId(dataSourceId) {
      if (!this.dataSources.length) return 0;
      return this.dataSources.findIndex(item => item[this.dataKey] === dataSourceId);
    },
    getRenderSlots() {
      const slots = [];
      const { renderList, dataComponent } = this;

      const rawDataComponent = toRaw(dataComponent);
      for (let index = 0; index < renderList.length; index++) {
        const dataSource = renderList[index];
        if (dataSource) {
          const dataKey = dataSource[this.dataKey];
          if (typeof dataKey === 'string' || typeof dataKey === 'number') {
            slots.push(h(rawDataComponent, {
              itemData: dataSource,
              id: dataKey,
              key: dataKey,
            }));
          } else {
            console.warn(`Cannot get the data-key ${dataKey} from data-sources.`);
          }
        } else {
          console.warn(`Cannot get the index '${index}' from data-sources.`);
        }
      }
      return slots;
    },
  },
  render() {
    const rootStyle = { overflowY: 'auto' };
    const topTargetStyle = { height: '0px' };
    const bottomTargetStyle = { height: '0px' };

    return h(
      'div',
      {
        ref: 'mlRoot',
        id: 'ml-root',
        style: rootStyle,
      },
      [
        // 顶部 target
        h('div', {
          id: 'ml-top-target',
          style: topTargetStyle,
        }),
        // main list
        h(
          'div',
          {
            id: 'group',
          },
          this.getRenderSlots(),
        ),
        // 尾部 target
        h('div', {
          id: 'ml-bottom-target',
          style: bottomTargetStyle,
        }),
      ],
    );
  },
};
