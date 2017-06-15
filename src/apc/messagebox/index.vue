<script>
import clickoutside from './../common/clickoutside.js'
import Popup from './../common/popup'

export default {
  name: 'messageBox',
  mixins: [Popup],
  data() {
    return {
      message: '',
      html: '',
    }
  },

  methods: {

    handleClickOutSide() {
      if (this.value) {
        this.doClose();
      }
    },

    doClose() {
      this.value = false;
    }
  },

  directives: {
    clickoutside,
  },

  render() {
    const { value, html } = this;
    const clickoutSideParams = {
      fn: this.handleClickOutSide,
      value: this.value,
    };

    const msgTpl = (
      <div class="message-box">
        <div class="message-box-hd">
          <i class="message-box-close" onClick={this.doClose}></i>
        </div>
        <div class="message-box-bd">
          <div class="message-txt">
            <p>{this.message}</p>
          </div>
        </div>
      </div>
    );
    const htmlTpl = html;

    const showTpl = html ? htmlTpl : msgTpl;
    console.log(value);

    return (
      <div class="message-pop" v-show={this.value} v-clickoutside={clickoutSideParams}>{showTpl}</div>
    );
  }
}
</script>

<style lang="less">
@import './index.less';
</style>
