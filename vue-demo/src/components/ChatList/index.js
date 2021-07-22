import { h, toRaw } from "vue";
import Virtual, { EVENT_TYPE } from "./virtual";

let root;
let observer, topTarget, bottomTarget;

export default {
  name: "z-list",
  props: {
    dataSources: {
      type: Array,
      required: true,
    },
    dataComponent: {
      type: [Object, Function],
      required: true,
    },
    initFromBottom: {
      type: Boolean,
      default: true,
    },
    topThreshold: {
      type: Number,
      default: 100,
    },
  },
  data() {
    return {
      range: null,
      newNewsToShow: 0,
      firstNewNewsId: '',
    };
  },
  created() {
    this.installVirtual();
  },
  mounted() {
    root = this.$refs.root;
    if (this.initFromBottom) {
      root.scrollTop = 10000;
    }
    this.initIntersectionObserver();
  },
  watch: {
    dataSources(newVal, oldVal) {
      const newDataSourceIds = this.getDataSourceIds(newVal);
      this.virtual.updateDataSourceIds(newDataSourceIds);
      let needAutoLocate = false;
      const isAddNewNews = newDataSourceIds[newDataSourceIds.length - 1] !== this.range.endId;
      if (isAddNewNews) {
        if (this.isScrollInBottom()) {
          // 如果当前滚动条在最下方，则自动滚动到最新一条消息
          needAutoLocate = true;
        } else {
          if (!this.firstNewNewsId) this.firstNewNewsId = newDataSourceIds[oldVal.length];

          this.newNewsToShow += newVal.length - oldVal.length;
          this.$emit("updateNewNewsToShow", this.newNewsToShow);
        }
        this.virtual.updateRange(EVENT_TYPE.ADD_NEW_NEWS);
      } else {
        // 拉历史消息
        this.virtual.updateRange(EVENT_TYPE.ADD_OLD_NEWS);
        this.$nextTick(() => {
          const topOldNewsIdx = oldVal[0].dataKey;
          const topOldNewsDom = document.getElementById(topOldNewsIdx);
          topOldNewsDom.scrollIntoView(true);
        });
      }

      this.range = this.virtual.getRange();

      this.$nextTick(() => {
        if (needAutoLocate) {
          // 如果当前滚动条在最下方，则自动滚动到最新一条消息
          console.log("gun");
          root.scrollTo({
            top: root.scrollTop + 10000,
            behavior: "smooth",
          });
        }
      });
    },
  },
  methods: {
    installVirtual() {
      this.virtual = new Virtual({
        dataSourceIds: this.getDataSourceIds(this.dataSources),
      });

      this.range = this.virtual.getRange();
    },
    getDataSourceIds(dataSources) {
      return dataSources.map(item => item.dataKey);
    },
    initIntersectionObserver() {
      const options = {
        root,
        rootMargin: '0px',
        threshold: 0.1,
      };
          
      observer = new IntersectionObserver(this.handleIntersection, options);
  
      topTarget = document.getElementById('top-target');
      bottomTarget = document.getElementById('bottom-target');
  
      observer.observe(topTarget); // 开始观察
      observer.observe(bottomTarget); // 开始观察
    },
    handleIntersection(events) {
      console.log('相交了', events);
      if(events.length === 1) {
        const event = events[0];
        const target = event.target;
        if (target.id === 'top-target' && event.isIntersecting) {
          return this.handleTopIntersection();
        }
        if (target.id === 'bottom-target' && event.isIntersecting) {
          return this.handleBottomIntersection();
        }
      }
    },
    handleTopIntersection() {
      console.log('上面相交了');
      this.$emit("toTop");
    },
    handleBottomIntersection() {
      console.log('下面相交了');
      if(this.newNewsToShow) { // 重置新消息状态
        this.newNewsToShow = 0;
        this.$emit("updateNewNewsToShow", this.newNewsToShow);
      }
    },
    isScrollInBottom() {
      const offset = this.getOffset(); // root.scrollTop
      const clientSize = this.getClientSize(); // root.clientHeight
      const scrollSize = this.getScrollSize(); // root.scrollHeight
      return offset + clientSize === scrollSize;
    },
    locateOnNewNews() {
      if (!this.firstNewNewsId) return;
      document.getElementById(this.firstNewNewsId).scrollIntoView(true);
    },
    // return current scroll offset
    getOffset() {
      return root ? Math.ceil(root.scrollTop) : 0;
    },
    // return client viewport size
    getClientSize() {
      return root ? Math.ceil(root.clientHeight) : 0;
    },
    // return all scroll size
    getScrollSize() {
      return root ? Math.ceil(root.scrollHeight) : 0;
    },
    getIdxFromId(dataSourceId) {
      return this.dataSources.findIndex(
        (item) => item.dataKey === dataSourceId
      );
    },
    getRenderSlots() {
      const slots = [];
      const start = this.getIdxFromId(this.range.startId);
      const end = this.getIdxFromId(this.range.endId);
      const { dataSources, dataComponent } = this;
      const rawDataComponent = toRaw(dataComponent);
      for (let index = start; index <= end; index++) {
        const dataSource = dataSources[index];
        if (dataSource) {
          const uniqueKey = dataSource["dataKey"];
          if (typeof uniqueKey === "string" || typeof uniqueKey === "number") {
            slots.push(
              h(rawDataComponent, {
                itemData: dataSource,
                id: uniqueKey,
                // uniqueKey: uniqueKey,
                key: uniqueKey,
              })
            );
          } else {
            console.warn(
              `Cannot get the data-key ${uniqueKey} from data-sources.`
            );
          }
        } else {
          console.warn(`Cannot get the index '${index}' from data-sources.`);
        }
      }
      return slots;
    },
  },
  render() {
    const rootStyle = { overflowY: "auto" };
    const topTargetStyle = { height: "10px" };
    const bottomTargetStyle = { height: "1px" };
    // const padFront = 0;
    // const padBehind = 0;
    // const paddingStyle = { padding: `${padFront}px 0px ${padBehind}px` };

    return h(
      "div",
      {
        ref: "root",
        id: "root",
        role: "root",
        style: rootStyle,
      },
      [
        // 顶部 target
        h(
          "div",
          {
            id: "top-target",
            style: topTargetStyle,
          },
        ),
        // main list
        h(
          "div",
          {
            // class: wrapClass,
            role: "group",
            id: "group",
            // style: wrapperStyle
            // style: paddingStyle,
          },
          this.getRenderSlots()
        ),
        // 尾部 target
        h(
          "div",
          {
            id: "bottom-target",
            style: bottomTargetStyle,
          },
        ),
      ]
    );
  },
};
