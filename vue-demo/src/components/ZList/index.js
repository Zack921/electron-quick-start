import { h, toRaw } from "vue";
import _ from "lodash";
import Virtual from "./virtual";

let root;

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
      emitToTopLock: false,
      newNewsToShow: 0,
      firstNewNewsId: '',
    };
  },
  created() {
    this.installVirtual();
  },
  mounted() {
    if (this.initFromBottom) {
      root = this.$refs.root;
      root.scrollTop = 1000;
    }
  },
  watch: {
    dataSources(newVal, oldVal) {
      this.emitToTopLock = false;
      this.virtual.updateDataSources(newVal);
      let needAutoLocate = false;
      if (newVal[newVal.length - 1].dataKey !== this.range.endId) {
        // 新增消息
        const offset = this.getOffset(); // root.scrollTop
        const clientSize = this.getClientSize(); // root.clientHeight
        const scrollSize = this.getScrollSize(); // root.scrollHeight
        if (offset + clientSize === scrollSize) {
          // 如果当前滚动条在最下方，则自动滚动到最新一条消息
          needAutoLocate = true;
        } else {
          if (!this.firstNewNewsId) this.firstNewNewsId = newVal[oldVal.length].dataKey;

          this.newNewsToShow += newVal.length - oldVal.length;
          this.$emit("updateNewNewsToShow", this.newNewsToShow);
        }
        this.virtual.updateRange("addNews");
      } else {
        this.virtual.updateRange("up");
      }

      this.range = this.virtual.getRange();

      this.$nextTick(() => {
        if (needAutoLocate) {
          // 如果当前滚动条在最下方，则自动滚动到最新一条消息
          console.log("gun");
          root.scrollTo({
            top: root.scrollTop + 1000,
            behavior: "smooth",
          });
        }
      });
    },
  },
  methods: {
    installVirtual() {
      this.virtual = new Virtual({
        dataSources: this.dataSources,
        // uniqueIds: this.getUniqueIdFromDataSources()
      });

      // sync initial range
      this.range = this.virtual.getRange();
    },
    onScroll: _.throttle(function() {
      console.log("onScroll: ");

      const offset = this.getOffset(); // root.scrollTop
      const clientSize = this.getClientSize(); // root.clientHeight
      const scrollSize = this.getScrollSize(); // root.scrollHeight

      if (offset + clientSize === scrollSize) {
        // 如果当前滚动条在最下方，则重置 newNewsToShow
        this.newNewsToShow = 0;
        this.$emit("updateNewNewsToShow", this.newNewsToShow);
      }

      this.virtual.handleScroll(offset);
      this.emitEvent(offset);
    }, 100),
    emitEvent(offset) {
      // this.$emit('scroll', evt, this.virtual.getRange())

      if (
        this.virtual.isUp() &&
        !this.emitToTopLock &&
        offset <= this.topThreshold
      ) {
        this.$emit("totop");
        this.emitToTopLock = true;
      }
      //  else if (this.virtual.isDown() && (offset + clientSize + this.bottomThreshold >= scrollSize)) {
      //   this.$emit('tobottom')
      // }
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
    const padFront = 0;
    const padBehind = 0;
    const paddingStyle = { padding: `${padFront}px 0px ${padBehind}px` };

    return h(
      "div",
      {
        ref: "root",
        id: "root",
        role: "root",
        onscroll: this.onScroll,
        style: rootStyle,
      },
      [
        // main list
        h(
          "div",
          {
            // class: wrapClass,
            role: "group",
            id: "group",
            // style: wrapperStyle
            style: paddingStyle,
          },
          this.getRenderSlots()
        ),
      ]
    );
  },
};
