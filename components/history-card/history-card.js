/**
 * 历史记录卡片组件
 * 显示单条历史记录信息
 */

const { formatRelativeTime } = require('../../utils/time');

Component({
  properties: {
    // 历史记录数据
    record: {
      type: Object,
      value: {}
    }
  },

  data: {
    relativeTime: '',
    resultText: '',
    resultClass: ''
  },

  observers: {
    'record': function(record) {
      if (record && record.createdAt) {
        const relativeTime = formatRelativeTime(record.createdAt);

        let resultText = '';
        let resultClass = '';

        if (record.actualResult === 'success') {
          resultText = '成功';
          resultClass = 'success';
        } else if (record.actualResult === 'failure') {
          resultText = '失败';
          resultClass = 'failure';
        } else {
          resultText = '进行中';
          resultClass = 'pending';
        }

        this.setData({
          relativeTime,
          resultText,
          resultClass
        });
      }
    }
  },

  methods: {
    /**
     * 点击卡片
     */
    onTap() {
      this.triggerEvent('tap', { record: this.data.record });
    },

    /**
     * 长按卡片
     */
    onLongPress() {
      this.triggerEvent('longpress', { record: this.data.record });
    }
  }
});