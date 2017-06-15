/*
 * Svn : $Revision: 93874 $
 * LastEdit : $Date: 2016-01-01 $
 * LastEditBy : $Author: chenwenxian $
*/

define(function (require, exports, module) {
    var $ = require('$'),
        apm = require('apm'),
        pop = require('pop'),
        cookies = require('cookies'),
        _ua = navigator.userAgent.toLowerCase(),
        _ua_type = _ua.match(/iphone|ipod|ipad/ig) ? 'ios' : 'android',
        //APP内部
        /*
        _isweiboApp = (_ua.match(/WeiBo/i) == "weibo") ? true : false,
        _isqqApp = (_ua.match(/QQ/i) == "qq") ? true : false,*/
        _isweixin = (_ua.match(/MicroMessenger/i) == "micromessenger") ? true : false,
        _isuc = (_ua.match(/UCBrowser/i) == "ucbrowser") ? true : false,
        _isqq = (_ua.match(/MQQBrowser/i) == "mqqbrowser") ? true : false,
        _isqqNative = (_ua.match(/qq\//i) == "qq/") ? true : false;

        var apShare = function(opt){
            var defOpt = {
                url : '',                    //地址
                title : '',                  //标题
                pic : '',                    //图片
                summary : '',                //描述
                appid : '',
                downUrl:'http://shouyou.aipai.com/lieyou/share_plus/down/stat/12949',//下载地址
                icoUrl:'//res9.weplay.cn/app/www/templates/mobile/common/js/apm/css/apShare_v2/fpop_share_tip02.png?dsf',//icon
                defparam : {},
                isHideWechat : false,
                hdTit : '',                  //分享框头部,默认false没有
                popRef : '',                 //微信朋友圈，微信好友分享弹框向下滚动再提示
                shareSwitch : false,            //显示，隐藏开关
                showFun : '',
                hideFun : '',
                textClass:'', //类名
                nativeShare : true         //true 为启用uc和qq浏览器的分享功能
            };
            this.opt = $.extend(defOpt, opt);
        };

    require("./css/apShare_v3.css");
    var qApiSrc = {
        lower: "//3gimg.qq.com/html5/js/qb.js",
        higher: "//jsapi.qq.com/get?api=app.share"
    };
    var bLevel = {
        qq: {forbid: 0, lower: 1, higher: 2},
        uc: {forbid: 0, allow: 1}
    };
    var UA = navigator.appVersion;
    var isqqBrowser = (UA.split("MQQBrowser/").length > 1) ? bLevel.qq.higher : bLevel.qq.forbid;
    var isucBrowser = (UA.split("UCBrowser/").length > 1) ? bLevel.uc.allow : bLevel.uc.forbid;
    var version = {
        uc: "",
        qq: ""
    };
    var init = function (dom, opt) {
        _apShare = new apShare(opt);
        _apShare.init(dom);
    };
    var ucAppList = {
        sinaWeibo: ['kSinaWeibo', 'SinaWeibo', 11, '新浪微博'],
        weixin: ['kWeixin', 'WechatFriends', 1, '微信好友'],
        weixinFriend: ['kWeixinFriend', 'WechatTimeline', '8', '微信朋友圈'],
        QQ: ['kQQ', 'QQ', '4', 'QQ好友'],
        QZone: ['kQZone', 'QZone', '3', 'QQ空间']
    };
    apShare.prototype = {
        constructor: apShare,
        //分享配置参数
        config: {
            sqqUrl : '',
            qzoneUrl : '',
            txUrl : '',
            renrenUrl : '',
            sinaUrl : '',
            net163Url : ''
        },
        instance : false,
        ainTime : null,
        init: function (dom) {
            var _ts = this,
                _dom = $(dom),
                $share = $('.fpop_share');

            _ts.$share = $share;

            if(_ts.opt.hdTit){
                $share.prepend('<a class="share_tit_down" href="'+ _ts.opt.downUrl +'" ><div class="share_tit '+ _ts.opt.textClass +'"><div class="left_icon"><img src="'+ _ts.opt.icoUrl +'" /></div><p>'+_ts.opt.hdTit+'</p></div></a>').addClass('fpop_share_tit');
            }
            _ts.bind();
            _dom.on('click', function () {
                
                if (_ts.instance) {
                    if(_ts.opt.shareSwitch){
                        if($share.css('display') ==='none'){
                            $share.show();
                            if(typeof _ts.opt.showFun === 'function'){_ts.opt.showFun();}
                        }else{
                            $share.hide();
                            if(typeof _ts.opt.hideFun === 'function'){_ts.opt.hideFun();}
                        }
                    }else{
                        $share.show();
                        if(typeof _ts.opt.showFun === 'function'){_ts.opt.showFun();}
                    }
                    return false;
                }
                _ts.instance = true;
                //插入DOM
                $share.find('ul').html(_ts.getShareDom());
                //微信特殊处理
                _ts.bind();
                if(_ts.opt.shareSwitch){
                    if($share.css('display') ==='none'){
                        $share.show();
                        if(typeof _ts.opt.showFun === 'function'){_ts.opt.showFun();}
                    }else{
                        $share.hide();
                        if(typeof _ts.opt.hideFun === 'function'){_ts.opt.hideFun();}
                    }
                }else{
                    $share.show();
                    if(typeof _ts.opt.showFun === 'function'){_ts.opt.showFun();}
                }
                $share.off('click').on('click', '.close', function () {
                    $share.hide();
                    if(typeof _ts.opt.hideFun === 'function'){_ts.opt.hideFun();}
                });
                
                return false;
            });
            if(_isweixin){
                $('.fpop_share .share_tit_down').on('click', function(){
                    location.href = '//m.aipai.com/app/www/templates/mobile/down_tips/down_tips.html?down='+encodeURI($(this).attr('href'));
                    return false;
                });
            }
        },
        getUrl : function(type) {
            var url = this.opt.url,
                args = apm.getQueryStringArgs(),
                cid = cookies.get('cid') || '',
                paramPlus = this.opt.defparam,
                param = '';
            
            if(typeof args.b !='undefined'){
                delete args.b;
            }

            //paramPlus = $.extend(args, paramPlus, {'sfrom' : 'mobile', 'stype' : type});
            paramPlus = $.extend(args, paramPlus, {'sfrom' : 'mobile'});

            for(var key in paramPlus){
                if(key != 'tb' && key != 'tob'){
                    param += key +'='+paramPlus[key]+'&';
                }
            }

            if(cid !== ''){
                param += 'c='+cid;
            }
            
            url = '//' + location.host + location.pathname + '?' +param;
            url = encodeURIComponent(url);
            return url;
        },
        convertToUrl: function () {
            var _ts = this,
                _c = _ts.config,
                summary1 = (_ts.opt.summary !=='') ? ':'+_ts.opt.summary : '',
                getUrl2 = _ts.getUrl(2);
            //QQ好友和群
            _c.sqqUrl = "http://openmobile.qq.com/api/check?page=shareindex.html&style=9&site="+encodeURIComponent("爱拍原创")+"&title="+_ts.opt.title+summary1+"&imageUrl="+_ts.opt.pic+"&status_os=0&sdkp=0&appid=100380019&action=shareToQQ&targetUrl="+_ts.getUrl(6)+"&page_url="+_ts.opt.url;
            //QQ空间
            _c.qzoneUrl = "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url="+ getUrl2+"&title="+_ts.opt.title+"&desc=&summary="+_ts.opt.summary+"&site=&pics="+_ts.opt.pic;
            //腾讯微博
            _c.txUrl = "http://v.t.qq.com/share/share.php?appkey=801265498&site=http://www.aipai.com&title="+_ts.opt.title+summary1+"&url="+_ts.getUrl(4)+"&pic="+_ts.opt.pic;
            //人人网
            _c.renrenUrl = "http://widget.renren.com/dialog/share?resourceUrl="+_ts.opt.url+"&srcUrl="+_ts.getUrl(7)+"&title="+_ts.opt.title+summary1+"&description=&pic="+_ts.opt.pic;
            //新浪微博
            _c.sinaUrl = "http://v.t.sina.com.cn/share/share.php?appkey=346096344&ralateUid=2719711511&title="+_ts.opt.title+summary1+"&url="+_ts.getUrl(3)+"&pic="+_ts.opt.pic;
            //网易微博
            _c.net163Url = "http://t.163.com/article/user/checkLogin.do?&info="+_ts.opt.title+summary1+"-"+_ts.opt.url+"&link="+_ts.opt.url+"&source="+encodeURIComponent("爱拍游戏");            
        },
        getShareDom: function () {
            var _ts = this,
                _c = _ts.config,
                wechat = '<li class="wxq share_btn" data-app="weixinFriend"><a href="#"><em>微信朋友圈</em></a></li>\
                    <li class="wxf share_btn" data-app="weixin"><a href="#"><em>微信好友</em></a></li>';

            _ts.convertToUrl();

            //sdk里隐藏微信分享
            if(_ts.opt.isHideWechat){
                wechat = '';
            }

            var _dom = wechat + '<li class="qz share_btn" data-app="QZone"><a href="'+_c.qzoneUrl+'" target="_blank"><em>QQ空间</em></a></li>\
                        <li class="sina share_btn" data-app="sinaWeibo"><a href="'+_c.sinaUrl+'" target="_blank"><em>新浪微博</em></a></li>\
                        <li class="tx"><a href="'+_c.txUrl+'" target="_blank"><em>腾讯微博</em></a></li>\
                        <li class="qq share_btn" data-app="QQ"><a href="'+_c.sqqUrl+'" target="_blank"><em>QQ好友</em></a></li>';
                        //<li class="rr"><a href="'+_c.renrenUrl+'" target="_blank"><em>人人网</em></a></li>
            return _dom;
        },
        bind: function () {
            var _ts = this,
                ua = navigator.userAgent,
                ref = _ts.opt.popRef;
            //分享到微信
            $('.wxf, .wxq').off('click').on('click', 'a', function () {
                var $th = $(this);
                
                //微信客户端
                if (_isweixin) {
                    _ts.popTip($th, 'weixin');
                    return false;
                }if(_isqqNative){
                    _ts.popTip($th, 'qq');
                    return false;
                }else if (!_isuc && !_isqq) { //非QQ,UC浏览器特殊处理
                    if(ref){
                        pop({
                            ref : $th,
                            msg: '请长按地址栏复制链接，再打开微信分享给好友或朋友圈~',
                            btns: [],
                            onShow: function ($pop, thisPop) {
                                $pop.css('top','330px');
                                $('#pop_overlay').one('click', function () {
                                    thisPop.remove();
                                });
                            }
                        });
                    }else{
                        pop({
                            msg: '请长按地址栏复制链接，再打开微信分享给好友或朋友圈~',
                            btns: [],
                            onShow: function ($pop, thisPop) {
                                $('#pop_overlay').one('click', function () {
                                    thisPop.remove();
                                });
                            }
                        });
                    }
                    return false;
                }else {
                    if(ref){
                        pop({
                            ref : $th,
                            con: '<div class="pm_share_wechat"></div>',
                            btns: [],
                            onShow: function ($pop, thisPop) {
                                $('#pop_overlay').one('click', function () {
                                    thisPop.remove();
                                });
                            }
                        });
                    }else{
                        pop({
                            con: '<div class="pm_share_wechat"></div>',
                            btns: [],
                            onShow: function ($pop, thisPop) {
                                $('#pop_overlay').one('click', function () {
                                    thisPop.remove();
                                });
                            }
                        });
                    }
                    return false;
                }
                return false;
            });
            if (!_isweixin) {
                //分享到qq
                if(!_isqqNative){
                    $('.qq').off('click').on('click', 'a', function () {
                        var $th = $(this);
                        
                        if(ref){
                            pop({
                                // ref : $th,
                                msg: '请长按地址复制链接，再打开QQ分享给好友或朋友圈~',
                                btns: [],
                                onShow: function ($pop, thisPop) {
                                    $pop.css('top','330px');
                                    $('#pop_overlay').one('click', function () {
                                        thisPop.remove();
                                    });
                                }
                            });
                        }else{
                            pop({
                                msg: '请长按地址复制链接，再打开QQ分享给好友或朋友圈~',
                                btns: [],
                                onShow: function ($pop, thisPop) {
                                    $('#pop_overlay').one('click', function () {
                                        thisPop.remove();
                                    });
                                }
                            });
                        }
                        return false;
                    });
                }
                //uc及qq浏览器
                
                if(this.opt.nativeShare){
                    _ts.init_qq_uc();
                }
            }
                
        },
        popTip : function($th, ty){//ty: qq; weixin
            var _ts = this,
                $share = _ts.$share,
                ref = _ts.opt.popRef,
                popClass = (ty === 'qq') ? 'pop_apShare_qq' : 'pop_apShare_weixin',
                html = '<div class="pop_apShare '+popClass+'">\
                    <div class="stance icons_con">\
                        <img class="stance_bg" src="//res9.weplay.cn/app/www/templates/mobile/common/js/apm/css/apShare_v2/icons_bg.png" alt="" />\
                        <div class="stance_con icons"></div>\
                        <div class="tip_ain"></div>\
                    </div>\
                    <div class="stance btn_con">\
                        <img class="stance_bg" src="//res9.weplay.cn/app/www/templates/mobile/common/js/apm/css/apShare_v2/foot_btns01.png" alt="" />\
                        <div class="stance_con btns"></div>\
                    </div>\
                </div>';
                
            if(ref){
                pop({
                    ref : $th,
                    id : 'pop_apShareId',
                    con: html,
                    btns: [],
                    onClose : function(){
                        clearInterval(_ts.ainTime);
                        _ts.ainTime = null;
                        $('#pop_overlay').removeClass('overlay_apShare');
                    },
                    onShow: function ($pop, thisPop) {
                        $('#pop_overlay').addClass('overlay_apShare');
                        _ts.ain($pop.find('.tip_ain'), 'tip_ain2');
                        $pop.on('click', function(){
                            thisPop.remove();
                        });
                        $('#pop_overlay').one('click', function () {
                            thisPop.remove();
                        });
                    }
                });
            }else{
                pop({
                    id : 'pop_apShareId',
                    con: html,
                    btns: [],
                    onClose : function(){
                        clearInterval(_ts.ainTime);
                        _ts.ainTime = null;
                        $('#pop_overlay').removeClass('overlay_apShare');
                    },
                    onShow: function ($pop, thisPop) {
                        $('#pop_overlay').addClass('overlay_apShare');
                        _ts.ain($pop.find('.tip_ain'), 'tip_ain2');
                        $pop.on('click', function(){
                            thisPop.remove();
                        });
                        $('#pop_overlay').one('click', function () {
                            thisPop.remove();
                        });
                    }
                });
            }
            $share.find('.close').click();
            return false;
        },
        ain : function($th, cl){
            var _ts = this;
            _ts.ainTime = setInterval(function(){
                if( $th.hasClass(cl) ){
                    $th.removeClass(cl);
                }else{
                    $th.addClass(cl);
                }
            }, 500);
        },
        getPlantform : function () {
            ua = navigator.userAgent;
            if ((ua.indexOf("iPhone") > -1 || ua.indexOf("iPod") > -1)) {
                return "iPhone";
            }
            return "Android";
        },
        is_weixin : function () {
            var a = UA.toLowerCase();
            if (a.match(/MicroMessenger/i) == "micromessenger") {
                return true;
            } else {
                return false;
            }
        },
        getVersion : function (c) {
            var a = c.split("."), b = parseFloat(a[0] + "." + a[1]);
            return b;
        },
        init_qq_uc : function () {
            var _ts = this;
            platform_os = this.getPlantform();
            version.qq = isqqBrowser ? this.getVersion(UA.split("MQQBrowser/")[1]) : 0;
            version.uc = isucBrowser ? this.getVersion(UA.split("UCBrowser/")[1]) : 0;
            isWeixin = this.is_weixin();

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
            if (isqqBrowser || isucBrowser) {
                $('.share_btn').off('click').on('click', 'a', function () {
                    var $share = $('.fpop_share');
                    $share.hide();
                    if(typeof _ts.opt.hideFun === 'function'){_ts.opt.hideFun();}

                    var data_app = $(this).parent().attr("data-app");
                    setTimeout(function(){
                        _ts.share(data_app);
                    },200);
                        

                    
                    return false;
                });
                // var items = document.getElementsByClassName('share_btn');
                // for (var i=0;i<items.length;i++) {
                //     $('.share_btn a').off('click');
                //     items[i].onclick = function(){
                //         // share.share(this.getAttribute('data-app'));
                //         alert(123)
                //         return false;
                //     }
                // }
                    
            } 

        },
        isloadqqApi : function () {
            if (isqqBrowser) {
                var b = (version.qq < 5.4) ? qApiSrc.lower : qApiSrc.higher;
                var d = document.createElement("script");
                var a = document.getElementsByTagName("body")[0];
                d.setAttribute("src", b);
                a.appendChild(d);
            }
        },

        share : function (to_app) {
            var config_data = {
                url:this.opt.url || location.href,
                title:this.opt.title,
                desc:this.opt.summary,
                img:this.opt.pic,
                img_title:this.opt.title,
                from:'爱拍原创'
            };
            var title = config_data.title,
                url = config_data.url, 
                desc = this.opt.summary, 
                img = config_data.img, 
                img_title = config_data.img_title, 
                from = config_data.from;
            if (isucBrowser) {
                to_app = to_app === '' ? '' : (platform_os == 'iPhone' ? ucAppList[to_app][0] : ucAppList[to_app][1]);
                if (to_app == 'QZone') {
                    B = "mqqapi://share/to_qzone?src_type=web&version=1&file_type=news&req_type=1&image_url="+img+"&title="+title+"&description="+desc+"&url="+url+"&app_name="+from;
                    k = document.createElement("div"), k.style.visibility = "hidden", k.innerHTML = '<iframe src="' + B + '" scrolling="no" width="1" height="1"></iframe>', document.body.appendChild(k), setTimeout(function () {
                        k && k.parentNode && k.parentNode.removeChild(k);
                    }, 5E3);
                }
                if (typeof(ucweb) != "undefined") {
                    ucweb.startRequest("shell.page_share", [title, desc, url, to_app, '', "@" + from, '']);
                } else {
                    if (typeof(ucbrowser) != "undefined") {
                        ucbrowser.web_share(title, desc, url, to_app, '', "@" + from, '');
                    } else {
                    }
                }
            } else {
                if (isqqBrowser && !isWeixin) {
                    to_app = to_app === '' ? '' : ucAppList[to_app][2];
                    var ah = {
                        url: url,
                        title: title,
                        description: desc,
                        img_url: img,
                        img_title: img_title,
                        to_app: to_app,//微信好友1,腾讯微博2,QQ空间3,QQ好友4,生成二维码7,微信朋友圈8,啾啾分享9,复制网址10,分享到微博11,创意分享13
                        cus_txt: "请输入此时此刻想要分享的内容"
                    };
                    ah = to_app === '' ? '' : ah;
                    if (typeof(browser) != "undefined") {
                        if (typeof(browser.app) != "undefined" && isqqBrowser == bLevel.qq.higher) {
                            browser.app.share(ah);
                        }
                    } else {
                        if (typeof(window.qb) != "undefined" && isqqBrowser == bLevel.qq.lower) {
                            window.qb.share(ah);
                        } else {
                        }
                    }
                } else {
                }
            }
        }
    };
    module.exports = init;
});
