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
    // limitInitLength: {
    //   type: Number,
    //   default: 30,
    // },
    maxRenderHeight: {
      // 保留多少个 ClientHeight 的高度
      type: Number,
      default: 3,
    },
  },
  data() {
    return {
      range: null,
      newNewsToShow: 0,
      firstNewNewsId: "",
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
      console.log('watch dataSources');
      const isAddNews = newVal.length > oldVal.length;
      console.log('isAddNews: ', isAddNews);
      if (isAddNews) {
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
        // limitInitLength: this.limitInitLength,
      });

      this.range = this.virtual.getRange();
    },
    getDataSourceIds(dataSources) {
      return dataSources.map((item) => item.dataKey);
    },
    updateDataSourceByAdd(newVal, oldVal) {
      const newDataSourceIds = this.getDataSourceIds(newVal);
      this.virtual.updateDataSourceIds(newDataSourceIds);
      let needAutoLocate = false;
      const isAddNewNews = newDataSourceIds[newDataSourceIds.length - 1] !== oldVal[oldVal.length - 1].dataKey;
      if (isAddNewNews) {
        if (this.isScrollInBottom()) {
          // 如果当前滚动条在最下方，则自动滚动到最新一条消息
          needAutoLocate = true;
        } else {
          if (!this.firstNewNewsId)
            this.firstNewNewsId = newDataSourceIds[oldVal.length];

          this.newNewsToShow += newVal.length - oldVal.length;
          this.$emit("updateNewNewsToShow", this.newNewsToShow);
        }
        this.virtual.updateRange(EVENT_TYPE.ADD_NEW_NEWS);
      } else {
        // 拉历史消息
        this.virtual.updateRange(EVENT_TYPE.ADD_OLD_NEWS);
        this.improveRangeInBottom();
        this.$nextTick(() => {
          const topOldNewsId = oldVal[0].dataKey;
          const topOldNewsDom = document.getElementById(topOldNewsId);
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
    improveRangeInBottom() {
      console.log('improveRangeInBottom: ');
      const rootScrollHeight = this.getScrollSize();
      const rootClientHeight = this.getClientSize();
      const num = Math.floor(rootScrollHeight / rootClientHeight) + 1;
      if(num > this.maxRenderHeight) {
        const lastNews = document.getElementById(this.range.endId);
        const newsHeight = lastNews.offsetHeight;
        const newsToDeleteNum = Math.floor((num - this.maxRenderHeight) * (rootClientHeight / newsHeight));
        this.virtual.updateRange(EVENT_TYPE.IMPROVE_BY_DELETE_BOTTOM, newsToDeleteNum);
        this.range = this.virtual.getRange();
      }
    },
    improveRangeInTop() {
      console.log('improveRangeInTop: ');
      const rootScrollHeight = this.getScrollSize();
      const rootClientHeight = this.getClientSize();
      const num = Math.floor(rootScrollHeight / rootClientHeight) + 1;
      if(num > this.maxRenderHeight) {
        const firstNews = document.getElementById(this.range.startId);
        const newsHeight = firstNews.offsetHeight;
        const newsToDeleteNum = Math.floor((num - this.maxRenderHeight) * (rootClientHeight / newsHeight));
        this.virtual.updateRange(EVENT_TYPE.IMPROVE_BY_DELETE_TOP, newsToDeleteNum);
        this.range = this.virtual.getRange();
      }
    },
    updateDataSourceByDelete(newVal, oldVal) {
      if(!newVal.length) {
        this.virtual.resetRange();
      } else {
        const isDeleteFromTop = newVal[newVal.length - 1].dataKey === oldVal[oldVal.length - 1].dataKey;
        const newDataSourceIds = this.getDataSourceIds(newVal);
        this.virtual.updateDataSourceIds(newDataSourceIds);
        if(isDeleteFromTop) {
          this.virtual.updateRange(EVENT_TYPE.DELETE_NEWS_FROM_TOP);
        } else {
          this.virtual.updateRange(EVENT_TYPE.DELETE_NEWS_FROM_BOTTOM);
        }
      }
      this.range = this.virtual.getRange();
    },
    initIntersectionObserver() {
      const options = {
        root,
        rootMargin: "0px",
        threshold: 0.1,
      };

      observer = new IntersectionObserver(this.handleIntersection, options);

      topTarget = document.getElementById("top-target");
      bottomTarget = document.getElementById("bottom-target");

      observer.observe(topTarget); // 开始观察
      observer.observe(bottomTarget); // 开始观察
    },
    handleIntersection(events) {
      console.log("相交了", events);
      if (events.length === 1) {
        const event = events[0];
        const target = event.target;
        if (target.id === "top-target" && event.isIntersecting) {
          return this.handleTopIntersection();
        }
        if (target.id === "bottom-target" && event.isIntersecting) {
          return this.handleBottomIntersection();
        }
      }
    },
    handleTopIntersection() {
      console.log("上面相交了");
      const scrollToIdFromReset = this.virtual.resetFromImproveByTop();
      if(scrollToIdFromReset) {
        this.range = this.virtual.getRange();
        this.$nextTick(() => {
          const scrollToDomFromReset = document.getElementById(scrollToIdFromReset);
          scrollToDomFromReset.scrollIntoView(true);
        });
      } else {
        this.$emit("toTop");
      }
      this.improveRangeInBottom();
    },
    handleBottomIntersection() {
      console.log("下面相交了");
      if(this.virtual.resetFromImproveByBottom()) {
        this.range = this.virtual.getRange();
      } else {
        this.$emit("toBottom");
        if (this.newNewsToShow) {
          // 重置新消息状态
          this.newNewsToShow = 0;
          this.$emit("updateNewNewsToShow", this.newNewsToShow);
        }
      }
      this.improveRangeInTop();
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
    locateOnNews(id) {
      if (!id) return;
      document.getElementById(id).scrollIntoView({
        behavior: 'smooth',
      });
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
      if(!this.dataSources.length) return 0;
      return this.dataSources.findIndex(
        (item) => item.dataKey === dataSourceId
      );
    },
    getRenderSlots() {
      const slots = [];
      const { dataSources, dataComponent } = this;
      if(!dataSources.length) return slots;

      const start = this.getIdxFromId(this.range.startId);
      const end = this.getIdxFromId(this.range.endId);
      const rawDataComponent = toRaw(dataComponent);
      for (let index = start; index <= end; index++) {
        const dataSource = dataSources[index];
        if (dataSource) {
          const dataKey = dataSource["dataKey"];
          if (typeof dataKey === "string" || typeof dataKey === "number") {
            slots.push(
              h(rawDataComponent, {
                itemData: dataSource,
                id: dataKey,
                // uniqueKey: uniqueKey,
                key: dataKey,
              })
            );
          } else {
            console.warn(
              `Cannot get the data-key ${dataKey} from data-sources.`
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
        h("div", {
          id: "top-target",
          style: topTargetStyle,
        }),
        // main list
        h(
          "div",
          {
            role: "group",
            id: "group",
          },
          this.getRenderSlots()
        ),
        // 尾部 target
        h("div", {
          id: "bottom-target",
          style: bottomTargetStyle,
        }),
      ]
    );
  },
};
