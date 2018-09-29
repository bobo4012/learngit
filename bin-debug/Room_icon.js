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
 *房间icon
 */
var Room_icon = (function (_super) {
    __extends(Room_icon, _super);
    function Room_icon(_par, _title) {
        var _this = _super.call(this) || this;
        _this.showStatus = false;
        _this.par = _par;
        _this.titleStr = _title;
        _this.createView(); //构建显示元素
        return _this;
    }
    //构建显示元素
    Room_icon.prototype.createView = function () {
        //背景图
        this.bg_bit = Global.createBitmapByName("r_btn_png");
        this.bg_bit.x = 0;
        this.bg_bit.y = 0;
        this.addChild(this.bg_bit);
        //this.bg_bit.touchEnabled = true;
        //this.bg_bit.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch_bak,this);
        //按钮标题
        this.title_txt = new egret.TextField();
        this.title_txt.fontFamily = "SimHei";
        this.title_txt.textColor = 0xffffff;
        this.title_txt.bold = true;
        this.title_txt.textAlign = "center";
        this.title_txt.size = 46;
        this.title_txt.width = this.bg_bit.width;
        //this.title_txt.height = 60;
        this.title_txt.text = this.titleStr;
        this.title_txt.x = 0;
        this.title_txt.y = this.bg_bit.height / 2 - this.title_txt.height / 2;
        this.addChild(this.title_txt);
    };
    Room_icon.prototype.showThis = function () {
        if (this.showStatus)
            return;
        this.par.addChild(this);
        this.showStatus = true;
    };
    Room_icon.prototype.removeThis = function () {
        if (this.showStatus) {
            this.par.removeChild(this);
            this.showStatus = false;
        }
    };
    //无用点击 
    Room_icon.prototype.onTapTouch_bak = function (event) {
        //egret.log("");
    };
    return Room_icon;
}(egret.Sprite));
__reflect(Room_icon.prototype, "Room_icon");
//# sourceMappingURL=Room_icon.js.map