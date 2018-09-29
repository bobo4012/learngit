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
 *用户信息面板
 */
var UserPanel = (function (_super) {
    __extends(UserPanel, _super);
    function UserPanel(_main) {
        var _this = _super.call(this) || this;
        _this.showStatus = false;
        _this.sendBool = false; //标记是否在发送阶段
        _this.nullimg_bool_l = false; //左侧空头像是否在显示状态
        _this.nullimg_bool_r = false; //右侧空头像是否在显示状态
        _this.b_bool = false; //黑棋图标是否在显示状态
        _this.w_bool = false; //白棋图标是否在显示状态
        _this.timeNum_l = 0; //行棋累计时间-左
        _this.timeNum_r = 0; //行棋累计时间-右
        _this.par = _main;
        _this.createView(); //构建显示元素
        return _this;
    }
    //构建显示元素
    UserPanel.prototype.createView = function () {
        Global.userPanel = this;
        //黑棋
        this.b_bmp = Global.createBitmapByName("hei_png");
        //白棋
        this.w_bmp = Global.createBitmapByName("bai_png");
        //左侧头像容器
        this.headImgSprite_l = new egret.Sprite();
        this.headImgSprite_l.x = 20;
        this.headImgSprite_l.y = 16;
        this.addChild(this.headImgSprite_l);
        //左侧头像的遮罩
        this.maskShape_l = new egret.Shape();
        this.maskShape_l.graphics.beginFill(0x000000);
        this.maskShape_l.graphics.drawCircle(0, 0, 40);
        this.maskShape_l.graphics.endFill();
        this.maskShape_l.x = this.headImgSprite_l.x + 40;
        this.maskShape_l.y = this.headImgSprite_l.y + 40;
        this.addChild(this.maskShape_l);
        this.headImgSprite_l.mask = this.maskShape_l;
        //右侧头像的容器
        this.headImgSprite_r = new egret.Sprite();
        this.headImgSprite_r.x = Global.stageW - 100;
        this.headImgSprite_r.y = this.headImgSprite_l.y;
        this.addChild(this.headImgSprite_r);
        //左侧空头像
        this.nullimg_bmp_l = Global.createBitmapByName("nullheadimg_png");
        //右侧空头像
        this.nullimg_bmp_r = Global.createBitmapByName("nullheadimg_png");
        //右侧头像的遮罩
        this.maskShape_r = new egret.Shape();
        this.maskShape_r.graphics.beginFill(0x000000);
        this.maskShape_r.graphics.drawCircle(0, 0, 40);
        this.maskShape_r.graphics.endFill();
        this.maskShape_r.x = this.headImgSprite_r.x + 40;
        this.maskShape_r.y = this.headImgSprite_r.y + 40;
        this.addChild(this.maskShape_r);
        this.headImgSprite_r.mask = this.maskShape_r;
        //文本
        var _arr = new Array(["昵称:", this.headImgSprite_l.x, this.headImgSprite_l.y + 85], ["", 700, this.headImgSprite_l.y + 85]);
        this.textArr = new Array();
        for (var i = 0; i < _arr.length; i++) {
            var _text = new egret.TextField();
            _text.fontFamily = "SimHei";
            _text.textColor = 0x333333;
            _text.textAlign = "left";
            //_text.bold = true;
            _text.size = 32;
            //_text.width = 436;
            //_text.height = 50;
            _text.x = _arr[i][1];
            _text.y = _arr[i][2];
            _text.text = _arr[i][0];
            this.addChild(_text);
            this.textArr.push(_text);
            _text.touchEnabled = true;
            _text.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTapTouch_bak, this);
        }
        //时间显示文本-左
        this.timeTxt_l = new egret.TextField();
        this.timeTxt_l.fontFamily = "SimHei";
        this.timeTxt_l.textColor = 0x333333;
        this.timeTxt_l.textAlign = "left";
        this.timeTxt_l.size = 32;
        this.timeTxt_l.x = this.headImgSprite_l.x + 90;
        this.timeTxt_l.y = this.headImgSprite_l.y + 10;
        //this.addChild(this.timeTxt_l);
        //昵称的遮罩
        var nick_mask = new egret.Shape();
        nick_mask.graphics.beginFill(0x000000);
        nick_mask.graphics.drawRect(0, 0, 245, 50); //
        nick_mask.graphics.endFill();
        nick_mask.x = this.textArr[0].x;
        nick_mask.y = this.textArr[0].y;
        this.addChild(nick_mask);
        this.textArr[0].mask = nick_mask;
        //头像容器管理数组
        //this.headContainerArr = new Array(this.headImgSprite_l, this.headImgSprite_l, this.headImgSprite_r);
        //头像显示管理数组
        this.ownHeadimg = new egret.Bitmap();
        this.headArr = new Array([this.ownHeadimg, false], [this.head_img_l, false], [this.head_img_r, false]);
        //用户微信头像
        if (Global.headImgurl != "") {
            this.loadUsardImg();
        }
        this.textArr[0].text = Global.nickname;
    };
    UserPanel.prototype.showThis = function () {
        this.par.addChild(this);
        this.showStatus = true;
        //this.textArr[0].text = "昵称:"+Global.nickname;
    };
    UserPanel.prototype.removeThis = function () {
        if (this.showStatus) {
            this.par.removeChild(this);
            this.showStatus = false;
        }
    };
    //更改自己的角色,还原初始状态
    UserPanel.prototype.change_role = function () {
        this.clear_content(); //清除已显示的玩家信息
        this.headImgSprite_l.addChild(this.headArr[0][0]); //添加头像
        this.headArr[0][1] = this.headImgSprite_l; //标记自己的头像在显示状态
        this.textArr[0].text = Global.nickname;
    };
    //修改用户信息，准备开始棋局
    UserPanel.prototype.change_info = function () {
        this.clear_content(); //清除已显示的玩家信息
        //左侧
        if (Global.uid_l == Global.uid) {
            this.textArr[0].text = Global.nickname;
            this.headImgSprite_l.addChild(this.headArr[0][0]); //添加头像
            this.headArr[0][1] = this.headImgSprite_l; //标记自己的头像在显示状态
        }
        else {
            this.textArr[0].text = Global.nickName_l;
            this.headImgSprite_l.addChild(this.nullimg_bmp_l); //显示空头像
            this.nullimg_bool_l = true; //左侧空头像是否在显示状态
            if (Global.uid_l != "") {
                //发送获取该uid的信息
                var _magStr_l = '{"type":"getuidInfoByGroup","uid":"' + Global.uid_l +
                    '","group":"' + SocketBase.group_name + '"}';
                SocketBase.sendData(_magStr_l);
            }
        }
        //显示黑白棋子
        //egret.log("左侧Global.role_l="+Global.role_l);
        if (Global.role_l == "B") {
            this.b_bmp.x = this.headImgSprite_l.x + 90;
            this.b_bmp.y = this.headImgSprite_l.y + 30;
            this.addChild(this.b_bmp);
            this.b_bool = true;
        }
        else if (Global.role_l == "W") {
            this.w_bmp.x = this.headImgSprite_l.x + 90;
            this.w_bmp.y = this.headImgSprite_l.y + 30;
            this.addChild(this.w_bmp);
            this.w_bool = true;
        }
        //右侧
        if (Global.uid_r == Global.uid) {
            this.textArr[1].text = Global.nickname;
            this.headImgSprite_r.addChild(this.headArr[0][0]); //添加头像
            this.headArr[0][1] = this.headImgSprite_r; //标记自己的头像在显示状态
        }
        else {
            this.textArr[1].text = Global.nickName_r;
            this.headImgSprite_r.addChild(this.nullimg_bmp_r); //显示空头像
            this.nullimg_bool_r = true; //右侧空头像是否在显示状态
            if (Global.uid_r != "") {
                //发送获取该uid的信息
                var _magStr_r = '{"type":"getuidInfoByGroup","uid":"' + Global.uid_r +
                    '","group":"' + SocketBase.group_name + '"}';
                SocketBase.sendData(_magStr_r);
            }
        }
        //显示黑白棋子
        if (Global.role_r == "B") {
            this.b_bmp.x = this.headImgSprite_r.x - this.b_bmp.width - 10;
            this.b_bmp.y = this.headImgSprite_r.y + 30;
            this.addChild(this.b_bmp);
            this.b_bool = true;
        }
        else if (Global.role_r == "W") {
            this.w_bmp.x = this.headImgSprite_r.x - this.w_bmp.width - 10;
            this.w_bmp.y = this.headImgSprite_r.y + 30;
            this.addChild(this.w_bmp);
            this.w_bool = true;
        }
        this.textArr[1].x = Global.stageW - this.textArr[1].width - 20;
    };
    //修改右侧参与者信息
    UserPanel.prototype.change_uesr_r = function (_action) {
        if (this.nullimg_bool_r) {
            this.headImgSprite_r.removeChild(this.nullimg_bmp_r);
            this.nullimg_bool_r = false; //右侧空头像是否在显示状态
        }
        if (_action == "joinGame_own") {
            this.headImgSprite_r.addChild(this.headArr[0][0]); //添加头像
            this.headArr[0][1] = this.headImgSprite_r; //标记自己的头像在显示状态
            this.textArr[1].text = Global.nickname;
            this.textArr[1].x = Global.stageW - this.textArr[1].width - 20;
        }
        else if (_action == "joinGame_other") {
            this.textArr[1].text = Global.nickName_r;
            this.textArr[1].x = Global.stageW - this.textArr[1].width - 20;
            //显示头像-右侧
            this.loadUsardImg_r(SocketBase.group_all[2][3]);
        }
        //显示黑白棋子
        if (Global.role_r == "B") {
            this.b_bmp.x = this.headImgSprite_r.x - this.b_bmp.width - 10;
            this.b_bmp.y = this.headImgSprite_r.y + 30;
            this.addChild(this.b_bmp);
            this.b_bool = true;
        }
        else if (Global.role_r == "W") {
            this.w_bmp.x = this.headImgSprite_r.x - this.w_bmp.width - 10;
            this.w_bmp.y = this.headImgSprite_r.y + 30;
            this.addChild(this.w_bmp);
            this.w_bool = true;
        }
    };
    //load图片
    UserPanel.prototype.loadUsardImg = function () {
        var imageLoader = new egret.ImageLoader();
        imageLoader.addEventListener(egret.Event.COMPLETE, this.loadCompleteHandler, this); //
        imageLoader.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onimageLoadError, this); //添加加载失败侦听
        imageLoader.load(Global.headImgurl);
    };
    //加载头像成功
    UserPanel.prototype.loadCompleteHandler = function (event) {
        //终止问题，防止正在加载的图片在移除本面板时处理错误
        var imageLoader = event.currentTarget;
        //this.headArr[0][0] = new egret.Bitmap(imageLoader.data);
        var texture = new egret.Texture();
        texture._setBitmapData(imageLoader.data);
        this.headArr[0][0] = new egret.Bitmap(texture);
        this.headArr[0][0].width = 80;
        this.headArr[0][0].height = 80;
        this.headImgSprite_l.addChild(this.headArr[0][0]); //添加头像
        this.headArr[0][1] = this.headImgSprite_l; //标记自己的头像在显示状态
    };
    UserPanel.prototype.onimageLoadError = function () {
        //console.log("onLoadError");
    };
    //load左侧玩家图片
    UserPanel.prototype.loadUsardImg_l = function (_url_l) {
        var imageLoader = new egret.ImageLoader();
        imageLoader.addEventListener(egret.Event.COMPLETE, this.loadCompleteHandler_l, this); //
        imageLoader.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onimageLoadError_l, this); //添加加载失败侦听
        imageLoader.load(_url_l);
    };
    //加载左侧头像成功
    UserPanel.prototype.loadCompleteHandler_l = function (event) {
        //终止问题，防止正在加载的图片在移除本面板时处理错误
        var imageLoader = event.currentTarget;
        //this.headArr[1][0] = new egret.Bitmap(imageLoader.data);
        var texture = new egret.Texture();
        texture._setBitmapData(imageLoader.data);
        this.headArr[1][0] = new egret.Bitmap(texture);
        this.headArr[1][0].width = 80;
        this.headArr[1][0].height = 80;
        this.headImgSprite_l.addChild(this.headArr[1][0]); //添加头像
        this.headArr[1][1] = this.headImgSprite_l; //标记自己的头像在显示状态
    };
    UserPanel.prototype.onimageLoadError_l = function () {
        //console.log("onLoadError");
    };
    //load右侧玩家图片
    UserPanel.prototype.loadUsardImg_r = function (_url_r) {
        var imageLoader = new egret.ImageLoader();
        imageLoader.addEventListener(egret.Event.COMPLETE, this.loadCompleteHandler_r, this); //
        imageLoader.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onimageLoadError_r, this); //添加加载失败侦听
        imageLoader.load(_url_r);
    };
    //加载右侧头像成功
    UserPanel.prototype.loadCompleteHandler_r = function (event) {
        //终止问题，防止正在加载的图片在移除本面板时处理错误
        var imageLoader = event.currentTarget;
        //this.headArr[2][0] = new egret.Bitmap(imageLoader.data);
        var texture = new egret.Texture();
        texture._setBitmapData(imageLoader.data);
        this.headArr[2][0] = new egret.Bitmap(texture);
        this.headArr[2][0].width = 80;
        this.headArr[2][0].height = 80;
        this.headImgSprite_r.addChild(this.headArr[2][0]); //添加头像
        this.headArr[2][1] = this.headImgSprite_r; //标记自己的头像在显示状态
    };
    UserPanel.prototype.onimageLoadError_r = function () {
        //console.log("onLoadError");
    };
    //清除已显示的玩家信息
    UserPanel.prototype.clear_content = function () {
        //移除黑白棋图标
        if (this.b_bool) {
            this.removeChild(this.b_bmp);
            this.b_bool = false;
        }
        if (this.w_bool) {
            this.removeChild(this.w_bmp);
            this.w_bool = false;
        }
        //移除头像及昵称--未开始棋局时加载的自己头像
        for (var i = 0; i < this.headArr.length; i++) {
            if (this.headArr[i][1]) {
                this.headArr[i][1].removeChild(this.headArr[i][0]);
                this.headArr[i][1] = false;
            }
        }
        this.textArr[0].text = "";
        this.textArr[1].text = "";
        //移除空头像，如果在显示状态的话
        if (this.nullimg_bool_l) {
            this.headImgSprite_l.removeChild(this.nullimg_bmp_l);
            this.nullimg_bool_l = false; //左侧空头像是否在显示状态
        }
        if (this.nullimg_bool_r) {
            this.headImgSprite_r.removeChild(this.nullimg_bmp_r);
            this.nullimg_bool_r = false; //右侧空头像是否在显示状态
        }
    };
    //初始化时间
    UserPanel.prototype.init_time = function (_time_l, _time_r) {
        this.timeNum_l = _time_l; //行棋累计时间-左
        //this.timeTxt_l.text = "00:00:00";
        this.timeNum_r = _time_r; //行棋累计时间-右
        //this.timeTxt_r.text = "00:00:00";
    };
    //根据当前累计时间显示
    UserPanel.prototype.change_timetxt = function (_LorR, _time) {
        //小时
        var _hourNum = Math.floor(_time / 3600);
        var _hourStr;
        if (_hourNum < 10) {
            _hourStr = "0" + String(_hourNum);
        }
        else {
            _hourStr = String(_hourNum);
        }
        //分钟
        var _minuteNum = Math.floor(_time % 3600 / 60);
        var _minuteStr;
        if (_minuteNum < 10) {
            _minuteStr = "0" + String(_minuteNum);
        }
        else {
            _minuteStr = String(_minuteNum);
        }
        //秒
        var _secondNum = Math.floor(_time % 3600 % 60);
        var _secondStr;
        if (_secondNum < 10) {
            _secondStr = "0" + String(_secondNum);
        }
        else {
            _secondStr = String(_secondNum);
        }
        return _hourStr + ":" + _minuteStr + ":" + _secondStr;
    };
    //无用素材的点击 
    UserPanel.prototype.onTapTouch_bak = function (event) {
        //egret.log("无用点击");
    };
    return UserPanel;
}(egret.Sprite));
__reflect(UserPanel.prototype, "UserPanel");
//# sourceMappingURL=UserPanel.js.map