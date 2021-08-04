/**
 * @file 平台通用方法
 * @author hzcaijuan@corp.netease.com
 * @date 2014/5/29
 */

// DEBUG 变量
var DUMP_LUA_CODE = false;
var DUMP_FE_LOG;

// 产品ID
var NGP_GAME_MAP = {
    qn: {
        id: 2,
        name: '新倩女幽魂',
        skipCG: 3,
        testing: 0,
        modelSkin: 1,
        qrEnabled: 1,
        firstLaunchDetectProbability: 0.5,
        ageRating: 'https://xqn.163.com/news/update/age_rating.html',
        survey2: 'https://survey2.163.com/html/ngp_qn2/paper.html',
        bulletin: 'https://nos.netease.com/qn-file/ngp/qnyh/launcher_news.js',
        download: 'https://xqn.163.com/download/',
        newdownload: 'https://xqn.163.com/download/',
        update: 'https://xqn.163.com/download/patch.html',
        newupdate: 'https://xqn.163.com/download/cspatch.html',
        feedback: 'https://xqn.gm.163.com/',
        outer: 'still',
        customerserv: 'https://xqn.gm.163.com/',
        tools: {
            fix: 'https://qn.res.netease.com/xt/client/qn_fixer_20150716.exe'
        },
        downloadId: 17, // qn 新引擎下载占用的id ipc id
        patcherMiniId: 11, //TODO 跟逆水寒一样的，后面要改成别的 qn 新引擎占用的id ipc
        patcherId: 6, //TODO 跟逆水寒一样的，后面要改成别的 qn 新引擎占用的id ipc
        preDownload: ['http://update.qn.163.com/pre_patch_list_new.txt', 'http://update.qn.163.com/pre_patch_list_lite.txt'],
        preDownloadDetectPeriod: 10 *60 * 1000
    },
    qnm: {
        id: 8,
        name: '倩女幽魂',
        fullName: '倩女幽魂手游',
        download: 'https://qnm.163.com/index.html',
        feedback: 'https://qnm.16163.com/forum.php',
        ageRating: 'https://qnm.163.com/news/2021/05/25/20680_949813.html',
    },
    // qnp: {
    //     name: '倩女口袋版',
    //     bgm: 'bgm-qn'
    // },
    qnht: {
        name: '倩女互通版',
        bgm: 'bgm-qn'
    },
    /*jl: {
        id: 3,
        name: '西楚霸王',
        expired: 'Launch.exe'
    },
    bl: {
        id: 4,
        name: '爆裂天空',
        id2: 5,
        expired: 'Launch.exe'
    },
    zr: {
        id: 6,
        name: '逆水寒',
        modelSkin: 1,
        feedback: 'https://n.163.com/',
        beta: 1,
        noPatch: 1
    },
    jt: {
        id: 7,
        name: '最强军团',
        modelSkin: 1,
        download: 'http://10.240.169.8/',
        update: 'http://10.240.169.8/',
        feedback: 'https://zq.netease.com',
        noPatch: 1
    }*/
};
var NGP_GAME_ALIAS = {
    // xcbw: 'jl'
};

var YI_DUN_CONFIG = {
    productNumber: 'YD00000965163588',
    businessId: 'f28cc54b9508420e9d640b9ee63bb478',
}
var YI_DUN_CAPTCHA = {
    ratio: 1,
    product: 'ngp',
    captchaId: 'fc12133b0d0b4df1a09590cb1a238d89',
    key: '466253606e257466573253567d273534486d622143274c6a2f734e57536042647b516d4d492934422c706a50244974373d2f704b443b3537245e252d2c54'
}

// 外部接口
var API_LIST = {
    login: ['http://54.223.160.137:10003/login', 'http://192.168.131.60:10003/login'], // URS校验地址
    mdHost: ['https://ssl.hi.163.com', 'http://rc.hi.163.com', 'http://md-test.163.com:88'], // 梦岛API地址
    mibao: ['http://54.223.160.137:10003/mibao', 'http://192.168.131.60:10003/mibao'], // 密保查询
    queryrole: ['http://ngp-update.leihuo.netease.com:10003/queryrole', 'http://192.168.131.60:10003/queryrole'], // 角色查询地址
    remote: ['http://ngp-update.leihuo.netease.com/remote-ui/', 'http://192.168.131.60:10002/'], // 远程页面跳转地址
    bwResv: ['http://54.223.175.88:30000/yuyue/CreateYuYueCheck.php', 'http://192.168.131.163:33000/yuyue/CreateYuYueCheck.php'], // bw白名单校验地址
    msg: ['https://ssl.hi.163.com/file_mg/ngp/msg/api.php', 'https://ssl.hi.163.com/file_mg/ngp/msg/yul.php'] // 用户消息接口
};

// urs风险等级低
var URS_RISK = {
    '20': true,
    '21': true
};


/**
 * lua外部接口
 * @type {Object}
 */
var lua = (function () {
    function luaS(s) {
        return '[==[' + s + ']==]';
    }

    function luaArg(arg) {
        var params;
        var t = typeof (arg);
        if (t == 'undefined' || t == 'object' && arg == null) {
            params = 'nil';
        } else if (t == 'boolean') {
            params = arg ? 'true' : 'false';
        } else if (t == 'number') {
            params = '' + arg;
        } else if (t == 'string' && arg.substr(0, 8) === 'function') {
            params = arg;
        } else if (t == 'string') {
            params = luaS(arg);
        } else if (t == 'object') {
            var len = Object.keys(arg).length;
            var index = 0;
            params = '{';
            for (var i in arg) {
                if (typeof (i) === 'string') {
                    params += ('[ ' + luaS(i) + ' ] = ' + luaArg(arg[i]));
                    if (index != (len - 1)) {
                        params += ', '
                    }
                }
                index++;
            }
            params += '}';
        } else {
            util.log("can't support type: " + t);
        }
        return params;
    }

    return {
        MAIN_THREAD: lt.MAIN_THREAD, // 0
        PATCH_THREAD: lt.PATCH_THREAD, // 1
        EXEC_THREAD: lt.EXEC_THREAD, // 2
        P2P_THREAD: lt.P2P_THREAD, // 3
        CALLBACK_THREAD: lt.CALLBACK_THREAD, // 4
        GATHER_THREAD: lt.GATHER_THREAD, // 5
        genLuaCall: function () {
            var fn = arguments[0];
            var call = 'local s, ret1, ret2, ret3 = stp.pcall(' + fn;
            var args = "";
            for (var i = 1; i < arguments.length; i++) {
                args += ',';
                args += luaArg(arguments[i]);
            }
            call += args;
            call += ') ';
            call += ' JsCallback(JsonValue{msg = "MSG_' + fn + '_DONE", success = s, param1 = ret1, param2 = ret2, param3 = ret3}) ';
            return call;
        },

        runLuaCode: function (thread, code, onSuccess, onFailure) {
            var prefix = '--lua thread index:' + thread + '\n';
            DUMP_LUA_CODE && util.log('running lua code:' + prefix + code);
            window.cefQuery({
                request: prefix + code,
                persistent: true,
                onSuccess: function (r) {
                    onSuccess && onSuccess(r);
                },
                onFailure: function (c, m) {
                    if (c != 0) {
                        util.log('onFailure called:' + m);
                        onFailure && onFailure();
                    }
                }
            });
        },

        // 全局相关的事件接收
        startListening: function () {
            var cb = function (json) {
                try {
                    var data = JSON.parse(json);
                    var msg = data.msg;
                    $(window).trigger('cb_' + msg, data);
                } catch (ex) {
                    var errStr = 'JSON Error[' + json + ']';
                    util.log(errStr, 2);
                    util.log([ex, 'init.js', 'lua.startListening', errStr], 3);
                }
            };
            // 下面这个语句,一个字符都不能动
            lua.runLuaCode(lua.CALLBACK_THREAD, " StartListening ()", cb, null);
        }
    };
}());

