/**
 *行棋类
 *
 * @author bobo
 *左上角 23，20   右下角694，747   X轴长度671 Y轴长度727  X轴步长37.27777777777778  Y轴步长40.38888888888889
 */
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
var Play_go = (function (_super) {
    __extends(Play_go, _super);
    function Play_go(_par) {
        var _this = _super.call(this) || this;
        _this.showStatus = false; //是否在显示状态
        _this.nowPlayer = "B"; //标记当前行动方， B黑方  W白方
        _this.waitingBool = false; //标记是否在等待对方走棋状态
        _this.btnEnable = false; //按钮使能开关
        _this.qpShape = new egret.Shape(); //棋盘线绘画层
        _this.stepX = 37.278; //X轴步长
        _this.stepY = 40.389; //Y轴步长
        _this.src_x = 23; //X轴起始位置
        _this.src_y = 20; //Y轴起始位置
        _this.qizi_ready = null; //待确认棋子
        _this.lettersArr = new Array("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s");
        _this.dajie_ind = -1; //单提一子的标记，为打劫判断使用
        _this.lastIndex = -1; //最后一步棋的索引
        _this.par = _par;
        _this.createView(); //构建显示元素
        return _this;
    }
    //构建显示元素
    Play_go.prototype.createView = function () {
        var stageW = Global.stageW;
        var stageH = Global.stageH;
        Global.play_go = this;
        this.luozi_sound = RES.getRes("luozi_mp3"); //落子声音
        //背景
        this.qp_bg = Global.createBitmapByName("qipan_jpg");
        //egret.log("stageW="+stageW+", stageH="+stageH);
        //egret.log("qp_bg.width="+this.qp_bg.width+", qp_bg.height="+this.qp_bg.height);
        this.addChild(this.qp_bg);
        //最后一个棋子标记
        this.lastIcon = new egret.Shape();
        this.lastIcon.graphics.beginFill(0xff5151);
        this.lastIcon.graphics.drawRect(0, 0, 18, 18);
        this.lastIcon.graphics.endFill();
        this.lastIcon.alpha = 0.8;
        //初始化交叉点数组
        this.xyArr = new Array();
        for (var i = 0; i < 19; i++) {
            for (var j = 0; j < 19; j++) {
                this.xyArr.push([Math.floor(this.stepX * j) + this.src_x, Math.floor(this.stepY * i) + this.src_y]);
            }
        }
        //egret.log(this.xyArr);
        //绘制棋盘线
        this.qpShape.graphics.lineStyle(1, 0x111111, 1, false, egret.StageScaleMode.SHOW_ALL, null, null, 3); //设置线条样式
        var count = this.xyArr.length;
        for (var i = 0; i < 19; i++) {
            this.qpShape.graphics.moveTo(this.xyArr[i * 19][0], this.xyArr[i * 19][1]); //横线
            this.qpShape.graphics.lineTo(this.xyArr[i * 19 + 18][0], this.xyArr[i * 19 + 18][1]);
            this.qpShape.graphics.moveTo(this.xyArr[i][0], this.xyArr[i][1]); //竖线
            this.qpShape.graphics.lineTo(this.xyArr[i + 342][0], this.xyArr[i + 342][1]);
            //画星位
            if (i == 3 || i == 9 || i == 15) {
                for (var j = 1; j < 6; j += 2) {
                    this.qpShape.graphics.beginFill(0x000000);
                    this.qpShape.graphics.drawCircle(this.xyArr[i + j * 57][0], this.xyArr[i + j * 57][1], 3);
                    this.qpShape.graphics.endFill();
                }
            }
        }
        this.addChild(this.qpShape);
        //查棋按钮
        this.count_over_btn = new BtnSprite("查棋", "", 0x1aac19);
        this.count_over_btn.x = this.qp_bg.width / 2 - 40;
        this.count_over_btn.y = this.qp_bg.y + this.qp_bg.height + 5;
        this.addChild(this.count_over_btn);
    };
    Play_go.prototype.showThis = function () {
        if (this.showStatus)
            return;
        this.par.addChild(this);
        this.showStatus = true;
        this.startGame(); //开始棋局
        this.count_over_btn.touchEnabled = true; //查棋按钮
        this.count_over_btn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTapTouch_over, this);
    };
    Play_go.prototype.removeThis = function () {
        if (this.showStatus) {
            //移除棋盘触摸点击事件
            this.btnEnable_switch(false);
            this.qp_bg.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.touch_fun, this);
            if (this.qizi_ready != null) {
                this.removeChild(this.qizi_ready);
                this.qizi_ready.touchEnabled = false;
                this.qizi_ready.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.qiziTouch_fun, this); //棋盘触摸点击事件
            }
            this.dajie_ind = -1; //单提一子的标记，为打劫判断使用
            this.nowPlayer = "B"; //标记当前行动方， B黑方  W白方
            this.now_index = -1; //当前落子的位置索引
            //移除当前棋盘中的棋子
            for (var i = 0; i < this.gameArr.length; i++) {
                if (this.gameArr[i][0]) {
                    this.removeChild(this.gameArr[i][1]); //移除棋子
                }
            }
            //移除最后一步标记
            if (this.lastIndex > -1) {
                this.removeChild(this.lastIcon);
                this.lastIndex = -1;
            }
            this.gameArr = new Array(); //清空行棋数组
            this.count_over_btn.touchEnabled = false; //查棋按钮
            this.count_over_btn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTapTouch_over, this);
            this.par.removeChild(this);
            this.showStatus = false;
        }
    };
    //开始棋局
    Play_go.prototype.startGame = function () {
        //初始化行棋数组
        this.gameArr = new Array();
        for (var i = 0; i < 361; i++) {
            var _arr = new Array();
            this.gameArr.push(_arr);
        }
        Global.gameArr = this.gameArr;
        this.now_index = -1; //当前落子的位置索引
        //根据本局棋谱记录，设定当前行动方
        if (Global.baseData == "") {
            this.nowPlayer = "B"; //标记当前行动方， B黑方  W白方
            this.lastIndex = -1; //最后一步的索引
        }
        else {
            Global.dateArr = Global.baseData.split("|");
            //最后一条记录
            var _role = Global.dateArr[Global.dateArr.length - 1].substring(0, 1); //角色代码
            var _sgfIndex = Global.dateArr[Global.dateArr.length - 1].substring(1); //最后一步的位置
            //egret.log("_role="+_role);
            this.lastIndex = Number(_sgfIndex); //最后一步的索引
            this.order_fun(_role); //交换行棋顺序
        }
        this.init_goGame(); //根据棋谱，初始化当前棋盘局面(已落子的情况)
        this.show_lastIcon(); //根据最后一步的索引，在棋子上显示标记
        //棋盘触摸点击事件
        this.btnEnable_switch(true);
        this.qp_bg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touch_fun, this);
    };
    //根据棋谱，初始化当前棋盘局面(已落子的情况)
    Play_go.prototype.init_goGame = function () {
        if (Global.situation == "")
            return;
        var _first = ""; //标记黑白棋子
        var _situationArr = Global.situation.split("|");
        //egret.log("落子数组长度："+_situationArr.length);
        for (var i = 0; i < _situationArr.length; i++) {
            _first = _situationArr[i]; //黑白棋子
            if (_first != "") {
                var _qizi;
                if (_first == "B") {
                    _qizi = Global.createBitmapByName("hei_png");
                }
                else if (_first == "W") {
                    _qizi = Global.createBitmapByName("bai_png");
                }
                _qizi.x = this.xyArr[i][0] - _qizi.width / 2;
                _qizi.y = this.xyArr[i][1] - _qizi.height / 2;
                this.addChild(_qizi);
                this.gameArr[i] = [_first, _qizi]; //加入行棋数组
            }
        }
    };
    //点击棋盘
    Play_go.prototype.touch_fun = function (event) {
        if (this.waitingBool)
            return; //如果在发送阶段，则返回
        if (Global.own_role != this.nowPlayer)
            return; //如果不该自己行棋，则返回 
        var _touch_index = this.xy2index(event.localX, event.localY); //根据点击坐标转换落子序号
        if (_touch_index > -1) {
            var qizied = this.scanQizied_fun(_touch_index); //检索该处是否可以落子
            if (qizied) {
                this.now_index = _touch_index; //当前落子的位置索引
                this.showQizi_ready(this.xyArr[_touch_index][0], this.xyArr[_touch_index][1]); //显示半透明待确认棋子
            }
        }
        //egret.log("点击棋盘");
    };
    //点击响应使能开关
    Play_go.prototype.btnEnable_switch = function (_bool) {
        if (_bool) {
            this.btnEnable = true;
            this.qp_bg.touchEnabled = true; //开启触摸使能
        }
        else {
            this.btnEnable = false;
            this.qp_bg.touchEnabled = false; //开启触摸使能
        }
    };
    //根据点击坐标转换落子序号
    Play_go.prototype.xy2index = function (_touchX, _touchY) {
        var return_num = -1;
        var _l = this.xyArr.length;
        for (var i = 0; i < _l; i++) {
            var abs_x = Math.abs(_touchX - this.xyArr[i][0]);
            var abs_y = Math.abs(_touchY - this.xyArr[i][1]);
            if (abs_x <= this.stepX / 2 && abs_y <= this.stepY / 2) {
                return_num = i;
                break;
            }
        }
        return return_num;
    };
    //显示半透明待确认棋子
    Play_go.prototype.showQizi_ready = function (_qiX, _qiY) {
        if (this.qizi_ready != null) {
            this.removeChild(this.qizi_ready);
            this.qizi_ready.touchEnabled = false;
            this.qizi_ready.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.qiziTouch_fun, this); //棋盘触摸点击事件
        }
        if (this.nowPlayer == "B") {
            this.qizi_ready = Global.createBitmapByName("hei_png");
        }
        else if (this.nowPlayer == "W") {
            this.qizi_ready = Global.createBitmapByName("bai_png");
        }
        this.qizi_ready.x = _qiX - this.qizi_ready.width / 2;
        this.qizi_ready.y = _qiY - this.qizi_ready.height / 2;
        this.qizi_ready.alpha = 0.7;
        this.addChild(this.qizi_ready);
        this.qizi_ready.touchEnabled = true;
        this.qizi_ready.addEventListener(egret.TouchEvent.TOUCH_TAP, this.qiziTouch_fun, this); //棋盘触摸点击事件
    };
    //点击半透明棋子
    Play_go.prototype.qiziTouch_fun = function (event) {
        //检查该组棋子的气
        var _groupObj = Global.qi_group(this.now_index, this.nowPlayer);
        //egret.log("落点棋子有"+_groupObj["groupArr"].length+"个"+this.nowPlayer+"棋子连在一起，共有"+ _groupObj["qiArr"].length + "口气");
        //检查该子落下后，是否吃掉对方棋子
        var _groupall_Obj = Global.enemy_group(this.now_index, this.nowPlayer);
        //egret.log("上方："+_groupall_Obj["qiArr_up"].length+"，下方："+_groupall_Obj["qiArr_down"].length+
        //"，左方："+_groupall_Obj["qiArr_left"].length+"，右方："+_groupall_Obj["qiArr_right"].length);
        if (_groupObj["qiArr"].length == 0) {
            if (_groupall_Obj["qiArr_up"].length != 1 && _groupall_Obj["qiArr_down"].length != 1 && _groupall_Obj["qiArr_left"].length != 1 && _groupall_Obj["qiArr_right"].length != 1) {
                Global.show_pop("禁着点！");
                return;
            }
        }
        //是否打劫判断
        if (_groupObj["groupArr"].length == 1 && _groupObj["qiArr"].length == 0) {
            if (_groupObj["groupArr"][0] == this.dajie_ind) {
                Global.show_pop("打劫违规！");
                return;
            }
        }
        this.qizi_ready.touchEnabled = false;
        this.qizi_ready.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.qiziTouch_fun, this); //棋盘触摸点击事件
        this.qizi_ready.alpha = 1;
        //var _sgfStr:string = this.nowPlayer+this.index2sgf(this.now_index);//根据位置索引，转换sgf位置格式
        var _sgfStr = this.nowPlayer + String(this.now_index); //根据位置索引，转换位置索引
        //egret.log(_sgfStr);
        //egret.log("this.now_index="+this.now_index);
        this.gameArr[this.now_index] = [this.nowPlayer, this.qizi_ready]; //加入行棋数组
        this.qizi_ready = null;
        //egret.log("this.gameArr[this.now_index][0]="+this.gameArr[this.now_index][0]);
        //如果有死子，则提掉
        var _kill_count = 0; //统计被提子数量
        if (_groupall_Obj["qiArr_up"].length == 1) {
            if (_groupall_Obj["groupArr_up"].length == 1)
                this.dajie_ind = _groupall_Obj["groupArr_up"][0]; //如果提掉1个子,则做标记，为打劫判断使用
            _kill_count += _groupall_Obj["groupArr_up"].length;
            this.kill_fun(_groupall_Obj["groupArr_up"]);
        }
        if (_groupall_Obj["qiArr_down"].length == 1) {
            if (_groupall_Obj["groupArr_down"].length == 1)
                this.dajie_ind = _groupall_Obj["groupArr_down"][0]; //如果提掉1个子,则做标记，为打劫判断使用
            _kill_count += _groupall_Obj["groupArr_down"].length;
            this.kill_fun(_groupall_Obj["groupArr_down"]);
        }
        if (_groupall_Obj["qiArr_left"].length == 1) {
            if (_groupall_Obj["groupArr_left"].length == 1)
                this.dajie_ind = _groupall_Obj["groupArr_left"][0]; //如果提掉1个子,则做标记，为打劫判断使用
            _kill_count += _groupall_Obj["groupArr_left"].length;
            this.kill_fun(_groupall_Obj["groupArr_left"]);
        }
        if (_groupall_Obj["qiArr_right"].length == 1) {
            if (_groupall_Obj["groupArr_right"].length == 1)
                this.dajie_ind = _groupall_Obj["groupArr_right"][0]; //如果提掉1个子,则做标记，为打劫判断使用
            _kill_count += _groupall_Obj["groupArr_right"].length;
            this.kill_fun(_groupall_Obj["groupArr_right"]);
        }
        //如果不是仅提1字，则打劫标记复位 只统计1轮
        if (_kill_count != 1) {
            this.dajie_ind = -1;
        }
        this.lastIndex = this.now_index; //标记最后一步
        this.show_lastIcon(); //根据最后一步的索引，在棋子上显示标记
        this.luozi_sound.play(0, 1); //落子声音
        this.send_gomove(_sgfStr); //发送行棋落子消息
    };
    //检索该处是否可以落子
    Play_go.prototype.scanQizied_fun = function (_now_index) {
        if (this.gameArr[_now_index][0]) {
            return false;
        }
        else {
            return true;
        }
    };
    //根据位置索引，转换sgf位置格式
    Play_go.prototype.index2sgf = function (_arrindex) {
        var returnStr = "";
        var col = _arrindex % 19; //列 X轴
        var row = Math.floor(_arrindex / 19); //行 Y轴
        returnStr = this.lettersArr[col] + this.lettersArr[row];
        return returnStr;
    };
    //根据sgf棋谱记录，转换位置索引
    //private sgf2index(_sgfStr:string):number {
    //var return_index:number = -1;
    //return return_index;
    //}
    //执行提子 this.gameArr[this.now_index] = [this.nowPlayer,this.qizi_ready];//加入行棋数组
    Play_go.prototype.kill_fun = function (_arr) {
        for (var i = 0; i < _arr.length; i++) {
            var _indnum = _arr[i];
            if (this.gameArr[_indnum][0]) {
                this.removeChild(this.gameArr[_indnum][1]); //移除棋子
                var newArr = new Array();
                this.gameArr[_indnum] = newArr;
            }
        }
    };
    //交换行棋顺序
    Play_go.prototype.order_fun = function (_nowPlaye) {
        egret.log("交换行棋顺序：" + _nowPlaye);
        if (_nowPlaye == "B") {
            this.nowPlayer = "W";
        }
        else if (_nowPlaye == "W") {
            this.nowPlayer = "B";
        }
        this.waitingBool = false; //标记是否在等待对方走棋状态
    };
    //发送行棋落子消息
    Play_go.prototype.send_gomove = function (_sgfStr) {
        this.waitingBool = true; //标记是否在等待对方走棋状态
        //当前盘面，转换为字符串记录
        var _situation = "";
        if (this.gameArr[0][0]) {
            _situation = this.gameArr[i][0];
        }
        for (var i = 1; i < 361; i++) {
            if (this.gameArr[i][0]) {
                _situation += "|" + this.gameArr[i][0];
            }
            else {
                _situation += "|";
            }
        }
        //egret.log("_situation:"+_situation);
        var _magStr_l = '{"type":"gomove","uid":"' + Global.uid +
            '","group":"' + SocketBase.group_name + '","gomove":"' + _sgfStr + '","situation":"' + _situation + '"}';
        SocketBase.sendData(_magStr_l);
    };
    //收到落子消息
    Play_go.prototype.receive_gomove = function (_obj) {
        var _first = _obj["gomove"].substring(0, 1); //围棋颜色
        var _index = Number(_obj["gomove"].substring(1)); //行棋位置索引
        if (_obj["uid"] != Global.uid) {
            this.luozi_sound.play(0, 1); //落子声音
            var _qizi;
            if (_first == "B") {
                _qizi = Global.createBitmapByName("hei_png");
            }
            else if (_first == "W") {
                _qizi = Global.createBitmapByName("bai_png");
            }
            _qizi.x = this.xyArr[_index][0] - _qizi.width / 2;
            _qizi.y = this.xyArr[_index][1] - _qizi.height / 2;
            this.addChild(_qizi);
            //检查该组棋子的气
            var _groupObj = Global.qi_group(_index, _first);
            //检查该子落下后，是否吃掉对方棋子
            var _groupall_Obj = Global.enemy_group(_index, _first);
            this.gameArr[_index] = [_first, _qizi]; //加入行棋数组
            this.lastIndex = _index; //标记最后一步
            this.show_lastIcon(); //根据最后一步的索引，在棋子上显示标记
            //如果有死子，则提掉
            var _kill_count = 0; //统计被提子数量
            if (_groupall_Obj["qiArr_up"].length == 1) {
                if (_groupall_Obj["groupArr_up"].length == 1)
                    this.dajie_ind = _groupall_Obj["groupArr_up"][0]; //如果提掉1个子,则做标记，为打劫判断使用
                _kill_count += _groupall_Obj["groupArr_up"].length;
                this.kill_fun(_groupall_Obj["groupArr_up"]);
            }
            if (_groupall_Obj["qiArr_down"].length == 1) {
                if (_groupall_Obj["groupArr_down"].length == 1)
                    this.dajie_ind = _groupall_Obj["groupArr_down"][0]; //如果提掉1个子,则做标记，为打劫判断使用
                _kill_count += _groupall_Obj["groupArr_down"].length;
                this.kill_fun(_groupall_Obj["groupArr_down"]);
            }
            if (_groupall_Obj["qiArr_left"].length == 1) {
                if (_groupall_Obj["groupArr_left"].length == 1)
                    this.dajie_ind = _groupall_Obj["groupArr_left"][0]; //如果提掉1个子,则做标记，为打劫判断使用
                _kill_count += _groupall_Obj["groupArr_left"].length;
                this.kill_fun(_groupall_Obj["groupArr_left"]);
            }
            if (_groupall_Obj["qiArr_right"].length == 1) {
                if (_groupall_Obj["groupArr_right"].length == 1)
                    this.dajie_ind = _groupall_Obj["groupArr_right"][0]; //如果提掉1个子,则做标记，为打劫判断使用
                _kill_count += _groupall_Obj["groupArr_right"].length;
                this.kill_fun(_groupall_Obj["groupArr_right"]);
            }
            //如果不是仅提1字，则打劫标记复位 只统计1轮
            if (_kill_count != 1) {
                this.dajie_ind = -1;
            }
        }
        this.order_fun(_first); //交换行棋顺序
    };
    //根据最后一步的索引，在棋子上显示标记
    Play_go.prototype.show_lastIcon = function () {
        if (this.lastIndex == -1)
            return;
        this.lastIcon.x = this.xyArr[this.lastIndex][0] - this.lastIcon.width / 2;
        this.lastIcon.y = this.xyArr[this.lastIndex][1] - this.lastIcon.height / 2;
        this.addChild(this.lastIcon);
    };
    //查棋按钮
    Play_go.prototype.onTapTouch_over = function (event) {
        Global.count_over();
    };
    return Play_go;
}(egret.Sprite));
__reflect(Play_go.prototype, "Play_go");
//# sourceMappingURL=Play_go.js.map