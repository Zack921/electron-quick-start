# 聊天列表组件

## 1. Props
| 参数名 | 备注 | 类型 | 必要性 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| dataSources | 消息数据列表 | Array | true | - |
| dataComponent | 消息展示组件 | [Object, Function] | true | - |
| initFromBottom | 消息数据列表 | Boolean | false | true |
| maxRenderHeight | 渲染区域高度 | Number | 3 | - |

maxRenderHeight: 表示当前渲染区域保留多少个 ClientHeight 的高度，组件默认会动态优化列表，维持当前渲染出的消息在一定数量。

## 2. Events
| 事件名 | 备注 | 必要性 | 默认值 |
| ---- | ----  | ---- | ---- |
| toTop | 滚动条到达顶部触发该回调 | false | - |
| toBottom | 滚动条到达底部触发该回调 | false | - |
| updateNewNewsToShow | 新消息数改变触发该回调 | false | - |

## 3. Methods
| 事件名 | 备注 | 参数 |
| ---- | ----  | ---- |
| locateOnNewNews | 滚到到未读的第一条新消息 | - |
| locateOnNews | 滚动到指定消息 | [String/Number]: 消息Id |