/**
 * NGP游戏平台公用方法
 * @type {Object}
 */
var util = $.extend(window.util || {}, {
    $exec: function (cmd, thread, args, success, failure, timeout) {
        thread = thread || lua.MAIN_THREAD;
        args = [cmd].concat(args || []);
        thread === 0 && console.error('-----------------', cmd, thread)

        // 调用lua接口
        var c = lua.genLuaCall.apply(null, args);
        var defer = $.Deferred().done(success).fail(failure);
        lua.runLuaCode(thread, c, function (response) {
            try {
                if (cmd === 'qn.GetPlayerInfo') {
                    response = response.replace(/\\\\/, 'dddddddddddd');
                    response = response.replace(/([^\\])(\\)([^\\])/g, '$1$3');
                    response = response.replace(/(dddddddddddd)/g, '\\');
                }
                var data = JSON.parse(response) || {};
                if (data.msg == 'MSG_' + cmd + '_DONE') {
                    var argData = [];
                    var index = 1;
                    do {
                        argData.push(data['param' + index++]);
                    } while (data['param' + index]);
                    defer.resolve.apply(defer, argData);
                }
            } catch (ex) {
                var errStr = 'LuaCall Error[' + cmd + ']';
                util.log(response);
                util.log(errStr, 2);
                util.log([ex, 'init.js', 'util.$exec', errStr], 3);
                defer.reject();
            }
        }, defer.reject);

        // 设置超时
        timeout && setTimeout(function () {
            defer.reject(cmd + ' timeout');
        }, timeout);
        return defer;
    },
    isValidGacRunner: function (home, cb) {
        return util.$exec('qn.IsValidGacRunner', null, [home]);
    },
    getHotPatch: function (cb) {
        return util.$exec('GetJsHotpatch', null, null, cb);
    },
    cefHasSwitch: function (key, cb) {
        return util.$exec('util.CefHasSwitch', null, [key], cb);
    },
    cefGetSwitchValue: function (key, cb) {
        return util.$exec('util.CefGetSwitchValue', null, [key], cb);
    },
    firstTimeLaunched: function (cb) {
        return util.$exec('util.FirstTimeLaunched', null, null, cb);
    },
    scanGame: function (cb) {
        return util.$exec('util.ScanGame', lua.GATHER_THREAD, null, cb);
    },
    scanNGPGame: function (cb) {
        return util.$exec('util.ScanLHGame', lua.GATHER_THREAD, null, function (scanned) {
            var map = {};
            for (var key in scanned) {
                var code = NGP_GAME_ALIAS[key] || key;
                map[code] = scanned[key];
            }
            cb && cb(map);
        });
    },
    getGameType: function (file, cb) {
        return util.$exec('util.ManualAddGame', null, [file], cb);
    },
    getAppVersion: function (cb) {
        return util.$exec('GetAppVersion', null, null, cb);
    },
    isInInner: function (cb) {
        return util.$exec('util.IsInInner', null, null, cb);
    },
    isCefGpuDisabled: function (cb) {
        return util.$exec('IsCefGpuDisabled', null, null, cb);
    },
    getOSVersion: function (cb) {
        return util.$exec('util.GetOSVersion', null, null, cb);
    },
    changePicture: function (path) {
        return util.$exec('ChangePicture', null, [path]);
    },
    shellExecute: function (open, path, cmdlines, curdir, cb) {
        return util.$exec('util.ShellExecute', lua.EXEC_THREAD, [open, path, cmdlines, curdir], cb);
    },
    shellExecute2: function (open, path, cmdlines, curdir, cb) {
        return util.$exec('util.ShellExecute', lua.EXEC_THREAD, [open, path, cmdlines, curdir], cb);
    },
    browseForFolder: function (title, cb) {
        return util.$exec('util.BrowseForFolder', null, [title], cb);
    },
    browseForFile: function (cb) {
        return util.$exec('shell.BrowseForFile', null, null, cb);
    },
    getIcon: function (file, cb) {
        return util.$exec('shell.GetIcon', null, [file], cb);
    },
    getFinalPath: function (lnk, cb) {
        return util.$exec('util.GetFinalPath', null, [lnk], cb);
    },
    minimizeWindow: function () {
        return util.$exec('MinimizeWindow');
    },
    quitApplication: function (force, cb) {
        return util.$exec('QuitApplication', null, [force], cb);
    },
    taskBarHide: function () {
        return util.$exec('TaskbarHide');
    },
    moveCefWindow: function (deltaX, deltaY) {
        return util.$exec('MoveCefWindow', null, [deltaX, deltaY]);
    },
    selfUpdate: function (needApply, timeout) {
        return util.$exec('util.SelfUpdate', lua.PATCH_THREAD, [needApply], null, null, timeout || 5000);
    },
    CheckNeedSelfUpdate: function (timeout) {
        return util.$exec('util.CheckNeedSelfUpdate', lua.PATCH_THREAD, [], null, null, timeout || 1000);
    },
    checkErrorReport: function (cb) {
        return util.$exec('util.CheckErrorReport', null, null, cb);
    },
    sendErrorReport: function (s, cb) {
        return util.$exec('util.SendErrorReport', lua.GATHER_THREAD, [s], cb);
    },
    gather: function (s, cb) {
        return util.$exec('util.GatherPlain', lua.GATHER_THREAD, [s], cb);
    },
    dumpJSErr: function (hashId, detail, cb) {
        return util.$exec('stp.AddScriptError', lua.GATHER_THREAD, [hashId, detail], cb);
    },
    downloadFile: function (thread, url, path, cb) {
        return util.$exec('DownloadFile', thread, [url, path, 'function(percent) JsFeedback(0, percent .. \"\') end'], cb);
    },
    setGameHome: function (cmd, path, succ, fail) {
        var count = 2;

        function checkReady(response) {
            try {
                var data = JSON.parse(response);
                if (data.msg === 'MSG_' + cmd + '_DONE') {
                    succ && !--count && succ.call(null);
                }
            } catch (ex) {
                var errStr = 'LuaCall Error[' + cmd + ']';
                util.log(errStr, 2);
                util.log([ex, 'init.js', 'util.setGameHome', errStr], 3);
                fail && fail.call(null);
            }
        }

        var c = lua.genLuaCall(cmd, path);
        lua.runLuaCode(lua.MAIN_THREAD, c, checkReady, fail);
        lua.runLuaCode(lua.EXEC_THREAD, c, checkReady, fail);
        lua.runLuaCode(lua.PATCH_THREAD, c);
        lua.runLuaCode(lua.P2P_THREAD, c);
        lua.runLuaCode(lua.GATHER_THREAD, c);
    },

    startUpdater: function (productId, cb) {
        return util.$exec('util.StartUpdater', lua.EXEC_THREAD, [productId], cb);
    },
    pingUpdater: function (productId) {
        return util.$exec('util.PingUpdater', null, [productId]);
    },
    getUpdaterVersion: function (productId) {
        return util.$exec('util.GetUpdaterVersion', null, [productId]);
    },
    enumDisplay: function (cb) {
        return util.$exec('util.EnumDisplay', null, null, cb);
    },
    updateAccount: function (account, password, cb) {
        return util.$exec('util.UpdateAccount', null, [account, password], cb);
    },
    startUu: function () {
        return util.$exec('util.StartUu');
    },
    isUuRunning: function (cb) {
        return util.$exec('util.IsUuRunning', null, null, cb);
    },
    encryptString: function (str, cb) {
        return util.$exec('util.EncryptString', null, [str], cb);
    },
    decryptString: function (str, cb) {
        return util.$exec('util.DecryptString', null, [str], cb);
    },
    setInstallerHome: function (home, cb) {
        return util.$exec('installer.SetHome', lua.P2P_THREAD, [home], cb);
    },
    getInstallerHome: function (cb) {
        return util.$exec('installer.GetHome', lua.P2P_THREAD, null, cb);
    },
    setInstallerSpeed: function (d, u) {
        return util.$exec('installer.SetSpeed', lua.P2P_THREAD, [d, u], null);
    },
    getInstallerSpeed: function (cb) {
        return util.$exec('installer.GetSpeed', lua.P2P_THREAD, null, cb);
    },
    getDiskFreeSpace: function (path, cb) {
        return util.$exec('shell.GetDiskFreespace', null, [path], cb);
    },
    ngpRunningInDir: function (path, cb) {
        return util.$exec('shell.NgpRunningInDir', null, [path], cb);
    },
    getGatherId: function (cb) {
        return util.$exec('util.GetGatherId', null, null, cb);
    },
    diagnoseInner: function (cb) {
        return util.$exec('net.DiagnoseInner', lua.GATHER_THREAD, null, cb, cb);
    },
    diagnosePublic: function (code, cb) {
        return util.$exec('net.DiagnosePublic', lua.GATHER_THREAD, [code], cb, cb);
    },
    checkTcp: function (ip, port, cb) {
        return util.$exec('net.CheckTcp', lua.GATHER_THREAD, [ip, port], cb, cb);
    },
    openRecycleBin: function () {
        return util.$exec('shell.OpenRecycleBin');
    },
    lastTimeQuitException: function (cb) {
        return util.$exec('util.LastTimeQuitException', null, null, cb);
    },
    getOSAndResolution: function (cb) {
        return util.$exec('util.GetOSAndResolution', null, null, cb);
    },
    addSetting: function (key, value, cb) {
        return util.$exec('util.AddSetting', lua.GATHER_THREAD, [key, value], cb);
    },
    getSetting: function (key, cb) {
        return util.$exec('util.GetSetting', null, [key], cb);
    },
    getClientInfo: function (cb) {
        return util.$exec('util.GetClientInfo', null, null, cb);
    },
    gatherBuffer: function (cb) {
        return util.$exec('util.GatherBuffer', null, null, cb);
    },
    trashFile: function (file, cb) {
        return util.$exec('util.MoveFileToRecycle', null, [file], cb);
    },
    deleteFile: function (file, cb) {
        return util.$exec('util.OsRemove', null, [file], cb);
    },
    FileExists: function (file, cb) {
        return util.$exec('util.FileExists', null, [file], cb);
    },
    showNotificationIconInfo: function (tips, cb) {
        return util.$exec('util.ShowNotificationIconInfo', null, [tips], cb);
    },
});

