const { debounce } = require('../../utils/debounce');

Component({
  properties: {
    placeholder: { type: String, value: '搜索...' },
    value: { type: String, value: '' },
    themeClass: { type: String, value: '' }
  },

  data: {
    internalValue: ''
  },

  lifetimes: {
    attached() {
      this.setData({ internalValue: this.data.value });
      this._debouncedInput = debounce((value) => {
        this.triggerEvent('input', { value });
      }, 150);
    }
  },

  observers: {
    'value': function(v) {
      if (v !== this.data.internalValue) {
        this.setData({ internalValue: v });
      }
    }
  },

  methods: {
    onInput(e) {
      const value = e.detail.value;
      this.setData({ internalValue: value });
      this._debouncedInput(value);
    },

    onClear() {
      this.setData({ internalValue: '' });
      this.triggerEvent('input', { value: '' });
    }
  }
});
