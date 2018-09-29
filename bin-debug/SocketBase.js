var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var SocketBase = (function () {
    function SocketBase() {
    }
    //初始化socket
    SocketBase.initSocket = function () {
        this.socket = new egret.WebSocket();
        //this.socket.type = egret.WebSocket.TYPE_BINARY;//设置数据格式为二进制，默认为字符串
        this.socket.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onReceiveMessage, this); //添加收到数据侦听，收到数据会调用此方法
        this.socket.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this); //添加链接打开侦听，连接成功会调用此方法
        this.socket.addEventListener(egret.Event.CLOSE, this.onSocketClose, this); //添加链接关闭侦听，手动关闭或者服务器关闭连接会调用此方法
        this.socket.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onSocketError, this); //添加异常侦听，出现异常会调用此方法
        this.socket.connect("115.29.35.209", 2345); //连接服务器192.168.1.8
    };
    //连接成功会调用此方法
    SocketBase.onSocketOpen = function () {
        //egret.log("WebSocketOpen");
    };
    //发送数据
    SocketBase.sendData = function (_msgStr) {
        this.socket.writeUTF(_msgStr); //写入字符串信息
        egret.log("发送数据:" + _msgStr);
    };
    //手动关闭或者服务器关闭连接会调用此方法
    SocketBase.onSocketClose = function () {
        egret.log("WebSocketClose");
        this.client_id = "";
        alert("服务器连接断开，请尝试重新登录或联系客服");
    };
    //出现异常会调用此方法
    SocketBase.onSocketError = function () {
        egret.log("WebSocketError");
        this.client_id = "";
    };
    //收到数据会调用此方法
    SocketBase.onReceiveMessage = function (e) {
        //读取数据
        var msgStr = this.socket.readUTF();
        var obj = JSON.parse(msgStr);
        if (obj["type"]) {
            switch (obj["type"]) {
                case "login"://登录
                    this.client_id = obj["content"]; //记录本次通讯的client_id
                    var _magStr = '{"type":"bind","uid":"' + Global.uid +
                        '","nickname":"' + Global.nickname +
                        '","headImgurl":"' + Global.headImgurl + '"}';
                    this.sendData(_magStr); //发送绑定uid
                    break;
                case "binded"://收到绑定成功
                    Global.main.add_gameStage(); //显示主场景
                    break;
                case "group"://组消息
                    if (obj["action"] == "build") {
                        this.receivebuildGroup(obj); //收到新建组的消息处理
                    }
                    else if (obj["action"] == "joinGetInfo") {
                        this.receiveJoinGetInfo(obj); //收到加入并读取组信息的消息处理
                    }
                    else if (obj["action"] == "join") {
                        this.receive_joinGroup(obj); //收到加入组的消息处理
                    }
                    else if (obj["action"] == "leaveGroup") {
                        this.receiveLeaveGroup(obj);
                    }
                    else if (obj["action"] == "joinGame") {
                        this.receive_joinGame(obj);
                    }
                    else if (obj["action"] == "joinViewer") {
                        this.receive_joinViewer(obj);
                    }
                    else if (obj["action"] == "getuidInfoByGroup") {
                        this.receive_uidInfoByGroup(obj);
                    }
                    else if (obj["action"] == "gomove") {
                        this.receive_gomove(obj);
                    }
                    else if (obj["action"] == "chat_group") {
                        this.receive_chat(obj);
                    }
                    break;
            }
        }
        //egret.log("client_id="+this.client_id);
        egret.log("收到数据:" + msgStr);
    };
    //发送加入组消息
    SocketBase.sendjoinGroup = function (_group_name) {
        if (_group_name === void 0) { _group_name = ''; }
        var _magStr = '';
        if (_group_name == "") {
            var join_time = new Date().getTime(); //记录建立组时的时间戳
            var join_time_str = String(join_time);
            _magStr = '{"type":"join_new","uid":"' + Global.uid + '","group":"' + Global.uid + '_' + join_time_str + '","nickName":"' + Global.nickname + '"}';
        }
        else {
            _magStr = '{"type":"join","uid":"' + Global.uid + '","group":"' + _group_name + '"}';
        }
        this.sendData(_magStr);
    };
    //记录组的名称，即新建或者加入某个组的初始操作
    SocketBase.record_groupName = function (_str) {
        this.group_name = _str; //记录组名称
        this.group_all = new Array(); //初始化当前组（棋局）成员的信息管理数组
        this.joinUserInfo(Global.uid, Global.own_role, Global.nickname, Global.headImgurl); //加入组成员至管理数组--自己
        this.joinUserInfo("", "", "", ""); //加入组成员至管理数组--左
        this.joinUserInfo("", "", "", ""); //加入组成员至管理数组--右
    };
    //加入组成员至管理数组
    SocketBase.joinUserInfo = function (_uid, _role, _nickName, _headImgurl) {
        var _arr = new Array(_uid, _role, _nickName, _headImgurl);
        this.group_all.push(_arr);
    };
    //修改组成员信息至管理数组
    SocketBase.changeGroupInfo = function (_uid, _role, _nickName, _headImgurl, _index) {
        if (_index === void 0) { _index = -1; }
        if (_index > -1 && _index < this.group_all.length) {
            var _arr = new Array(_uid, _role, _nickName, _headImgurl);
            this.group_all[_index] = _arr;
        }
        else {
            for (var i = 1; i < this.group_all.length; i++) {
                if (this.group_all[i][0] == _uid) {
                    if (_role != "") {
                        this.group_all[i][1] = _role;
                    }
                    if (_nickName != "") {
                        this.group_all[i][2] = _nickName;
                    }
                    if (_headImgurl != "") {
                        this.group_all[i][3] = _headImgurl;
                    }
                    break;
                }
            }
        }
    };
    //收到新建组的消息处理
    SocketBase.receivebuildGroup = function (_obj) {
        this.record_groupName(_obj["group_name"]); //记录组名称
        //Global.gogameid = _obj["insert_id"];//记录当前棋局id
        //解析参与者信息
        var _arr = new Array(["", ""], ["", ""]);
        var _plarArr = _obj["players"].split("_");
        var _ownIndex = -1; //标记对局双方中自己的索引，如没有则为-1
        for (var i = 0; i < _plarArr.length; i++) {
            var _first = _plarArr[i].substring(0, 1); //角色代码
            var _uid = _plarArr[i].substring(1);
            _arr[i][0] = _first;
            _arr[i][1] = _uid;
            if (_uid == Global.uid) {
                _ownIndex = i;
            }
        }
        Global.baseData = _obj["baseData"]; //本局棋谱
        Global.situation = ""; //本局行棋记录
        Global.role_l = _arr[0][0]; //当前棋局左侧玩家的角色
        Global.uid_l = _arr[0][1]; //当前棋局的左侧玩家的uid
        Global.nickName_l = _obj["nickName_l"]; //当前棋局左侧玩家的昵称
        this.changeGroupInfo(Global.uid_l, Global.role_l, _obj["nickName_l"], Global.headImgurl, 1); //修改组成员信息至管理数组
        Global.role_r = _arr[1][0]; //当前棋局右侧玩家的角色
        Global.uid_r = _arr[1][1]; //当前棋局的右侧玩家的uid
        Global.nickName_r = ""; //当前棋局右侧玩家的昵称
        if (_ownIndex == -1) {
            if (_plarArr.length == 2) {
                Global.own_role = "C"; //标记自己在棋局中的角色 B黑棋 W白棋 C旁观者
            }
            else {
            }
        }
        else {
            Global.own_role = _arr[_ownIndex][0]; //B黑棋 W白棋
            Global.gameStage.show_game(); //显示棋局
        }
    };
    //收到加入并读取组信息的消息处理
    SocketBase.receiveJoinGetInfo = function (_obj) {
        this.record_groupName(_obj["group_name"]); //记录组名称
        //Global.gogameid = _obj["insert_id"];//记录当前棋局id
        //解析参与者信息
        var _arr = new Array(["", ""], ["", ""]);
        var _plarArr = _obj["players"].split("_");
        var _ownIndex = -1; //标记对局双方中自己的索引，如没有则为-1
        for (var i = 0; i < _plarArr.length; i++) {
            var _first = _plarArr[i].substring(0, 1); //角色代码
            var _uid = _plarArr[i].substring(1);
            _arr[i][0] = _first;
            _arr[i][1] = _uid;
            if (_uid == Global.uid) {
                _ownIndex = i;
            }
        }
        Global.baseData = _obj["baseData"]; //本局棋谱
        Global.situation = _obj["situation"]; //本局行棋记录
        Global.role_l = _arr[0][0]; //当前棋局左侧玩家的角色
        Global.uid_l = _arr[0][1]; //当前棋局的左侧玩家的uid
        Global.nickName_l = _obj["nickName_l"]; //当前棋局左侧玩家的昵称
        this.changeGroupInfo(Global.uid_l, Global.role_l, _obj["nickName_l"], "", 1); //修改组成员信息至管理数组
        Global.role_r = _arr[1][0]; //当前棋局右侧玩家的角色
        Global.uid_r = _arr[1][1]; //当前棋局的右侧玩家的uid
        Global.nickName_r = _obj["nickName_r"]; //当前棋局右侧玩家的昵称
        this.changeGroupInfo(Global.uid_r, Global.role_r, _obj["nickName_r"], "", 2); //修改组成员信息至管理数组
        if (_ownIndex == -1) {
            if (_plarArr.length == 2) {
                Global.own_role = "C"; //标记自己在棋局中的角色 B黑棋 W白棋 C旁观者
                Global.gameStage.show_game(); //显示棋局
            }
            else {
                Global.gameStage.show_game(); //显示棋局
            }
        }
        else {
            Global.own_role = _arr[_ownIndex][0]; //B黑棋 W白棋
            //egret.log("Global.own_role="+Global.own_role);
            this.changeGroupInfo(Global.uid, Global.own_role, Global.nickname, Global.headImgurl, _ownIndex + 1); //修改组成员信息至管理数组
            Global.gameStage.show_game(); //显示棋局
        }
    };
    //收到加入组的消息处理
    SocketBase.receive_joinGroup = function (_obj) {
        if (_obj["uid"] == Global.uid) {
            //暂时不做处理
        }
        else {
            //判断是否参赛者
            if (_obj["uid"] == Global.uid_l) {
                this.changeGroupInfo(_obj["uid"], Global.role_l, _obj["nickname"], _obj["headImgurl"], 1); //修改组成员信息至管理数组
                Global.userPanel.loadUsardImg_l(this.group_all[1][3]); //显示头像-左
            }
            else if (_obj["uid"] == Global.uid_r) {
                this.changeGroupInfo(_obj["uid"], Global.role_r, _obj["nickname"], _obj["headImgurl"], 2); //修改组成员信息至管理数组
                Global.userPanel.loadUsardImg_r(this.group_all[2][3]); //显示头像-右
            }
        }
    };
    //获取某个uid是否在指定组内，如果在，则返回昵称、头像地址等信息
    SocketBase.receive_uidInfoByGroup = function (_obj) {
        if (_obj["uid"] == "")
            return;
        //egret.log("debug--_obj['uid']=" + _obj["uid"]);
        //判断是否参赛者
        if (_obj["uid"] == Global.uid_l) {
            this.changeGroupInfo(_obj["uid"], Global.role_l, _obj["nickname"], _obj["headImgurl"], 1); //修改组成员信息至管理数组
            Global.userPanel.loadUsardImg_l(this.group_all[1][3]); //显示头像-左
        }
        else if (_obj["uid"] == Global.uid_r) {
            this.changeGroupInfo(_obj["uid"], Global.role_r, _obj["nickname"], _obj["headImgurl"], 2); //修改组成员信息至管理数组
            Global.userPanel.loadUsardImg_r(this.group_all[2][3]); //显示头像-右
        }
    };
    //收到退出组的消息，从组中删除某client
    SocketBase.receiveLeaveGroup = function (_obj) {
        if (_obj["uid"] == Global.uid) {
            Global.reset_gameInfo(); //复位棋局参与者信息
            this.record_groupName(""); //复位socket组相关信息
            Global.gameStage.remove_waitingSprite("leaveGroup"); //移除等待通信画面并显示正常进入界面
        }
        else {
            //判断是否参赛者
            if (_obj["uid"] == Global.uid_l) {
                this.changeGroupInfo("", "", "", "", 1); //修改组成员信息至管理数组
                //移除头像
            }
            else if (_obj["uid"] == Global.uid_r) {
                this.changeGroupInfo("", "", "", "", 2); //修改组成员信息至管理数组
                //移除头像
            }
        }
    };
    //收到加入棋局--有人应战的消息
    SocketBase.receive_joinGame = function (_obj) {
        if (_obj["uid"] == Global.uid) {
            if (_obj["errcode"] == "success") {
                Global.role_r = Global.own_role = _obj["color"]; //当前棋局右侧玩家的角色
                Global.uid_r = _obj["uid"]; //当前棋局的右侧玩家的uid
                Global.nickName_r = _obj["nickName_r"]; //当前棋局右侧玩家的昵称
                this.changeGroupInfo(_obj["uid"], _obj["color"], _obj["nickName_r"], _obj["headImgurl"], 2); //修改组成员信息至管理数组
                Global.gameStage.remove_waitingSprite("joinGame_own"); //移除等待通信画面并显示棋局
            }
        }
        else {
            if (_obj["errcode"] == "success") {
                Global.role_r = _obj["color"]; //当前棋局右侧玩家的角色
                Global.uid_r = _obj["uid"]; //当前棋局的右侧玩家的uid
                Global.nickName_r = _obj["nickName_r"]; //当前棋局右侧玩家的昵称
                this.changeGroupInfo(_obj["uid"], _obj["color"], _obj["nickName_r"], _obj["headImgurl"], 2); //修改组成员信息至管理数组
                Global.gameStage.remove_waitingSprite("joinGame_other"); //移除等待通信画面并显示棋局
            }
        }
    };
    //加入棋局--观众
    SocketBase.receive_joinViewer = function (_obj) {
        if (_obj["uid"] == Global.uid) {
            Global.own_role = "C"; //标记自己在棋局中的角色 B黑棋 W白棋 C旁观者
            Global.gameStage.remove_waitingSprite("joinViewer_own"); //移除等待通信画面并显示棋局
        }
        else {
        }
    };
    //收到行棋记录
    SocketBase.receive_gomove = function (_obj) {
        if (_obj["errcode"] == "success") {
            Global.play_go.receive_gomove(_obj); //收到落子消息
        }
        else {
            if (_obj["uid"] == Global.uid) {
                Global.show_pop("未能正常发送落子消息！");
            }
        }
    };
    //收到组内聊天消息
    SocketBase.receive_chat = function (_obj) {
        var _name = "";
        if (_obj["uid"] == Global.uid) {
            _name = "我";
        }
        else {
            _name = _obj["nickName"];
        }
        Global.chatSprite.change_chatTxt(_name + "：" + _obj["chatcontent"]);
    };
    SocketBase.client_id = ""; //socketID
    SocketBase.group_name = ""; //组的名称
    return SocketBase;
}());
__reflect(SocketBase.prototype, "SocketBase");
//# sourceMappingURL=SocketBase.js.map