/**
 * 换肤对象生成方法
 * @type {Object}
 */
var skin = $.extend(window.skin || {}, {
    setSkin: function (code, cb) {
        return util.$exec('skin.SetSkin', null, [code], cb);
    },
    changeBG: function (code, cb) {
        return util.$exec('skin.ChangeBG', null, [code], cb);
    },
    playAnimation: function (code, cb) {
        return util.$exec('skin.PlayAnimation', null, [code], cb);
    },
    stopAnimation: function (cb) {
        return util.$exec('skin.StopAnimation', null, null, cb);
    },
    changeLogo: function (code, cb) {
        if (code == 'qnht') {
            code = 'qnp';
        }
        return util.$exec('skin.ChangeLogo', null, [code], cb);
    },
    closeLogo: function (code, cb) {
        return util.$exec('skin.CloseLogo', null, [code], cb);
    },
    showPic: function (code, cb) {
        return util.$exec('skin.ShowPic', null, [code], cb);
    },
    closePic: function (cb) {
        return util.$exec('skin.ClosePic', null, null, cb);
    },
    waiKuangXiaoQian1: function (cb) {
        return util.$exec('skin.WaiKuangXiaoQian1', null, null, cb);
    },
    waiKuangXiaoQian1_TouMing: function (cb) {
        return util.$exec('skin.WaiKuangXiaoQian1_TouMing', null, null, cb);
    },
    waiKuangNanXia1: function (cb) {
        return util.$exec('skin.WaiKuangNanXia1', null, null, cb);
    },
    waiKuangNanXia1_TouMing: function (cb) {
        return util.$exec('skin.WaiKuangNanXia1_TouMing', null, null, cb);
    }
});

/**
 * 游戏加载器对象生成方法
 * @type {Object}
 */
