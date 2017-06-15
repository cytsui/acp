<script>
import pop from './../messagebox/index.js'
import { Share, app } from './share.js'

console.log('环境信息', app);
export default {
  name: 'componentShare',
  props: {
    value: {
      type: Boolean,
      default: false,
    }, // 该组件显示状态
    url: {
      type: String,
      required: true,
      propsync: false,
    },
    title: {
      type: String,
      required: true,
      propsync: false,
    },
    pic: {
      type: String,
      required: true,
      propsync: false,
    },
    summary: {
      type: String,
      required: true,
      propsync: false,
    },
    downUrl: {
      type: String,
      default: 'http://shouyou.aipai.com/lieyou/share_plus/down/stat/12949',
      propsync: false,
    },
    icoUrl: {
      type: String,
      default: '//res9.weplay.cn/app/www/templates/mobile/common/js/apm/css/apShare_v2/fpop_share_tip02.png',
      propsync: false,
    },
    fromTxt: {
      type: String,
      default: '爱拍原创',
      propsync: false,
    }
  },

  data() { // 核心属性
    const { url, title, pic, summary, downUrl, icoUrl, fromTxt } = this;
    // 核心实例
    const share = new Share({
      url, title, pic, summary, downUrl, icoUrl, fromTxt,
    });

    return {
      share: share,
      visiable: false,
      hrefs: {
        moment: '',
        wechat: '',
        qq: `http://openmobile.qq.com/api/check?page=shareindex.html&style=9&site=${encodeURIComponent('爱拍原创')}&title=${title + summary}&imageUrl=${pic}&status_os=0&sdkp=0&appid=100380019&action=shareToQQ&targetUrl=${share.getUrl(6)}&page_url=${url}`,
        weibo: `http://v.t.sina.com.cn/share/share.php?appkey=346096344&ralateUid=2719711511&title=${title + summary}&url=${share.getUrl(3)}&pic=${pic}`,
        qzone: `http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${share.getUrl(2)}&title=${title}&desc=&summary=${summary}&site=&pics=${pic}`,
      },
    }
  },

  methods: {

    handlwShow() {
    },

    handleClose() {
      this.$emit('update:value', false);
    },

    handleShare() {
    },

    fullShareTpl(typeString) {
      const classes = `share-full ${typeString}`;
      return (
        <div class={classes} style={{ zIndex: 301, }}>
          <div class="share-pop-pointer">
            <div class="share-pop-finget"></div>
          </div>
          <div class="share-pop-txt"></div>
        </div>
      );
    },

    doWxMoment() { // 微信朋友圈
      const { isWx, isQQ, isUc, isQQB, } = app;
      const type = 'weixinFriend';

      if (isWx) {
        pop({
          html: this.fullShareTpl('wx'),
        })
      } else if (isQQ) {
        pop({
          html: this.fullShareTpl('qq'),
        })
      } else if (isUc || isQQB) {
        this.share.init_qq_uc(type);
      } else {
        pop({
          message: '请长按地址栏复制链接，再打开微信分享给好友或朋友圈~'
        })
      }
    },

    doWxChat() { // 微信好友
      const { isWx, isQQ, isUc, isQQB } = app;
      const type = 'weixin';

      if (isWx) {
        pop({
          html: this.fullShareTpl('wx'),
        })
      } else if (isQQ) {
        pop({
          html: this.fullShareTpl('qq'),
        })
      } else if (isUc || isQQB) {
        this.share.init_qq_uc(type);
      } else {
        pop({
          message: '请长按地址栏复制链接，再打开微信分享给好友或朋友圈~'
        })
      }
    },

    doQQZone() { // QQ空间
      const { isWx, isQQ, isUc, isQQB } = app;
      const type = 'QZone';
      if (isQQ) {
      } else if (isUc || isQQB) {
        this.share.init_qq_uc(type);
      }
    },

    doWeibo() { // 新浪微博
    },

    doQQ(e) {
      const { isWx, isQQ, isUc, isQQB } = app;
      const type = 'QQ';

      if (isUc || isQQB) {
        e.preventDefault();
        this.share.init_qq_uc(type);
      } else {
        e.preventDefault();
        pop({
          message: '请长按地址栏复制链接，再打开QQ分享给好友~'
        })
      }
    },
  },

  watch: {
    value(val) {
      this.visiable = val;
    },

  },
  render(h) {
    const { visiable, share, } = this;
    const shareHdHref = app.isWx ? share.shareHdHrefs.b : share.shareHdHrefs.a;

    return (
      <div class="share-pop" v-show={visiable}>
        <div class="share-cont">
          <div class="share-hd">
            <a href={shareHdHref} class="share-app-download">登录爱拍APP，看更多好玩视频！</a>
          </div>
          <div>
            <ul class="share-box">
              <li class="share-items wxMoment" onClick={this.doWxMoment}>
                <a>
                  <i></i>
                  <p>微信朋友圈</p>
                </a>
              </li>
              <li class="share-items wxChat" onClick={this.doWxChat}>
                <a>
                  <i></i>
                  <p>微信好友</p>
                </a>
              </li>
              <li class="share-items qqZone" onClick={e => this.doQQZone(e)}>
                <a href={this.hrefs.qzone}>
                  <i></i>
                  <p>QQ空间</p>
                </a>
              </li>
              <li class="share-items xlWeibo" onClick={e => this.doWeibo(e)}>
                <a href={this.hrefs.weibo} target="_blank">
                  <i></i>
                  <p>新浪微博</p>
                </a>
              </li>
              <li class="share-items qqChat" onClick={e => this.doQQ(e)}>
                <a href={this.hrefs.qq} >
                  <i></i>
                  <p>QQ好友</p>
                </a>
              </li>
            </ul>
          </div>
          <div class="share-close" onClick={this.handleClose}></div>
        </div>
      </div>
    )
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
