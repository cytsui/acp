define(function(require, exports, module) {


    var $ = require('$'),
        pop = require('pop'),
        cookies = require('cookies'),
        fromApp = window.fromApp || false,
        wx = require('weixin');

    require('./css/patch.css');

    //https patch
    (function($) {
        if(location.protocol === 'https:'){
            var _ajax = $.ajax;
            $.ajax = function (opts) {
                var _url = $.trim(opts.url).replace(/^http:(\/\/[\w]+\.aipai\.com)/, "$1").replace(/^http:(\/\/[\w]+\.weplay\.cn)/, "$1");
                if(_url.match(/\?/g)){
                    _url = _url + '&https=1';
                }else{
                    _url = _url + '?https=1';
                }
                opts.url = _url;
                return _ajax(opts); 
            };
        }
    })($);

    //apm
    var apm = {};

    //apm.config
    apm.config = {
        baseUrl : '//m.aipai.com/',
        debug : true
    };

    //apm.debug
    apm.debug = function(){};
    if(typeof console !== 'undefined' && apm.config.debug){
        apm.debug = function(msg){
            console.log(msg);
        };
    }

    //apm.fsrtok
    apm.fsrtok = function(){
        var fsrtok = 'a%5Bp-m.t-o-k%5Den%7C%3D%7Cf%5Dun%5Bct-i%5Don(-)-%7Bre-turn%7Ca%5Bpm.m-d-5(co%5Do-kies.g-et(%22b%22)%2Bcook%5Bies.get(%22at%22)%2Bcoo%5Bkies.get(%22t%22)%2B%22%24%24%23%5D%232030%22)%2B%22%40V2%22%3B%7D%3B';
        var do_dndpoll = function(string){
           string = decodeURIComponent(string);
           string = string.replace(/-/g,'').replace(/\[/g,'').replace(/\]/g,'').replace(/\|/g,' ');
           return string;
        };
        eval(do_dndpoll(fsrtok));
    };

    //apm.app
    apm.app = (function () {
        var ua = navigator.userAgent,
            opt = {};
        var reg = ua.match(/aipai\/(.*)\/(.*)\/(.*)\/v\((.*)\)/);
        if(reg){
            opt.isInApp = reg[0];
            opt.os = reg[1];
            opt.set = reg[2];
            opt.product = reg[3];
            opt.version = reg[4];
        }else{
            opt.isInApp = false;
        }
        opt.is = function (arg){
            if(reg){
                return (typeof arg.o !== 'undefined' ? (arg.o === opt.os) : true) &&  (typeof arg.p !=='undefined' ? (arg.p === opt.product) : true) && (typeof arg.s !== 'undefined' ? (arg.s === opt.set) : true) && (typeof arg.v !== 'undefined' ? (opt.version >= arg.v) : true);
            }else{
                return false;
            }
        };
        return opt;
    })();

    //apm.tools
    apm.tools = {
        //元素是否准备
        isElementReady : function(id, fun){
            var _ts = this,
                tryToReady = function(){
                    apm.debug('try to ready #'+id+'.');
                    if($('#'+id).size() > 0){
                        apm.debug('apm.tools.isElementReady ==> ready #'+id+' succeed!');
                        //执行回调
                        if($.isFunction(fun)){
                            try{
                                fun();
                            }catch(e){}
                        }
                        return;
                    } else {
                        setTimeout(function(){
                            tryToReady(id, fun);
                        }, 15);
                    }
                };
            tryToReady();
        },
        //是否移动设备
        isMobile : !!navigator.userAgent.match(/iPhone/i) || !!navigator.userAgent.match(/iPad/i) || !!navigator.userAgent.match(/Android/i) || !!navigator.userAgent.match(/AppleWebKit.*Mobile.*/),

        //判断设备
        deviceDetail : function(mobile){
            var _devArry = {};
            if(mobile === true){
                if( (!!navigator.userAgent.match(/iPhone/i)) ){
                    _devArry = {
                        "id":"1",
                        "devName":"iPhone"
                    };
                }else if((!!navigator.userAgent.match(/iPad/i))){
                    _devArry = {
                        "id":"2",
                        "devName":"iPad"
                    };
                }else if((!!navigator.userAgent.match(/Android/i))){
                     _devArry = {
                        "id":"3",
                        "devName":"Android"
                    };
                }
            }else{
                _devArry = {
                    "id":"0",
                    "devName":"PC"
                };
            }
            return _devArry;
        },
        //事件判断
        cookiesSetOneDay : function(key,val){
            var date= new Date();
            var nowTime = date.getTime();
            var expdate = new Date();
            var exptime = nowTime - (date.getHours()*3600+date.getMinutes()*60+date.getSeconds())*1000 + 86400*1000;
            expdate.setTime(exptime);
            if(val){
                cookies.set(key, val, {
                    domain: 'aipai.com',
                    path: '/',
                    expires: expdate
                });
            }else{
                var v = cookies.get(key) || 0;
                v = parseInt(v, 10);
                cookies.set(key, v+1, {
                    domain: 'aipai.com',
                    path: '/',
                    expires: expdate
                });
            }
        }
    };

    //apm.user
    apm.user = {
        isLogin : function(){
            var bid = cookies.get('b') || 0;
            return (bid > 0) ? true : false;
        },
        checkLogin : function(callback, parm){
            var bid = cookies.get('b') || 0;
            if(bid > 0){
                //已登陆
                if($.isFunction(callback)){
                    callback(parm);
                }
            }else{
                //未登陆
                var _url = encodeURI(location.href);
                location.href = '//m.aipai.com/mobile/login.php?ref='+_url;
            }
        },
        getNotify : function(callback){
            var bid = cookies.get('b') || 0,
                url = '//so.aipai.com/bus/notify/getNotify.php';
            if(bid > 0){
                $.ajax({
                    type: 'GET',
                    url: url,
                    data: { bid : bid },
                    dataType: 'jsonp',
                    timeout: 5000,
                    success: function(data){
                        if($.isFunction(callback)){
                            callback(data);
                        }
                    }
                });
            }
        }
    };

    //apm.md5
    apm.md5 = function(value){
        var hex_chr = "0123456789abcdef",
            rhex = function(num) {
                var str = "";
                for(j = 0; j <= 3; j++)
                    str += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) +
                        hex_chr.charAt((num >> (j * 8)) & 0x0F);
                return str;
            },
            str2blks_MD5 = function(str) {
                nblk = ((str.length + 8) >> 6) + 1;
                blks = new Array(nblk * 16);
                for(i = 0; i < nblk * 16; i++) blks[i] = 0;
                for(i = 0; i < str.length; i++)
                    blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
                blks[i >> 2] |= 0x80 << ((i % 4) * 8);
                blks[nblk * 16 - 2] = str.length * 8;
                return blks;
            },
            add = function(x, y) {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF);
                var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            },
            rol = function(num, cnt) {
                return (num << cnt) | (num >>> (32 - cnt));
            },
            cmn = function(q, a, b, x, s, t) {
                return add(rol(add(add(a, q), add(x, t)), s), b);
            },
            ff = function(a, b, c, d, x, s, t) {
                return cmn((b & c) | ((~b) & d), a, b, x, s, t);
            },
            gg = function(a, b, c, d, x, s, t) {
                return cmn((b & d) | (c & (~d)), a, b, x, s, t);
            },
            hh = function(a, b, c, d, x, s, t) {
                return cmn(b ^ c ^ d, a, b, x, s, t);
            },
            ii = function(a, b, c, d, x, s, t) {
                return cmn(c ^ (b | (~d)), a, b, x, s, t);
            },
            MD5 = function(str) {
                x = str2blks_MD5(str);
                var a =  1732584193;
                var b = -271733879;
                var c = -1732584194;
                var d =  271733878;

                for(i = 0; i < x.length; i += 16)
                {
                    var olda = a;
                    var oldb = b;
                    var oldc = c;
                    var oldd = d;

                    a = ff(a, b, c, d, x[i+ 0], 7 , -680876936);
                    d = ff(d, a, b, c, x[i+ 1], 12, -389564586);
                    c = ff(c, d, a, b, x[i+ 2], 17,  606105819);
                    b = ff(b, c, d, a, x[i+ 3], 22, -1044525330);
                    a = ff(a, b, c, d, x[i+ 4], 7 , -176418897);
                    d = ff(d, a, b, c, x[i+ 5], 12,  1200080426);
                    c = ff(c, d, a, b, x[i+ 6], 17, -1473231341);
                    b = ff(b, c, d, a, x[i+ 7], 22, -45705983);
                    a = ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
                    d = ff(d, a, b, c, x[i+ 9], 12, -1958414417);
                    c = ff(c, d, a, b, x[i+10], 17, -42063);
                    b = ff(b, c, d, a, x[i+11], 22, -1990404162);
                    a = ff(a, b, c, d, x[i+12], 7 ,  1804603682);
                    d = ff(d, a, b, c, x[i+13], 12, -40341101);
                    c = ff(c, d, a, b, x[i+14], 17, -1502002290);
                    b = ff(b, c, d, a, x[i+15], 22,  1236535329);

                    a = gg(a, b, c, d, x[i+ 1], 5 , -165796510);
                    d = gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
                    c = gg(c, d, a, b, x[i+11], 14,  643717713);
                    b = gg(b, c, d, a, x[i+ 0], 20, -373897302);
                    a = gg(a, b, c, d, x[i+ 5], 5 , -701558691);
                    d = gg(d, a, b, c, x[i+10], 9 ,  38016083);
                    c = gg(c, d, a, b, x[i+15], 14, -660478335);
                    b = gg(b, c, d, a, x[i+ 4], 20, -405537848);
                    a = gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
                    d = gg(d, a, b, c, x[i+14], 9 , -1019803690);
                    c = gg(c, d, a, b, x[i+ 3], 14, -187363961);
                    b = gg(b, c, d, a, x[i+ 8], 20,  1163531501);
                    a = gg(a, b, c, d, x[i+13], 5 , -1444681467);
                    d = gg(d, a, b, c, x[i+ 2], 9 , -51403784);
                    c = gg(c, d, a, b, x[i+ 7], 14,  1735328473);
                    b = gg(b, c, d, a, x[i+12], 20, -1926607734);

                    a = hh(a, b, c, d, x[i+ 5], 4 , -378558);
                    d = hh(d, a, b, c, x[i+ 8], 11, -2022574463);
                    c = hh(c, d, a, b, x[i+11], 16,  1839030562);
                    b = hh(b, c, d, a, x[i+14], 23, -35309556);
                    a = hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
                    d = hh(d, a, b, c, x[i+ 4], 11,  1272893353);
                    c = hh(c, d, a, b, x[i+ 7], 16, -155497632);
                    b = hh(b, c, d, a, x[i+10], 23, -1094730640);
                    a = hh(a, b, c, d, x[i+13], 4 ,  681279174);
                    d = hh(d, a, b, c, x[i+ 0], 11, -358537222);
                    c = hh(c, d, a, b, x[i+ 3], 16, -722521979);
                    b = hh(b, c, d, a, x[i+ 6], 23,  76029189);
                    a = hh(a, b, c, d, x[i+ 9], 4 , -640364487);
                    d = hh(d, a, b, c, x[i+12], 11, -421815835);
                    c = hh(c, d, a, b, x[i+15], 16,  530742520);
                    b = hh(b, c, d, a, x[i+ 2], 23, -995338651);

                    a = ii(a, b, c, d, x[i+ 0], 6 , -198630844);
                    d = ii(d, a, b, c, x[i+ 7], 10,  1126891415);
                    c = ii(c, d, a, b, x[i+14], 15, -1416354905);
                    b = ii(b, c, d, a, x[i+ 5], 21, -57434055);
                    a = ii(a, b, c, d, x[i+12], 6 ,  1700485571);
                    d = ii(d, a, b, c, x[i+ 3], 10, -1894986606);
                    c = ii(c, d, a, b, x[i+10], 15, -1051523);
                    b = ii(b, c, d, a, x[i+ 1], 21, -2054922799);
                    a = ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
                    d = ii(d, a, b, c, x[i+15], 10, -30611744);
                    c = ii(c, d, a, b, x[i+ 6], 15, -1560198380);
                    b = ii(b, c, d, a, x[i+13], 21,  1309151649);
                    a = ii(a, b, c, d, x[i+ 4], 6 , -145523070);
                    d = ii(d, a, b, c, x[i+11], 10, -1120210379);
                    c = ii(c, d, a, b, x[i+ 2], 15,  718787259);
                    b = ii(b, c, d, a, x[i+ 9], 21, -343485551);

                    a = add(a, olda);
                    b = add(b, oldb);
                    c = add(c, oldc);
                    d = add(d, oldd);
                }
                return rhex(a) + rhex(b) + rhex(c) + rhex(d);
            };

        return MD5(value);
    };

    /**
     * [转换为静态地址，调试模式(dev)直接使用动态地址]
     * @param  {[type]} url   [Ajax请求的url]
     * @param  {[type]} param [Ajax请求的param]
     * @return {[type]}       [转换后的静态地址]
     */
    apm.getStaticApi = function(url, param){
        if(location.href.indexOf("?dev") > 0){
            return (url + '?' + param+'&cache=no');
        }else{
            var _static = url + param + '.html';
            return _static.replace(/&/g, '_').replace(/.php/g, '_').replace(/=/g, '-');
        }
    };

    apm.initScrollTop = function(){
        var st = null,
            _scTop = '<span class="g_scrollTop hidden"></span>';
        $("body").append(_scTop);
        $(window).bind('scroll',function(event){
            clearTimeout(st);
            st = setTimeout(function(){
                if(document.body.scrollTop > window.innerHeight){
                    $(".g_scrollTop").show();
                    $(".g_scrollTop").click(function(event) {
                        $(this).hide();
                        event.preventDefault();
                        window.scrollTo(0,0);
                    });
                }else{
                    $(".g_scrollTop").hide();
                }
            },50);
        });
    };

    /*顶部导航fixed辅助方法*/
    apm.fixHeader = function(){
        var h_st = null,
            init_top = $('header').offset().top;
        $(window).on('scroll', function(event){
            clearTimeout(h_st);
            h_st = setTimeout(function(){
                if(document.body.scrollTop > init_top){
                    $("#doc").addClass('header_fix');
                }else{
                    $("#doc").removeClass('header_fix');
                }
            },200);
        });
    };

    /*
     * 取得url参数
     * 如：http://www.aipai.com/index.php?action=abc&page=3
     * var args = apm.getQueryStringArgs();
     * var action = args.action;
     * var page = args.page;
     */
    apm.getQueryStringArgs = function(){
        var qs = (location.search.length > 0 ? location.search.substring(1) : ""),
            args = {},
            items = qs.length ? qs.split("&") : [],
            item = null,
            name = null,
            value = null,
            i = 0,
            len = items.length;

        for (i=0; i < len; i++){
            item = items[i].split("=");
            name = decodeURIComponent(item[0]);
            value = decodeURIComponent(item[1]);
            if (name.length) {
                args[name] = value;
            }
        }
        return args;
    };

    //观察者模式
    var observe = $(window);
    apm.on = function(){
        observe.on.apply(observe, arguments);
    };
    apm.off = function () {
        observe.off.apply(observe, arguments);
    };
    apm.trigger = function(){
        observe.trigger.apply(observe, arguments);
    };

    //app接口
    apm.appBridge = function(type, data){
        var iframe = document.createElement('IFRAME');
        iframe.setAttribute('src', 'aipai-vw://'+type+'/'+data);
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
    };

    //当前app是否存在type协议
    apm.appIsBridge = function(type){
        switch (type) {
            case 'home':
                return (apm.app.is({o : 'iOS', s: 'xifen', v : 400}) || apm.app.is({o : 'Android', s: 'xifen', v : 110000}) || apm.app.is({o : 'Android', p: 'aipai', v : 561}) || apm.app.is({o : 'iOS', p: 'aipai', v : 285})) ? true : false;
            case 'video':
                return (apm.app.is({o : 'iOS', s: 'xifen', v : 400}) || apm.app.is({o : 'Android', s: 'xifen', v : 110000}) || apm.app.is({o : 'Android', p: 'aipai', v : 550}) || apm.app.is({o : 'iOS', p: 'aipai', v : 281})) ? true : false;
            case 'live':
                return apm.app.is({o : 'Android', p: 'aipai', v : 833}) ? true : false;

            default:
                return false;
        }
    };

    //启动app某个页面协议
    apm.appStart = function(data){
        /**
            data = {'action' : 'videoPlayer', 'videoId' : 415748};
        **/

        //android:    personalspace://?bid=4051458
        //ios:        aipai://?action=personalspace&bid=4051458
        var iframe = document.createElement('IFRAME'),
            _data = '';
        for(var key in data){
            _data += '&'+key+'='+ encodeURIComponent(data[key]);
        }
        _data = 'aipai://?'+_data.substring(1);
        iframe.setAttribute('src', _data);
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
    };

    //share统计
    apm.shareStat = function (appid, action) {
        var key = 'sjjwek*#$kk239934k#@&kk2378',
            sign = apm.md5(appid + action + key);
        $.ajax({
            type: 'GET',
            url: '//shouyou.aipai.com/lieyou/share_plus/stat/video',
            data: {
                app_id : appid,
                action : action,
                sign : sign
            },
            dataType: 'json',
            success: function(ret){
            }
        });
    };

    //apm.init
    apm.init = function(){
        var user = apm.user;
        apm.fsrtok();

        //判断是否登录
        if(user.isLogin()){
            var bUser = $('header').find('.b_user');
            bUser.addClass('has_logged');

            //5秒后Get Notify
            setTimeout(function(){
                user.getNotify(function(ret){
                    if(ret.data === null){
                        cookies.remove('notifyNum');
                    }else{
                        var msg = parseInt(ret.data.totalMsg, 10);
                        apm.trigger('msg', msg);
                        if(msg > 0){
                            bUser.addClass('has_msg');
                        }else{
                            bUser.removeClass('has_msg');
                        }
                    }
                });
            }, 5000);
        }

        //shareAppPDS
        apm.shareAppPDS = function () {
            if(navigator.userAgent.match(/Android 2.3.*/gi)){
                return;
            }
            var $shareApp = $('.share_app'),
                showTime = 0,
                $appPDS,
                state = null;

            var handler = function ($a, $b) {
                showTime++;
                if(showTime % 2){
                    $a.addClass("out").removeClass("in");
                    setTimeout(function() {
                        $b.addClass("in").removeClass("out");
                    }, 225);
                }else{
                    $b.addClass("out").removeClass("in");
                    setTimeout(function() {
                        $a.addClass("in").removeClass("out");
                    }, 225);
                }
                setTimeout(function () {
                    handler($a, $b);
                }, 5000);
            };
            var txt = navigator.userAgent.match(/iphone|ipod|ios/ig) ? '//m.aipai.com/app/www/templates/mobile/common/css/img/title_app05.png' : '//m.aipai.com/app/www/templates/mobile/common/css/img/title_app03.png' ;

            if($shareApp.size() > 0){
                $shareApp.addClass('viewport-flip').css({'overflow' : 'hidden', 'height' : '60px', 'padding-top': 0}).wrapInner('<div class="share_app_default flip" style="height:54px;background:'+$('.share_app').css('background')+';padding-top:6px;absolute;top:0;left:0;width:100%;"></div>').prepend('<div class="share_app_pds flip" style="height:54px;background:#212121;padding-top:6px;position:absolute;top:0;left:0;width:100%;"> <div class="close_app" style="border-left: 1px solid #323232;background-image: url(//m.aipai.com/app/www/templates/mobile/common/css/img/close_app2.png);"></div> <a class="start_app" href="paidashi://"> <div class="ico_app" style="display: block; background-image: url(//m.aipai.com/app/www/templates/mobile/common/css/img/ico_app_pds.png);"></div> <div class="title_app" style="margin: 8px 0 0 5px;background: url('+txt+') no-repeat;background-size: contain;"> <p class="main_ti"></p> <p class="sub_ti"></p> </div> <div class="share_user" style="background-image:-webkit-gradient(linear,0% 0%, 0% 100%, from(#4d4d4d), to(#343434)); background-image:-moz-gradient(linear,0% 0%, 0% 100%, from(#fcfcfc), to(#cfcfcf)); background-image:gradient(linear,0% 0%, 0% 100%, from(#fcfcfc), to(#cfcfcf)); color:#fcf0c7; border:1px solid #2d2d2d;">立即使用</div> </a> </div>');
                $appPDS = $shareApp.find('.share_app_pds');
                $appPDS.on('click', '.close_app', function () {
                    try {
                        var _session = window.sessionStorage;
                        _session.setItem("setClose", 1);
                    } catch (err) {}
                });
                $appPDS.on('click', '.start_app', function () {
                    location.href = '//app.aipai.com/paidashi/m';
                });
                setTimeout(function () {
                    handler($shareApp.find('.share_app_default'), $appPDS);
                }, 5000);
            }
        };


        //App内嵌页面不出推广条
        // if(!fromApp){
        //     //判断App推广
        //     var c_shareApp = parseInt(cookies.get('shareApp') || 0 ,10),
        //         isShareFromAipaiMobile = location.href.indexOf('aipaiMobile'),
        //         ua = navigator.userAgent;
        //     //如果当天弹出次数少于3或者是分享链接，则出App推广
        //     //微信内浏览必出App推广条
        //     if(c_shareApp < 3 || isShareFromAipaiMobile > 0 || ua.toLowerCase().match(/MicroMessenger/i) == "micromessenger"){
        //         //Url中含有aipaiMobile=uc 不出App推广
        //         if(location.href.split('aipaiMobile=')[1] != 'uc'){
        //             cookies.set('shareApp', c_shareApp+1, {
        //                 'domain' : 'aipai.com',
        //                 'path' : '/',
        //                 'expires' : 1
        //             });
        //             //Android平台下推广条是新开窗口(id=3)
        //             var doc = $("#doc"),
        //                 share_app = '<div class="share_app">\
        //                                 <div class="close_app"></div>\
        //                                 <a class="start_app" href="' + (ua.match(/(iPhone|iPod|iPad);?/i) ? 'aipai://' : '#') + '">\
        //                                     <div class="ico_app"></div>\
        //                                     <div class="title_app"></div>\
        //                                     <div class="link_app">立即使用</div>\
        //                                 </a>\
        //                             </div>';
        //             doc.prepend(share_app);
        //             doc.on('click', ".start_app", function() {
        //                 doc.find(".share_app").remove();
        //                 if (ua.toLowerCase().match(/MicroMessenger/i) == "micromessenger"){
        //                     window.location = 'http://www.aipai.com/mobile/guide/wxfallback.html?'+location.href.split('html?')[1];
        //                     return false;
        //                 }else if (ua.match(/(iPhone|iPod|iPad);?/i)){
        //                     setTimeout(function(){
        //                         window.location = 'https://itunes.apple.com/cn/app/id588937742?mt=8';
        //                     },300);
        //                 }else{
        //                     var state = null;
        //                     try{
        //                         state = window.open("aipai://");
        //                     } catch(e){}
        //                     if(state){
        //                         state.location = "http://www.aipai.com/api/clickStats.php?action=mapDown";
        //                         //非UC浏览器2s后关闭新开窗口
        //                         if(navigator.appVersion.indexOf("UC") === -1){
        //                             setTimeout(function(){
        //                                 state.close();
        //                             },2000);
        //                         }
        //                     }
        //                     return false;
        //                 }
        //             }).on('click', ".close_app", function(e) {
        //                 e.preventDefault();
        //                 doc.find(".share_app").remove();
        //             });
        //         }
        //     }
        // }
    };

    /**
    *微信分享： title, desc, imgUrl, sucShare, cancel
    *title：标题，desc：描述，imgUrl：图片(腾讯限制分享图片大小为：32KB)，sucShare：用户确认分享后执行的回调函数，cancel：用户取消分享后执行的回调函数
    *使用：
    *var wxdata = {
    *    title : 12,
    *    desc : 'wen',
    *    imgUrl : 'http://fu1.aipai.com/account/763/8583763/account/8583763_normal.jpg',
    *    sucShare : function(){console.log('sucShare')},
    *    cancel : function(){console.log('cancel')}
    *};
    *apm.wxShare(wxdata);
    */
    apm.wxShare = function (opt) {
        var title = opt.title || window.document.title,
            desc = opt.desc || "",
            imgUrl = opt.imgUrl || "",
            link = opt.link || location.href.split('#')[0],
            sucShare = (typeof opt.sucShare === 'function') ? opt.sucShare : null,
            cancel =(typeof opt.cancel === 'function') ? opt.cancel : null,
            oscUrl = location.href.split('#')[0];

        $.ajax({
            url:'//m.aipai.com/mobile/apps/wxSdkJs.php?url='+encodeURIComponent(oscUrl),
            type:'get',
            dataType:'jsonp',
            success:function(ret){
                if(ret.code === 0){
                    var appId = ret.wxCode.appId;
                    var timestamp = ret.wxCode.timestamp;
                    var nonceStr = ret.wxCode.nonceStr;
                    var signature = ret.wxCode.signature;

                     //微信分享
                     wx.config({
                        appId: appId,
                        timestamp: timestamp,
                        nonceStr: nonceStr,
                        signature: signature,
                        jsApiList: [ 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo']
                    });
                    wx.ready(function(){
                        //分享到朋友圈
                        wx.onMenuShareTimeline({
                            title: title,
                            link: link, // 分享链接
                            imgUrl: imgUrl, // 分享图标
                            success: function () {
                                // 用户确认分享后执行的回调函数
                                try {
                                   sucShare();
                                }catch (e) {}
                            },
                            cancel: function () {
                                // 用户取消分享后执行的回调函数
                                try {
                                   cancel();
                                }catch (e) {}
                            }
                        });

                        //分享给朋友
                        wx.onMenuShareAppMessage({
                            title: title, // 分享标题
                            desc: desc, // 分享描述
                            link: link, // 分享链接
                            imgUrl: imgUrl, // 分享图标
                            type: '', // 分享类型,music、video或link，不填默认为link
                            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                            success: function () {
                                // 用户确认分享后执行的回调函数
                                try {
                                   sucShare();
                                }catch (e) {}
                            },
                            cancel: function () {
                                // 用户取消分享后执行的回调函数
                                try {
                                   cancel();
                                }catch (e) {}
                            }
                        });

                        //分享到QQ
                        wx.onMenuShareQQ({
                            title: title, // 分享标题
                            desc: desc, // 分享描述
                            link: link, // 分享链接
                            imgUrl: imgUrl, // 分享图标
                            success: function () {
                               // 用户确认分享后执行的回调函数
                               try {
                                   sucShare();
                                }catch (e) {}
                            },
                            cancel: function () {
                               // 用户取消分享后执行的回调函数
                               try {
                                   cancel();
                                }catch (e) {}
                            }
                        });
                    });
                }
            }
        });
    };

    //apm.goplay
    /*apm.goplay = {
        init : function () {
            var _ts = this,
                sgp = parseInt(cookies.get('sgp'), 10) || 0;
                lan = navigator.language;

            //if(!lan.match(/zh-/) && sgp <= 0 && !apm.app.isInApp){
            if(sgp <= 0 && !apm.app.isInApp){
                setTimeout(function () {
                    _ts.checkIp();
                }, 2000);
            }
        },
        checkIp : function () {
            var _ts = this;
            $.ajax({
                type: "GET",
                url: 'http://shouyou.aipai.com/geoip',
                dataType: 'jsonp',
                success: function (ret) {
                    apm.tools.cookiesSetOneDay('sgp', '1');
                    if(ret.country_code !== 'CN'){
                        try {
                            _ts.handler();
                        }catch (err) {}
                    }
                }
            });
        },
        handler : function () {
            pop({
                isClose : false,
                con : '<div style="padding: 24px 0;background:#FFF;"><img style="display: block;width: 125px;height: 35px;margin:0 auto 10px;" src="http://res.weplay.cn/app/www/templates/mobile/common/css/img/goplay.png?1"><p style="color: #666666;text-align: center;font-size: 12px;color: #666666;display: block;margin: 0 0 18px;">Welcome to visit <span style="color: #ff9c00;">GoPlay.com</span></p><div style="height: 40px;padding: 0 16px;"><span class="close" style="cursor: pointer;display: block;width: 125px;height: 40px;color: #666666;line-height: 40px;background: #e8e8e8;text-align: center;float: left;font-size: 14px;">No Thanks</span> <a style="display: block;width: 125px;height: 40px;color: #FFF;line-height: 40px;background: #ffc200;text-align: center;font-size: 14px;float: right;" href="http://www.goplay.com" target="_blank">Yes Please</a>  </div></div>',
                btns :[],
                onShow : function ($pop, thisPop) {
                    $pop.on('click', '.close' ,function () {
                        thisPop.remove();
                        var img3 = new Image();
                        img3.src = 'http://cstats.aipai.com/stats/acss/acs.php?targetUrl=&aid=123634';
                    });
                    $pop.on('click', 'a' ,function () {
                        thisPop.remove();
                        var img2 = new Image();
                        img2.src = 'http://cstats.aipai.com/stats/acss/acs.php?targetUrl=&aid=123633';
                    });
                }
            });
            var img = new Image();
            img.src = 'http://cstats.aipai.com/stats/acss/acs.php?targetUrl=&aid=123632';
        }
    };*/

    //apm.3yx login  3yx合作登陆跳转
    apm._3yx = function(url){
        if(typeof url !== 'undefined' && url !== ''){
            var _url = '//m.aipai.com/3yx.php?action=mobileLogin';
            var _bid = cookies.get('b') || 0;

                if(url.indexOf('reffer') !== -1){
                    _url += '&' + url.split('reffer=')[1];
                }

            if(_bid > 0){
                $.ajax({
                    url:_url,
                    type:'get',
                    dataType:'json',
                    success:function(ret){
                        if(ret.code === 0){
                            location.href = ret.data.loginUrl;
                        }else if(ret.code === 1){
                            var _input = '';
                                for(var p in ret.data.formBody){
                                    _input += '<input type="hidden" name="'+p+'" value="'+ret.data.formBody[p]+'" />';
                                }
                            var _form = '<form id="_3yx_form" action="'+ret.data.formAction+'" method="post">'+_input+'</form>';

                            $('body').append(_form);
                            $('#_3yx_form').submit();

                        }
                    }
                });
            }else{
                location.href = '//m.aipai.com/mobile/login.php?ref=' + url;
            }
        }
    };

    /* topShareApp 页面的头部广告。 注意，使用此对象需要先在html页面使用宏header_share3.html */
    apm.topShareApp = {
        init : function () {
            if(!window.localStorage) {
                return;
            }

            var _ts = this;

            //动画
            var showTime = 0;
            var handler = function ($a, $b) {
                showTime++;
                if(showTime % 2){
                    $a.addClass("out").removeClass("in");
                    setTimeout(function() {
                        $b.addClass("in").removeClass("out");
                    }, 225);
                }else{
                    $b.addClass("out").removeClass("in");
                    setTimeout(function() {
                        $a.addClass("in").removeClass("out");
                    }, 225);
                }
                setTimeout(function () {
                    handler($a, $b);
                }, 5000);
            };
            var $el = $('#top_share_app');
            if($el.size() > 0 && $el.find('.mod_tsa').size() > 1){
                $el.addClass('viewport-flip');
                handler($el.find('.mod_tsa_0').addClass('flip'), $el.find('.mod_tsa_1').addClass('flip'));
            }
            if($el.size() > 0 && $el.find('.mod_tsa').size() <= 0){
                $el.remove();
            }

            //更新规则
            var now = Date.parse(new Date());
            var date = window.localStorage.getItem('topShareDataDate') || 0;
            //if(date === 0 || (now-date) > 3600000){
            if(date === 0 || (now-date) > 0){
                //如果超过1小时，去下载最新的规则
                setTimeout(function () {
                    _ts.loadRule();
                }, 2000);
            }
        },
        getItem : function (array, type) {
            var data = array[parseInt(Math.random()*array.length, 10)] || {};
            data.type = type;
            if(type === 'ap'){
                data.protocol = 'aipai://?action=startApp';
            }else if(type === 'pds'){
                data.protocol = 'paidashi://';
            }
            return data;
        },
        loadRule : function () {
            var _ts = this;
            $.ajax({
                type: "GET",
                url: '//www.aipai.com/apps/h5topbanner.php',
                dataType: 'jsonp',
                timeout: 10000,
                error: function(msg) {},
                success: function(ret){
                    _ts.save(ret);
                }
            });
        },
        save : function (data) {
            if(typeof data.ap !== 'undefined' && data.ap.length > 0){
                for (var i = 0; i < data.ap.length; i++) {
                    data.ap[i].protocol = 'aipai://?action=startApp';
                    data.ap[i].type = 'ap';
                }
            }
            if(typeof data.pds !== 'undefined' && data.pds.length > 0){
                for (var y = 0; y < data.pds.length; y++) {
                    data.pds[y].protocol = 'paidashi://';
                    data.pds[y].type = 'pds';
                }
            }
            if(typeof data.xf !== 'undefined' && data.xf.length > 0){
                for (var k = 0; k < data.xf.length; k++) {
                    data.xf[k].type = 'xf';
                }
            }

            //本地存储数据
            try{
                window.localStorage.setItem('topShareData', JSON.stringify(data));
                window.localStorage.setItem('topShareDataDate', Date.parse(new Date()));
            }catch(oException){
                if(oException.name == 'QuotaExceededError'){
                    var _data = [];
                        _data.push(curData);
                    //如果历史信息不重要了，可清空后再设置
                    //localStorage.clear();
                    window.localStorage.removeItem('videoHistory');
                    window.localStorage.removeItem('forHistory');
                    window.localStorage.removeItem('topShareData');
                    try{
                        window.localStorage.setItem('topShareData', JSON.stringify(data));
                        window.localStorage.setItem('topShareDataDate', Date.parse(new Date()));
                    }catch(oException){}
                }
            }
        }
    };


    apm.iOSinReview = function(){
        var inReview = false; //true表示正在审核中， false 表示审核通过。
        if(apm.app.is({o : 'Android', p: 'aipai', v : 830}) || apm.app.is({o : 'iOS', p: 'aipai', v : 303}) || apm.app.is({o : 'iOS', s : 'xifen', v : 304}) || apm.app.is({o : 'iOS', p : 'pds_appstore', v : 8}) || ( apm.app.is({o : 'iOS', p: 'aipai', v : 21}) && navigator.userAgent.match(/iPad/ig) ) ){
            try{
                inReview = window.AipaiAppNative.inReview;
            }catch(err){
            }
        }
        return inReview;
    };

    apm.init();

    $(function () {
        //非ios
        if(!fromApp && !apm.app.isInApp){
            //拍大师推荐
            apm.shareAppPDS();
        }
    });

    //exports
    module.exports = apm;

});