function GameFactory(code, methods) {
    var self = {
        makeLink: function (desktop, quickLaunch, isInInner) {
            return util.$exec(self.code + '.MakeLink', null, [desktop, quickLaunch, isInInner]);
        },
        removeLink: function () {
            return util.$exec(self.code + '.RemoveLink');
        },
        runUpdater: function (cb) {
            return util.$exec(self.code + '.RunUpdater', null, null, cb);
        },
        getHome: function (cb) {
            return util.$exec(self.code + '.GetHome', null, null, cb, cb);
        },
        setHome: function (path, cb) {
            util.setGameHome(self.code + '.SetHome', path, cb, cb);
        },
        isValidHome: function (cb) {
            return util.$exec(self.code + '.IsValidHome', null, null, cb, cb);
        },
        loadIni: function (cb) {
            return util.$exec(self.code + '.LoadIni', null, null, cb, cb);
        },
        saveIni: function (table, md5, cb) {
            return util.$exec(self.code + '.SaveIni', null, [table, md5], cb, cb);
        },
        getServer: function (succ, fail, timeout) {
            fail = fail || succ;
            return util.$exec(self.code + '.GetServer', lua.EXEC_THREAD, null, succ, fail, timeout);
        },
        getServer2: function (succ, fail, timeout) {
            fail = fail || succ;
            return util.$exec(self.code + '.GetServer', lua.GATHER_THREAD, null, succ, fail, timeout);
        },
        launchGame: function (path, host, port, name, account, id, setting, loginTye, isMultiClient, forbidCenterRender) {
            var uid;
            var code = self.code;
            var args = arguments;
            return Auth.getLaunchAccount(code, name, account)
                .then(function (realAccount) {
                    uid = realAccount ? realAccount.split(':')[0] : 'ANONYMOUS';
                    args[4] = loginTye === 'uuid' ? account : realAccount;
                    return self.runClient.apply(self, args);
                }).then(function () {
                    Gather.addOne('launchGame=' + code + '[' + uid + ']');
                });
        },
        runClient: function () {
            console.error('to be implemented...');
        },
        reserveServer: function (path, id, name) {
            console.error('to be implemented...');
        },
        isQRCodeEnabled: function (cb) {
            return util.$exec(self.code + '.IsQRCodeEnabled', null, null, cb, cb);
        },
        enableQRCode: function (enable) {
            return util.$exec(self.code + '.EnableQRCode', null, [enable]);
        },
        camelCode: function () {
            return self.code[0].toUpperCase() + self.code.substr(1);
        },
        startInstaller: function () {
            return util.$exec('installer.' + self.camelCode() + 'Start', lua.P2P_THREAD, null);
        },
        pauseInstaller: function () {
            return util.$exec('installer.' + self.camelCode() + 'Pause', lua.P2P_THREAD, null);
        },
        resumeInstaller: function () {
            return util.$exec('installer.' + self.camelCode() + 'Resume', lua.P2P_THREAD, null);
        },
        stopInstaller: function () {
            return util.$exec('installer.' + self.camelCode() + 'Stop', lua.P2P_THREAD, null);
        },
        queryInstaller: function (cb) {
            return util.$exec('installer.' + self.camelCode() + 'Query', lua.P2P_THREAD, null, cb);
        },
        setInstallerPath: function (p, cb) {
            return util.$exec('installer.' + self.camelCode() + 'SetPath', lua.P2P_THREAD, [p], cb);
        },
        getInstallerPath: function (cb) {
            console.log(self.camelCode())
            return util.$exec('installer.' + self.camelCode() + 'GetPath', lua.P2P_THREAD, null, cb);
        },
        getInstallerVersion: function (cb) {
            return util.$exec('installer.' + self.camelCode() + 'GetVersion', lua.P2P_THREAD, null, cb);
        },
        getInstallerSize: function (cb) {
            return util.$exec('installer.' + self.camelCode() + 'GetSize', lua.P2P_THREAD, null, cb);
        },
        cancelInstaller: function (cb) {
            return util.$exec('installer.' + self.camelCode() + 'Cancel', lua.P2P_THREAD, null, cb);
        },
        uninstall: function (dir, cb) {
            return util.$exec('installer.' + self.camelCode() + 'Uninstall', lua.P2P_THREAD, [dir], cb);
        },
        getCurrentVersion: function (cb) {
            return util.$exec(self.code + '.GetCurrentVersion', null, null, cb, cb);
        },
        isGameRunning: function (cb) {
            return util.$exec(self.code + '.IsGameRunning', null, null, cb);
        },
        // ,isRunningInGameDir: function (cb) {
        //     return util.$exec(self.code + '.IsRunningInGameDir', null, null, cb, cb);
        // }
        getPrtScDirInfo: function (cb) {
            return util.$exec(self.code + '.GetPrtScDirInfo', null, null, cb);
        }
    };

    self.code = code;
    return $.extend(self, methods || {});
}

/**
 * 倩女加载器对象
 * @type {Object}
 */
