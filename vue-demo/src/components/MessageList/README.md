# 聊天列表组件

## 1. Props

| 参数名            | 备注                     | 类型               | 必要性 | 默认值 |
| ----------------- | ------------------------ | ------------------ | ------ | ------ |
| dataSources       | 消息数据列表             | Array              | true   | -      |
| dataComponent     | 消息展示组件             | [Object, Function] | true   | -      |
| initFromBottom    | 从尾部开始展示           | Boolean            | false  | true   |
| msgNumPerScreen   | 单屏可渲染出的最大消息数 | Number             | false  | 10     |
| screenNumByRender | 渲染出的屏数             | Number             | false  | 3      |

## 2. Events

| 事件名              | 备注                     | 必要性 | 默认值 |
| ------------------- | ------------------------ | ------ | ------ |
| toTop               | 滚动条到达顶部触发该回调 | false  | -      |
| toBottom            | 滚动条到达底部触发该回调 | false  | -      |
| updateNewMsgsToShow | 新消息数改变触发该回调   | false  | -      |

## 3. Methods

| 事件名         | 备注                     | 参数                     |
| -------------- | ------------------------ | ------------------------ |
| scrollToNewMsg | 滚到到未读的第一条新消息 | -                        |
| scrollToMsg    | 滚动到指定消息           | [String/Number]: 消息 Id |
