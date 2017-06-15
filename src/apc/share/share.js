import cookies from "./..//apm/cookie";

var UA = navigator.appVersion;

var qApiSrc = {
  lower: "//3gimg.qq.com/html5/js/qb.js",
  higher: "//jsapi.qq.com/get?api=app.share"
};

var bLevel = {
  qq: {
    forbid: 0,
    lower: 1,
    higher: 2
  },
  uc: {
    forbid: 0,
    allow: 1
  }
};

var isqqBrowser = UA
  .split("MQQBrowser/")
  .length > 1
  ? bLevel.qq.higher
  : bLevel.qq.forbid;

var isucBrowser = UA
  .split("UCBrowser/")
  .length > 1
  ? bLevel.uc.allow
  : bLevel.uc.forbid;

var version = {
  uc: "",
  qq: ""
};

var platform_os = "";

var ucAppList = {
  sinaWeibo: [
    "kSinaWeibo", "SinaWeibo", 11, "新浪微博"
  ],
  weixin: [
    "kWeixin", "WechatFriends", 1, "微信好友"
  ],
  weixinFriend: [
    "kWeixinFriend", "WechatTimeline", "8", "微信朋友圈"
  ],
  QQ: [
    "kQQ", "QQ", "4", "QQ好友"
  ],
  QZone: ["kQZone", "QZone", "3", "QQ空间"]
};

class Share {
  constructor(params) {
    this.url = params.url; //地址
    this.title = params.title; //标题
    this.pic = params.pic; //图片
    this.summary = params.summary; //描述
    this.appid = params.appid;
    this.downUrl = params.downUrl; //下载地址
    this.icoUrl = params.icoUrl;
    this.defparam = params.defparam;
    this.isHideWechat = params.isHideWechat;
    this.hdTit = params.hdTit; //分享框头部,默认false没有
    this.popRef = params.popRef; //微信朋友圈，微信好友分享弹框向下滚动再提示
    this.shareSwitch = params.shareSwitch; //显示，隐藏开关
    this.showFun = params.showFun;
    this.hideFun = params.hideFun;
    this.textClass = params.textClass; //类名
    this.nativeShare = params.nativeShare; //true 为启用uc和qq浏览器的分享功能
    this.fromTxt = params.fromTxt;
    this.shareHdHrefs = {
      a: 'http://shouyou.aipai.com/lieyou/share_plus/down/stat/12949',
      b: `//m.aipai.com/app/www/templates/mobile/down_tips/down_tips.html?down=${encodeURI('http://shouyou.aipai.com/lieyou/share_plus/down/stat/12949')}`
    };
  }

  getQueryStringArgs() {
    var qs = location.search.length > 0
        ? location
          .search
          .substring(1)
        : "",
      args = {},
      items = qs.length
        ? qs.split("&")
        : [],
      item = null,
      name = null,
      value = null,
      i = 0,
      len = items.length;

    for (i = 0; i < len; i++) {
      item = items[i].split("=");
      name = decodeURIComponent(item[0]);
      value = decodeURIComponent(item[1]);
      if (name.length) {
        args[name] = value;
      }
    }
    return args;
  }

  getUrl(type) {
    var url = this.url,
      args = this.getQueryStringArgs(),
      cid = cookies.get("cid") || "",
      paramPlus = this.defparam,
      param = "";

    if (typeof args.b != "undefined") {
      delete args.b;
    }

    //paramPlus = $.extend(args, paramPlus, {'sfrom' : 'mobile', 'stype' : type});
    paramPlus = Object.assign(args, paramPlus, {sfrom: "mobile"});

    for (var key in paramPlus) {
      if (key != "tb" && key != "tob") {
        param += key + "=" + paramPlus[key] + "&";
      }
    }

    if (cid !== "") {
      param += "c=" + cid;
    }

    url = "//" + location.host + location.pathname + "?" + param;
    url = encodeURIComponent(url);
    return url;
  }

  getVersion(c) {
    var a = c.split("."),
      b = parseFloat(a[0] + "." + a[1]);
    return b;
  }

  getPlantform() {
    UA = navigator.userAgent;
    if (UA.indexOf("iPhone") > -1 || UA.indexOf("iPod") > -1) {
      return "iPhone";
    }
    return "Android";
  }