var qn = GameFactory('qn', {
     // 新引擎吊起预下载进程
     predownload: function (path, canUseNewPatcher) {
         if(!canUseNewPatcher) return
         qn.runUpdaterNew(function(params) {
             console.log('开始预下载', params)
        }, true)
    },
    runClient: function (path, host, port, name, account, id, cfg, type, isMultiClient, forbidCenterRender) {
        console.log('forbidCenterRender==', forbidCenterRender)
        var acctInfo = type === 'uuid'
            ? '__LOGIN_UUID__={' + account + '}'
            : (account ? '__LOGIN__={' + account + '}' : '');
        var args = 'mailto:' + host + ':' + port + '@0[' + name + '], 1' + ' ' + acctInfo;
        if (util.config.getGameKV('qn', 'agreement') - 0) {
            args += ' --agreementpassed';
        }
        if (isMultiClient) {
            args += ' --hidevideonew' // 跳过游戏开场CG
            args += ' --agreementpassed' // 跳过游戏开场同意协议
        }
        if(forbidCenterRender) {
            args += ' --forbidCenterRender' // 关闭中心渲染
        }
        args += ' NGPTag=1';
        // 根据服务器ID判断是否进行界面迭代
        return qn.getCetouServer().then(function(res){
            if (res && res[id]) {
                // 部分界面需要强制更新到新界面
                typeof res[id] === 'object' && res[id].indexOf('forceNewUI') > -1 ? args += 'UI4=2' : args += 'UI4=1';
            } else {
                args += 'UI4=0';
            }
            return qn.xPExtraProcess()
        }).
        then(function(arg1, arg2){
            if (arg1) {
                args += ' ' + arg2;
            }
            return qn.switchGacRunner()
        })
        .then(function(){
            // 根据新旧引擎判断启动文件的目录
            return qn.isNewEngineClient(path)
        })
        .then(function(isNewEngine){
            var GacRunnerPath = isNewEngine ? 'program\\bin\\Release64\\' : 'program\\bin\\Release\\';
            return util.shellExecute2(
                null,
                path + GacRunnerPath + 'GacRunner.exe ',
                args,
                path + GacRunnerPath
            );
        })
    },
    reserveServer: function (path, id, name) {
        Gather.addOne('reserveServer=qn');

        var yuyue = 'YuYue=' + id,
            serverName = ' ServerName=' + name,
            isVIPNetBar = ' IsVIPNetBar=' + id,
            args = yuyue + serverName + isVIPNetBar + ' 1';
        // 根据新旧引擎判断启动文件的目录
        return qn.isNewEngineClient(path)
        .then(function(isNewEngine){
            var GacRunnerPath = isNewEngine ? 'program\\bin\\Release64\\' : 'program\\bin\\Release\\'
            return util.shellExecute2(null, path + GacRunnerPath + 'GacRunner.exe',
            args, path + GacRunnerPath);
        })
    },

    /* methods only applied to qn */
    runDiagnotor: function () {
        return util.$exec('qn.RunDiagnotor');
    },
    switchToOldLaunch: function (cb) {
        return util.$exec('qn.SwitchToOldLauncher', null, null, cb);
    },
    setBt: function (using, cb) {
        return util.$exec('qn.SetBt', null, [using], cb);
    },
    killLauncher: function () {
        return util.$exec('qn.KillLauncher');
    },
    fixName: function () {
        return util.$exec('qn.FixName', lua.PATCH_THREAD);
    },
    onQuit: function () {
        return util.$exec('qn.OnQuit');
    },
    diagnose: function (type) {
        return util.$exec('qn.Diagnose', lua.GATHER_THREAD, [type]);
    },
    cleanup: function () {
        return util.$exec('qn.CleanUp', lua.GATHER_THREAD);
    },
    getForceNgpTime: function (cb) {
        return util.$exec('qn.GetForceNgpTime', lua.GATHER_THREAD, null, cb);
    },
    getPlayerInfo: function (cb) {
        return util.$exec('qn.GetPlayerInfo', null, null, cb, cb);
    },
    getGetHeFuResult: function (server, cb) {
        return util.$exec('qn.GetHeFuResult', null, [server], cb);
    },
    getAllServerList: function (cb) {
        return util.$exec('qn.GetAllServerList', null, null, cb);
    },
    patchUpdater: function (cb) {
        return util.$exec('qn.PatchUpdater', null, null, cb);
    },
    calcSuitConfigure: function (cb) {
        var home = top.Launcher.get('qn').gamePath;
        return qn.isNewEngineClient(home)
        .then(function(flag){
            var name = flag ? 'qn.CalcSuitConfigure' : 'qn.CalcSuitConfigureOld';
            window.qn.NewEngineClientFlag = flag;
            return util.$exec(name, null, null, cb);
        })
    },
    getMaxVMSetting: function (cb) {
        return util.$exec('qn.GetMaxVMSetting', null, null, cb);
    },
    RestoreVM: function (cb) {
        return util.$exec('qn.RestoreVM', null, null, cb);
    },
    autoSetVM: function (cb) {
        return util.$exec('qn.AutoSetVM', null, null, cb);
    },
    restartComputer: function (cb) {
        return util.$exec('qn.RestartComputer', null, null, cb);
      },
    xPExtraProcess: function (cb) {
        return util.$exec('qn.XPExtraProcess', null, null, cb);
    },
    switchGacRunner: function (cb) {
        return util.$exec('qn.SwitchGacRunner', null, null, cb);
    },
    RunDXSetup: function (dir, cb) {
        return util.$exec('qn.RunDXSetup', null, [dir], cb);
    },
    KillDXSetup: function (dir, cb) {
        return util.$exec('qn.KillDXSetup', null, [dir], cb);
    },
    IsDXSetupRunning: function (dir, cb) {
        return util.$exec('qn.IsDXSetupRunning', null, [dir], cb);
    },
    isNewEngineClient: function (home, cb) {
        return util.$exec('qn.IsNewEngineClient', null, [home], cb, cb);
    },
    checkVirtualMemoryConfig: function (nClientCount, cb) {
        return util.$exec('qn.CheckVirtualMemoryConfig', null, [nClientCount], cb, cb);
    },
    getPagefileConfigRecommandMaxValue: function () {
        return util.$exec('qn.GetPagefileConfigRecommandMaxValue', null, null);
    },
    setPagefileConfigAuto: function (cb) {
        return util.$exec('qn.SetPagefileConfigAuto', null, null, cb);
    },
    isOldEngineClient: function (dir, cb) {
        return util.$exec('qn.IsNewEngineClient', null, [dir])
        .then(function(isNew){
            if(isNew){
                return cb && cb(false);
            }else{
                return util.$exec('qn.IsValidHome', null, [dir])
                .then(function(isOld){
                    return cb && cb(isOld)
                })
            }
        })
    },
    // 根据新旧引擎使用不同的接口，前端入口不做修改，保持一致
    loadIni: function (cb) {
        var home = top.Launcher.get('qn').gamePath;
        return qn.isNewEngineClient(home)
        .then(function(flag){
            var name = flag ? 'qn.LoadXml' : 'qn.LoadIni';
            window.qn.NewEngineClientFlag = flag;
            return util.$exec(name, null, null, cb, cb);
        })
    },
    saveIni: function (table, md5, cb) {
        var home = top.Launcher.get('qn').gamePath;
        return qn.isNewEngineClient(home)
        .then(function(flag){
            var name = flag ? 'qn.SaveXml' : 'qn.SaveIni'
            window.qn.NewEngineClientFlag = flag;
            return util.$exec(name, null, [table, md5], cb, cb);
        })
    },
    isQRCodeEnabled: function (cb) {
        var home = top.Launcher.get('qn').gamePath;
        return qn.isNewEngineClient(home)
        .then(function(flag){
            var name = flag ? 'qn.IsQRCodeEnabledXml' : 'qn.IsQRCodeEnabled';
            window.qn.NewEngineClientFlag = flag;
            return util.$exec(name, null, null, cb, cb);
        })
    },
    enableQRCode: function (enable) {
        var home = top.Launcher.get('qn').gamePath;
        return qn.isNewEngineClient(home)
        .then(function(flag){
            var name = flag ? 'qn.EnableQRCodeXml' : 'qn.EnableQRCode';
            window.qn.NewEngineClientFlag = flag;
            return util.$exec(name, null, [enable]);
        })
    },
    IsNewInstallRunning: function(edition, cb){
        var isMini = edition !== 'full';
        return util.$exec('GetProgramFolder', null, [])
        .then(function(programFolder){
            var exe = programFolder + (isMini ? qn.miniExe : qn.fullExe);
            return util.$exec('shell.IsProcessRunning', null, [exe])
        })
        .then(function(isRunning){
            cb && cb(isRunning)
        })
    },
    KillNewInstalling: function(edition, cb){
        var isMini = edition !== 'full';
        return util.$exec('GetProgramFolder', null, [])
        .then(function(programFolder){
            var exe = programFolder + (isMini ? qn.miniExe : qn.fullExe);
            return util.$exec('util.KillProcess', null, [exe])
        })
        .then(function(kill){
            cb && cb(kill)
        })
    },
    getInstallerVersion: function (cb) {
        qn.IsMiniNewEngine(function(isMini){
            var name = isMini ? 'installer.QnlfGetVersion' : 'installer.QnlafGetVersion';
            return util.$exec(name, null, [], cb, cb)
        })
    },
    GetNewEngineSize: function(edition, cb){
        var size = 0;
        // 返回增量部分大小
        if(edition === 'isMiniUpgrade'){
            return util.$exec('installer.QnlafGetSize', null, [])
            .then(function(addSize){
                // 返回统一单位为KB
                return cb && cb((addSize));
            })
        }
        return util.$exec('installer.QnlfGetSize', null, [])
        .then(function(lowSize){
            size = lowSize;
            // 完整版是mini版 + 增量部分 isMiniUpgrade = 计算增量部分大小
            if(edition === 'full'){
                return util.$exec('installer.QnlafGetSize', null, [])
                .then(function(addSize){
                    // 返回统一单位为KB
                    return cb && cb((addSize + size));
                })
            }else{
                return cb && cb(lowSize)
            }
        })
    },
    IsMiniNewEngine: function(cb, useThen){
        var home = top.Launcher.get('qn').gamePath;
        if(!home) {
            if(useThen) return $.Deferred().resolve(false)
            else return cb && cb(false);
        }
        // 存在这个版本文件表示是完整版
        var filePath = home + 'artist\\res\\character_00.wdf';
        return util.$exec('util.FileExists', null, [filePath])
        .then(function(flag){
            if(useThen) return !flag
            else return cb && cb(!flag)
        })
    },
    miniExe: 'bw_mini_dl.exe',
    fullExe: 'qn_full_dl.exe',
    highEngineConfig: [
        { // lowest
        Graphics: {
            AA: 0,
            Shadow: 0,
            SSAO: 0,
            SeaOfClouds: 0,
            SceneDetail: 5,
            WaterQuality: 2,
            ImageQuality: 1,
            GrowTreeLodQuality: 0,
            MultiClientOptimize: 1,
            FrameRate: 0,
            RenderScale: 0
        }
    },
    { // low
        Graphics: {
            AA: 2,
            Shadow: 1,
            SSAO: 5,
            SeaOfClouds: 0,
            SceneDetail: 4,
            WaterQuality: 2,
            ImageQuality: 1,
            GrowTreeLodQuality: 0,
            MultiClientOptimize: 1,
            FrameRate: 1,
            RenderScale: 0
        }
    },
    { // middle
        Graphics: {
            AA: 2,
            Shadow: 2,
            SSAO: 5,
            SeaOfClouds: 1,
            SceneDetail: 3,
            WaterQuality: 2,
            ImageQuality: 1,
            GrowTreeLodQuality: 1,
            MultiClientOptimize: 1,
            FrameRate: 1,
            RenderScale: 0
        }
    },
    { // high
        Graphics: {
            AA: 2,
            Shadow: 3,
            SSAO: 6,
            SeaOfClouds: 1,
            SceneDetail: 2,
            WaterQuality: 1,
            ImageQuality: 1,
            GrowTreeLodQuality: 2,
            MultiClientOptimize: 1,
            FrameRate: 1,
            RenderScale: 0
        }
    },
    { // highest
        Graphics: {
            AA: 2,
            Shadow: 3,
            SSAO: 6,
            SeaOfClouds: 1,
            SceneDetail: 1,
            WaterQuality: 1,
            ImageQuality: 1,
            GrowTreeLodQuality: 2,
            MultiClientOptimize: 1,
            FrameRate: 1,
            RenderScale: 0
        }
    }
    ],
    iniLevel: [{ // low
        Graphic: {
            Resolution: 0,
            ColorMode: 1,
            //                FullScreen: 0,
            RefreshRate: 75,
            TexQuality: 0,
            PresentationIntervals: 0,
            DynamicLight: 0,
            Antialiasing: 0,
            Glow: 1,
            Gamma: 1,
            StaticObjShadow: 0,
            ActiveObjShadow: 0,
            SceneFxLevel: 2,
            WaterEffectLevel: 0,
            EnableDistort: 0,
            GrassSetting: 0,
            FogDistance: 0,
            DayNight: 0,
            RenderEngineLevel: 0,
            //                UIFont: "fonts\\simsun.ttc",
            MultiClientOptimize: 1,
            MemOptimize: 1,
            EnablePhys: 1
        }
    },
    { // middle
        Graphic: {
            Resolution: 1,
            ColorMode: 1,
            //                FullScreen: 0,
            RefreshRate: 75,
            TexQuality: 1,
            PresentationIntervals: 0,
            DynamicLight: 1,
            Antialiasing: 0,
            Glow: 1,
            Gamma: 1,
            StaticObjShadow: 1,
            ActiveObjShadow: 1,
            SceneFxLevel: 1,
            WaterEffectLevel: 1,
            EnableDistort: 1,
            GrassSetting: 1,
            FogDistance: 1,
            DayNight: 0,
            RenderEngineLevel: 1,
            //                UIFont: "fonts\\simsun.ttc",
            MultiClientOptimize: 1,
            MemOptimize: 1,
            EnablePhys: 1
        }
    },
    { // high
        Graphic: {
            Resolution: 1,
            ColorMode: 1,
            //                FullScreen: 0,
            RefreshRate: 75,
            TexQuality: 2,
            PresentationIntervals: 0,
            DynamicLight: 1,
            Antialiasing: 0,
            Glow: 1,
            Gamma: 1,
            StaticObjShadow: 1,
            ActiveObjShadow: 1,
            SceneFxLevel: 0,
            WaterEffectLevel: 2,
            EnableDistort: 1,
            GrassSetting: 2,
            FogDistance: 1,
            DayNight: 0,
            RenderEngineLevel: 2,
            //                UIFont: "fonts\\simsun.ttc",
            MultiClientOptimize: 0,
            MemOptimize: 0,
            EnablePhys: 1
        }
    },
    { // higher
        Graphic: {
            Resolution: 1,
            ColorMode: 1,
            //                FullScreen: 0,
            RefreshRate: 75,
            TexQuality: 2,
            PresentationIntervals: 0,
            DynamicLight: 1,
            Antialiasing: 2,
            Glow: 0,
            Gamma: 1,
            StaticObjShadow: 1,
            ActiveObjShadow: 2,
            SceneFxLevel: 0,
            WaterEffectLevel: 2,
            EnableDistort: 1,
            GrassSetting: 2,
            FogDistance: 1,
            DayNight: 0,
            RenderEngineLevel: 3,
            //                UIFont: "fonts\\simsun.ttc",
            MultiClientOptimize: 0,
            MemOptimize: 0,
            EnablePhys: 1
        }
    },
    { // highest
        Graphic: {
            Resolution: 1,
            ColorMode: 1,
            //                FullScreen: 0,
            RefreshRate: 75,
            TexQuality: 2,
            PresentationIntervals: 0,
            DynamicLight: 1,
            Antialiasing: 4,
            Glow: 0,
            Gamma: 1,
            StaticObjShadow: 1,
            ActiveObjShadow: 2,
            SceneFxLevel: 0,
            WaterEffectLevel: 3,
            EnableDistort: 1,
            GrassSetting: 2,
            FogDistance: 3,
            DayNight: 0,
            RenderEngineLevel: 3,
            //                UIFont: "fonts\\simsun.ttc",
            MultiClientOptimize: 0,
            MemOptimize: 0,
            EnablePhys: 1
        }
    }
    ],
    // 新的快速配置的参数
    newEngineGraphicsConfigure: {
        highest: 4,
        high: 3,
        middle: 2,
        low: 1,
        lowest: 0,
        custom: 2 // 默认是2
    },
    getCetouServer: function (cb) {
        return util.$exec('qn.GetCetouServer', null, null, cb, cb);
    },
    HasDX11DLL: function () {
        return util.$exec('qn.HasDX11DLL', lua.GATHER_THREAD);
    },
    runInstall: function (dir, isMini, cb, extra){
        // 区分mini版和完整版
        // 完整版需要执行两次下载 先下完咸鱼版之后，再执行增量下载
        // 开启下载前先去杀一下对应的下载器进程 避免出现多个的情况
        var extra = extra || {};
            uploadSpeed = extra.uploadSpeed,
            downloadSpeed = extra.downloadSpeed,
            record = extra.record,
            isRepair = extra.isRepair;
        return util.$exec('GetProgramFolder', null, [])
        .then(function(programFolder){
            var exe = programFolder + (isMini ? qn.miniExe : qn.fullExe);
            // 是否记录上一次启动的exe路径用于，新引擎启动的时候需要去杀掉后台下载程序
            record && util.config.set('qn.LastMiniExePath', exe);
            return util.$exec('util.KillProcess', null, [exe])
        })
        .then(function(){
            if (!isRepair) {
                console.log(dir, isMini, uploadSpeed, downloadSpeed)
                return util.$exec('qn.RunInstall', lua.P2P_THREAD, [dir, isMini, uploadSpeed, downloadSpeed], cb, cb);
            }else{
                return util.$exec('qn.RunClientRepair', lua.P2P_THREAD, [dir], cb, cb);
            }

        })
    },
    checkPagefile: function (cb) {
        return util.$exec('qn.CheckPageFile', null, null, cb);
    },
    isWin64: function(cb){
        return util.$exec('util.IsOsWow64', null, [], cb, cb)
    },
    // 将ngp2拷贝一份到ngp3，用于以后修复使用
    cloneNgp: function(home, cb){
        if(!home) cb && cb(false);
        return util.$exec('qn.CopyNGP', null, [home], cb, cb)
    },
    makeLink3: function (desktop, quickLaunch, isInInner, cb) {
        return util.$exec('qn.MakeLink3', null, [desktop, quickLaunch, isInInner], cb, cb);
    },
    isRepairNgp: function(cb){
        return util.$exec('GetProgramFolder', null, [])
        .then(function(r){
            cb && cb(/ngp3/.test(r));
        })
    },
    isValidHome2: function (path, cb) {
        return util.$exec('qn.IsValidHome', null, [path], cb, cb);
    },
    killProcess: function(path, cb){
        return util.$exec('util.KillProcess', null, [path], cb, cb)
    },
    onlyNewEngineList: [],
    ngpNoticeUrl: 'http://ngp.163.com/api/notice/index.html',
    startUseNewPatcher: 2007240932,
    // 新引擎畅玩版相关接口地址
    // patchlist
    newMiniPatchList: 'http://update.qn.163.com/patch_list_lite.txt',
    // 新patcher方式的patchlist
    newMiniPatchList2: 'http://update.qn.163.com/patch_list_nl.txt',
    // 补丁下载前缀
    newMiniPatchPrefix: 'http://qnupdatelite.gph.netease.com/',

    // 新引擎完整版相关接口地址
    // patchlist
    newPatchList: 'http://update.qn.163.com/patch_list_new.txt',
    // 新patcher方式的patchlist
    newPatchList2: 'http://update.qn.163.com/patch_list_n.txt',
    // 补丁下载前缀
    newPatchPrefix: 'http://qnupdate.gph.netease.com/',

    // 新引擎的手动下载patch的地址
    newPatchPage : 'https://xqn.163.com/download/cspatch.html',
    //0723 新增
    isNewPatcherExist: function(cb){
        return util.$exec('qn.IsPatcherExist', null, '', cb, cb)
    },
    runUpdaterNew: function (cb, bPreDownload) {
        if(!bPreDownload) bPreDownload = false
        return util.$exec('qn.RunUpdaterNew', null, bPreDownload, cb, cb);
    },
    // 读取patcher相关配置
    loadPatcherIni: function (cb) {
        return util.$exec('qn.LoadPatcherIni', null, null, cb, cb);
    },
    LoadInnerPatcherIni: function (cb) {
        return util.$exec('qn.LoadInnerPatcherIni', null, null, cb, cb);
    },
    savePatcherIni: function (table, md5, cb) {
        console.log('savePatcherIni', table)
        return util.$exec('qn.SavePatcherIni', null, [table, md5], cb, cb);
    },
    makeLinkCustomPathLink: function (desktop, quickLaunch, path, cb) {
        return util.$exec('qn.MakeLinkCustomPathLink', null, [desktop, quickLaunch, path], cb, cb);
    },
    downloadSpeedPredict: function(cb){
        return util.$exec('qn.DownloadSpeedPredict', null, null, cb, cb);
    },
    killGacRunner: function(cb){
        return util.$exec('qn.KillGacRunner', null, null, cb, cb);
    },
    killClientRepairProcess: function(path, cb){
        return util.$exec('qn.KillClientRepairProcess', null, [path], cb, cb);
    },
    isLastRepairSuccess: function(cb){
        return util.$exec('qn.IsLastRepairSuccess', null, null, cb, cb);
    },
    configTxtUrl:['https://ssl.hi.163.com/ngp/patch/ngp_qn_config.txt', 'https://ssl.hi.163.com/ngp/patch/ngp_qn_config_test.txt'],
    slientBanner: true
});

