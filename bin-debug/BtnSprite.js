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
 *按钮类
 */
var BtnSprite = (function (_super) {
    __extends(BtnSprite, _super);
    function BtnSprite(_title, _bgStr, _color) {
        if (_color === void 0) { _color = -1; }
        var _this = _super.call(this) || this;
        _this.showStatus = false;
        _this.bgStr = "";
        _this.txt_color = -1;
        _this.titleStr = _title;
        _this.bgStr = _bgStr;
        _this.txt_color = _color;
        _this.createView(); //构建显示元素
        return _this;
    }
    //构建显示元素
    BtnSprite.prototype.createView = function () {
        //背景图
        if (this.txt_color == -1) {
            this.bg_bit = Global.createBitmapByName(this.bgStr);
            this.bg_bit.x = 0;
            this.bg_bit.y = 0;
            this.addChild(this.bg_bit);
        }
        else {
            this.bg_Shape = new egret.Shape();
            this.bg_Shape.graphics.beginFill(this.txt_color);
            this.bg_Shape.graphics.drawRoundRect(0, 0, 88, 66, 8, 8);
            this.bg_Shape.graphics.endFill();
            this.addChild(this.bg_Shape);
        }
        //this.bg_bit.touchEnabled = true;
        //this.bg_bit.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch_bak,this);
        //按钮标题
        var ck_w = 0;
        var ck_h = 0;
        if (this.txt_color == -1) {
            ck_w = this.bg_bit.width;
            ck_h = this.bg_bit.height;
        }
        else {
            ck_w = this.bg_Shape.width;
            ck_h = this.bg_Shape.height;
        }
        this.title_txt = new egret.TextField();
        this.title_txt.fontFamily = "SimHei";
        this.title_txt.textColor = 0xffffff;
        this.title_txt.bold = true;
        this.title_txt.textAlign = "center";
        this.title_txt.size = 38;
        this.title_txt.width = ck_w;
        //this.title_txt.height = 60;
        this.title_txt.text = this.titleStr;
        this.title_txt.x = 0;
        this.title_txt.y = ck_h / 2 - this.title_txt.height / 2;
        this.addChild(this.title_txt);
    };
    //无用点击 
    BtnSprite.prototype.onTapTouch_bak = function (event) {
        //egret.log("");
    };
    return BtnSprite;
}(egret.Sprite));
__reflect(BtnSprite.prototype, "BtnSprite");
//# sourceMappingURL=BtnSprite.js.map