  isloadqqApi() {
    if (isqqBrowser) {
      var b = version.qq < 5.4
        ? qApiSrc.lower
        : qApiSrc.higher;
      var d = document.createElement("script");
      var a = document.getElementsByTagName("body")[0];
      d.setAttribute("src", b);
      a.appendChild(d);
    }
  }

  init_qq_uc(type) {
    var _ts = this;
    platform_os = this.getPlantform();
    version.qq = isqqBrowser
      ? this.getVersion(UA.split("MQQBrowser/")[1])
      : 0;
    version.uc = isucBrowser
      ? this.getVersion(UA.split("UCBrowser/")[1])
      : 0;

    if ((isqqBrowser && version.qq < 5.4 && platform_os == "iPhone") || (isqqBrowser && version.qq < 5.3 && platform_os == "Android")) {
      isqqBrowser = bLevel.qq.forbid;
    } else {
      if (isqqBrowser && version.qq < 5.4 && platform_os == "Android") {
        isqqBrowser = bLevel.qq.lower;
      } else {
        if (isucBrowser && ((version.uc < 10.2 && platform_os == "iPhone") || (version.uc < 9.7 && platform_os == "Android"))) {
          isucBrowser = bLevel.uc.forbid;
        }
      }
    }
    this.isloadqqApi();
    _ts.share(type);
  }

  share(to_app) {
    /*
    * 内部参数
    *
    * url: url,
    * title: title,
    * desc: summary,
    * img: pic,
    * img_title: title,
    * from: fromTxt
    */
    const {url, title, summary, pic, fromTxt} = this;
    const img = pic;
    const img_title = title;
    const desc = summary;

    if (isucBrowser) {
      to_app = to_app === ""
        ? ""
        : platform_os == "iPhone"
          ? ucAppList[to_app][0]
          : ucAppList[to_app][1];

      if (to_app == "QZone") {
        B = "mqqapi://share/to_qzone?src_type=web&version=1&file_type=news&req_type=1&image_u" +
            "rl=" + img + "&title=" + title + "&description=" + desc + "&url=" + url + "&app_name=" + fromTxt;
        (k = document.createElement("div")),
        (k.style.visibility = "hidden"),
        (k.innerHTML = '<iframe src="' + B + '" scrolling="no" width="1" height="1"></iframe>'),
        document
          .body
          .appendChild(k),
        setTimeout(function () {
          k && k.parentNode && k
            .parentNode
            .removeChild(k);
        }, 5e3);
      }
      if (typeof ucweb != "undefined") {
        ucweb.startRequest("shell.page_share", [
          title,
          desc,
          url,
          to_app,
          "",
          "@" + fromTxt,
          ""
        ]);
      } else {
        if (typeof ucbrowser != "undefined") {
          ucbrowser.web_share(title, desc, url, to_app, "", "@" + fromTxt, "");
        } else {}
      }
    } else {
      if (isqqBrowser && !isWeixin) {
        to_app = to_app === ""
          ? ""
          : ucAppList[to_app][2];
        var ah = {
          url: url,
          title: title,
          description: desc,
          img_url: img,
          img_title: img_title,
          to_app: to_app, //微信好友1,腾讯微博2,QQ空间3,QQ好友4,生成二维码7,微信朋友圈8,啾啾分享9,复制网址10,分享到微博11,创意分享13
          cus_txt: "请输入此时此刻想要分享的内容"
        };
        ah = to_app === ""
          ? ""
          : ah;
        if (typeof browser != "undefined") {
          if (typeof browser.app != "undefined" && isqqBrowser == bLevel.qq.higher) {
            browser
              .app
              .share(ah);
          }
        } else {
          if (typeof window.qb != "undefined" && isqqBrowser == bLevel.qq.lower) {
            window
              .qb
              .share(ah);
          } else {}
        }
      } else {}
    }
  }
}

const _ua = navigator
  .userAgent
  .toLowerCase();

const _ua_type = _ua.match(/iphone|ipod|ipad/ig)
  ? 'ios'
  : 'android';

const app = {
  isWx: _ua.match(/MicroMessenger/i) == "micromessenger",
  isUc: _ua.match(/UCBrowser/i) == "ucbrowser",
  isQQB: _ua.match(/MQQBrowser/i) == "mqqbrowser",
  isQQ: _ua.match(/qq\//i) == "qq/"
};
export {Share, app};