/**
 * 倩女手游加载器对象
 * @type {Object}
 */
var qnm = GameFactory('qnm', {
    runUpdater: undefined,
    launchGame: function (path) {
        Gather.addOne('launchGame=qnm');
        return util.shellExecute2(null, path + 'qnyh.exe', '', path);
    },

    /* methods only applied to qnm */
    unZip: function (cb) {
        return util.$exec('installer.QnmUnzip', lua.P2P_THREAD, null, cb);
    }
});

/**
 * 倩女手口袋加载器对象
 * @type {Object}
 */
var qnp = GameFactory('qnp', {
    runUpdater: undefined
});
/**
 * 倩女手互通加载器对象
 * @type {Object}
 */
var qnht = GameFactory('qnht', {
    runUpdater: undefined
});

/**
 * 西楚霸王游戏对象
 * @type {Object}
 */
var jl = {};

/**
 * 爆裂天空游戏对象
 * @type {Object}
 */
var bl = {};

/**
 * 祝融加载器对象
 * @type {Object}
 */
var zr = GameFactory('zr', {
    loadIni: function (cb) {
        return util.$exec('zr.LoadXml', null, null, cb, cb);
    },
    saveIni: function (table, md5, cb) {
        return util.$exec('zr.SaveXml', null, [table, md5], cb, cb);
    },
    runClient: function (path, host, port, name, account, id, equip) {
        var acctInfo = account ? '__LOGIN__={' + account + '}' : '';
        var equipInfo = equip ? ';_HDW_="' + equip + '"' : '';
        var args = host + ':' + port + '@0[' + name + ']' + ' ' + acctInfo + equipInfo;
        args = '"' + args + '"';
        var releasePath = 'Release' + (top.Launcher.get('zr').launch32 ? '' : '64');
        return util.shellExecute2(null, path + 'program\\bin\\' + releasePath + '\\GacRunnerNG.exe',
            args, path + 'program\\bin\\' + releasePath + '\\');
    },
    reserveServer: function (path, id, name) {
        Gather.addOne('reserveServer=zr');

        var yuyue = 'YuYue=' + id,
            serverName = ' ServerName=' + name,
            isVIPNetBar = ' IsVIPNetBar=' + id,
            args = yuyue + serverName + isVIPNetBar + ' 1',
            releasePath = 'Release' + (top.Launcher.get('zr').launch32 ? '' : '64');
        return util.shellExecute2(null, path + 'program\\bin\\' + releasePath + '\\GacRunnerNG.exe',
            args, path + 'program\\bin\\' + releasePath + '\\');
    },
    calcSuitConfigure: function (cb) {
        return util.$exec('zr.CalcSuitConfigure', null, null, cb);
    },
    resetSPHIcon: function () {
        return util.$exec('zr.ResetSPHIcon', null, null);
    }
});

