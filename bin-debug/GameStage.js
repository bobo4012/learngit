var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
/**
 *
 *游戏场景
 *
 */
var GameStage = (function (_super) {
    __extends(GameStage, _super);
    function GameStage(_main) {
        var _this = _super.call(this) || this;
        _this.showStatus = false; //是否在显示状态
        _this.sendBool = false; //标记是否在发送阶段
        _this.homeBool = false; //返回首页按钮是否在显示状态
        _this.maxY = 150; //地图位移的下限
        _this.moveVal = 0; //记录触摸滑动位移
        _this.move_bool = false; //标记是否滑动过
        _this.main = _main;
        _this.createView(); //构建显示元素
        return _this;
    }
    //构建显示元素
    GameStage.prototype.createView = function () {
        Global.gameStage = this;
        //背景地图
        this.mapSprite = new egret.Sprite(); //地图容器
        //Global.mapContainerArr = new Array();//大地图数组
        //for(var i=0; i<Global.mapArr.length; i++) {
        //var _mapStr:string = Global.mapArr[i];
        //var mapContainer:MapContainer = new MapContainer(this, _mapStr, i);
        //Global.mapContainerArr.push(mapContainer);
        //}
        this.userPanel = new UserPanel(this); //用户信息面板
        //行棋类
        this.play_go = new Play_go(this);
        this.play_go.y = this.userPanel.y + this.userPanel.height + 10;
        //聊天面板
        this.chatSprite = new ChatSprite(this);
        //新建棋局按钮
        this.new_room_icon = new Room_icon(this, "新 建 棋 局");
        this.new_room_icon.x = Global.stageW / 2 - this.new_room_icon.width / 2; //居中显示
        this.new_room_icon.y = this.userPanel.y + this.userPanel.height + 60;
        //返回首页按钮
        this.homepage = Global.createBitmapByName("homepage_png");
        this.homepage.x = Global.stageW / 2 - this.homepage.width / 2;
        this.homepage.y = 0;
        this.homeBool = false; //返回首页按钮是否在显示状态
        //选择弹窗
        this.stagePop = new StagePop(this);
        //等待通信中
        this.waitingSprite = new WaitingSprite(this);
    };
    //显示处理
    GameStage.prototype.addFun = function () {
        this.main.addChild(this);
        this.showStatus = true; //是否在显示状态
        this.userPanel.showThis(); //显示用户信息面板
        if (Global.gogame_name == 'gogameid') {
            this.new_room_icon.showThis(); //显示新建按钮
        }
        else {
            SocketBase.sendjoinGroup(Global.gogame_name); //加入已有的组
        }
        this.addBtnTouchEvent(); //添加按钮触摸侦听
    };
    //显示棋局
    GameStage.prototype.show_game = function () {
        Global.main_btnEnable = true;
        this.new_room_icon.removeThis(); //移除新建按钮
        Global.userPanel.change_info(); //修改用户信息，准备开始棋局
        this.play_go.showThis(); //显示棋局
        this.addhomepage_btn(); //显示返回首页按钮
        this.chatSprite.showThis(); //显示聊天面板
        if (Global.own_role == "") {
            this.stagePop.showThis("尚未有人应战，请点击按钮选择");
        }
        else {
            window["sendMessage"](SocketBase.group_name); //传递棋局参数至网页容器，作为分享参数使用
        }
    };
    //移除等待通信画面并退出棋局
    GameStage.prototype.remove_waitingSprite = function (_action) {
        this.waitingSprite.removeThis(); //移除等待弹窗
        switch (_action) {
            case "leaveGroup"://在选择界面，自己退出棋局
                this.removehomepage_btn(); //移除返回首页按钮
                this.stagePop.removeThis(); //移除选择弹窗
                this.play_go.removeThis(); //移除棋局
                Global.userPanel.change_role(); //更改自己的角色,还原初始状态
                this.new_room_icon.showThis(); //显示新建按钮
                break;
            case "joinGame_own"://在选择界面，自己应战
                this.stagePop.removeThis(); //移除选择弹窗
                window["sendMessage"](SocketBase.group_name); //传递棋局参数至网页容器，作为分享参数使用
                //更新参与棋局的用户信息内容
                Global.userPanel.change_uesr_r(_action);
                break;
            case "joinGame_other"://在选择界面，其他人应战
                if (this.stagePop.showStatus) {
                    this.stagePop.removeThis(); //移除选择弹窗
                    window["sendMessage"](SocketBase.group_name); //传递棋局参数至网页容器，作为分享参数使用
                }
                //更新参与棋局的用户信息内容
                Global.userPanel.change_uesr_r(_action);
                break;
            case "joinViewer_own"://在选择界面，自己加入棋局--观众
                this.stagePop.removeThis(); //移除选择弹窗
                window["sendMessage"](SocketBase.group_name); //传递棋局参数至网页容器，作为分享参数使用
                break;
        }
    };
    //移除处理
    GameStage.prototype.removeFun = function () {
        this.showStatus = false; //是否在显示状态
        this.removeBtnTouchEvent(); //移除按钮触摸侦听
    };
    //添加按钮触摸侦听
    GameStage.prototype.addBtnTouchEvent = function () {
        this.new_room_icon.touchEnabled = true;
        this.new_room_icon.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTapTouch, this);
        //for(var i=0; i<this.btnArr.length; i++) {
        //this.btnArr[i].touchEnabled = true;
        //this.btnArr[i].addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
        //}
    };
    //移除按钮触摸侦听
    GameStage.prototype.removeBtnTouchEvent = function () {
        this.new_room_icon.touchEnabled = false;
        this.new_room_icon.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTapTouch, this);
        //for(var i=0; i<this.btnArr.length; i++) {
        //this.btnArr[i].touchEnabled = false;
        //this.btnArr[i].removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
        //}
    };
    //按钮点击 
    GameStage.prototype.onTapTouch = function (event) {
        if (!Global.main_btnEnable)
            return;
        Global.main_btnEnable = false;
        //egret.log(event.target);
        switch (event.target) {
            case this.new_room_icon://开始新棋局按钮
                SocketBase.sendjoinGroup(); //建立新组
                break;
        }
    };
    //背景触摸开始事件
    GameStage.prototype.onBeginTouch = function (event) {
        if (!Global.main_btnEnable)
            return;
        this.mapSprite.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onMoveTouch, this); //注册触摸滑动事件监听
        this.moveVal = event.stageY - this.mapSprite.y; //记录触摸滑动位移
        this.touchinitY = event.stageY; //记录触摸开始时的Y轴坐标
        this.move_bool = false; //标记是否滑动过
        //egret.log("触摸开始event.localY="+event.localY);
    };
    //背景触摸滑动事件
    GameStage.prototype.onMoveTouch = function (event) {
        this.move_bool = true; //标记是否滑动过
        //egret.log("this.move_bool="+this.move_bool);
        //var tag_moveVal = event.stageY - this.moveVal;//目标Y值
        var tag_moveVal = this.mapSprite.y + (event.stageY - this.touchinitY) * 2; //目标Y值
        if (tag_moveVal > this.maxY) {
            tag_moveVal = this.maxY;
        }
        else if (tag_moveVal < this.minY) {
            tag_moveVal = this.minY;
        }
        this.mapSprite.y = tag_moveVal;
        this.touchinitY = event.stageY; //记录触摸开始时的Y轴坐标
    };
    //触摸结束事件
    GameStage.prototype.onEndTouch = function (event) {
        this.mapSprite.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onMoveTouch, this); //移除触摸滑动事件监听
    };
    //显示等待通信的画面
    GameStage.prototype.show_waitingSprite = function () {
        this.waitingSprite.showThis(); //等待通信中
    };
    //显示返回首页按钮
    GameStage.prototype.addhomepage_btn = function () {
        this.addChild(this.homepage);
        this.homeBool = true;
        this.homepage.touchEnabled = true;
        this.homepage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTapTouch_home, this);
    };
    //移除返回首页按钮
    GameStage.prototype.removehomepage_btn = function () {
        if (this.homeBool) {
            this.removeChild(this.homepage);
            this.homeBool = false;
            this.homepage.touchEnabled = false;
            this.homepage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTapTouch_home, this);
        }
    };
    //返回首页按钮点击 
    GameStage.prototype.onTapTouch_home = function (event) {
        if (this.sendBool)
            return;
        this.sendBool = true; //标记是否在消息发送中
        //发送退出组的消息
        var _magStr_l = '{"type":"leaveGroup","uid":"' + Global.uid +
            '","group":"' + SocketBase.group_name + '"}';
        SocketBase.sendData(_magStr_l);
        this.show_waitingSprite(); //显示等待通信画面
    };
    //无用点击 
    GameStage.prototype.onTapTouch_bak = function (event) {
        //egret.log("");
    };
    return GameStage;
}(egret.Sprite));
__reflect(GameStage.prototype, "GameStage");
//# sourceMappingURL=GameStage.js.map