/**
 * 最强军团加载器对象
 * @type {Object}
 */
var jt = GameFactory('jt', {
    getRealServerArg: function (fakeIp, serverId, cb) {
        return util.$exec('jt.GetRealIPArg', null, [fakeIp, serverId], cb, cb);
    },
    getLaunchArgs: function (cb) {
        return util.$exec('jt.GetLaunchArgs', null, null, cb, cb);
    },
    runClient: function (path, host, port, name, account, id) {
        return Auth.loginHook('jt').then(function () {
            return $.when(
                jt.getLaunchArgs(),
                jt.getRealServerArg(host + (port ? ':' + port : ''), id)
            ).then(function (args, server) {
                var arr = account && account.split(':');
                var acctInfo = account ? '-passport=' + arr[0] + '  -password=' + arr[1] : '';
                args = args + ' -proxyips=' + server + ' ' + acctInfo;

                return util.shellExecute2(null, path + 'Binaries\\Win32\\MCGame-Final.exe',
                    args, path + 'Binaries\\Win32\\');
            });
        });
    },
    reserveServer: function (path, id, name) {
        Gather.addOne('reserveServer=jt');

        var yuyue = 'YuYue=' + id,
            serverName = ' ServerName=' + name,
            isVIPNetBar = ' IsVIPNetBar=' + id,
            args = yuyue + serverName + isVIPNetBar + ' 1';
        return util.shellExecute2(null, path + 'Binaries\\Win32\\MCGame-Final.exe',
            args, path + 'Binaries\\Win32\\');
    },
    startInstaller: function (cb) {
        return util.$exec('installer.JtStartWithNGP', lua.P2P_THREAD, null, cb);
    },
    repairInstaller: function (repair) {
        return util.$exec('installer.JtStart', lua.P2P_THREAD, null, [repair]);
    },
    cleanUpClient: function () {
        return util.$exec('jt.CleanUpClient', null, null, null);
    },
    isInInnerTestVersion: function (cb) {
        return util.$exec('jt.IsInnerTestVersion', null, null, cb);
    },
    postToDrpf: function (cb) {
        return util.$exec('jt.PostToDrpf', null, null, cb);
    }
});

// 公共脚本
(function () {

    // 测试环境下开启前端log
    function setLogEnv(inner) {
        return $.Deferred().resolve(DUMP_FE_LOG = !!inner);
    }
    window.isInnerDefer = top.DUMP_FE_LOG === undefined ? util.isInInner(setLogEnv) : setLogEnv(top.DUMP_FE_LOG);
    util.monitorJsErr();

    // 禁用原生拖拽
    util.dom.enableBodyDrag();

    // 按钮音效
    function playBtnAudio(evt, data) {
        if (!(data && data.silent) && ($(this).hasClass('active') || !$(this).is(':disabled') && !$(this).hasClass('disabled'))) {
            top.MediaManager.playAudio('../audio/click.ogg', {
                volume: 0.5
            });
        }
    }
    $('body').on('click', '.audio-btn', playBtnAudio);
    $('.audio-btn-close').on('click', playBtnAudio);

    // 显示动态Tip
    util.dom.initTips();

    // 适应XP下disable-gpu选项添加hack样式
    util.dom.addHackStyle();

    // 数据统计
    window.Gather && Gather.init();

    // 加载热更新脚本
    isInnerDefer.then(util.dom.hotPatch);

    top === window && lua.startListening(); // 主界面启动底层事件侦听

}());
