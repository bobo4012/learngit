var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var Global = (function () {
    function Global() {
    }
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    Global.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    //转换日期格式
    Global.formatDate = function (_timep) {
        var _date = new Date(_timep * 1000);
        //egret.log("_date="+_date);
        var year = _date.getFullYear();
        var month = _date.getMonth() + 1;
        var date = _date.getDate();
        var hour = _date.getHours();
        var minute = _date.getMinutes();
        var second = _date.getSeconds();
        return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
    };
    //检查该子落下后，是否吃掉对方棋子
    Global.enemy_group = function (_indnum, b_or_w) {
        var _objall = Object();
        var groupArr_up = new Array(); //上
        var qiArr_up = new Array();
        _objall["groupArr_up"] = groupArr_up;
        _objall["qiArr_up"] = qiArr_up;
        var groupArr_down = new Array(); //下
        var qiArr_down = new Array();
        _objall["groupArr_down"] = groupArr_down;
        _objall["qiArr_down"] = qiArr_down;
        var groupArr_left = new Array(); //左
        var qiArr_left = new Array();
        _objall["groupArr_left"] = groupArr_left;
        _objall["qiArr_left"] = qiArr_left;
        var groupArr_right = new Array(); //右
        var qiArr_right = new Array();
        _objall["groupArr_right"] = groupArr_right;
        _objall["qiArr_right"] = qiArr_right;
        //检查“上”
        var up_num = _indnum - 19;
        if (up_num >= 0) {
            if (this.gameArr[up_num][0]) {
                if (this.gameArr[up_num][0] != b_or_w) {
                    var _obj_up = this.qi_group(up_num, this.gameArr[up_num][0]);
                    _objall["groupArr_up"] = _obj_up["groupArr"];
                    _objall["qiArr_up"] = _obj_up["qiArr"];
                }
            }
        }
        //检查“下”
        var down_num = _indnum + 19;
        if (down_num < 361) {
            if (this.gameArr[down_num][0]) {
                if (this.gameArr[down_num][0] != b_or_w) {
                    //检查是否重复
                    var _bool_down = false;
                    if (_objall["groupArr_up"].length > 0) {
                        _bool_down = this.repeat_fun(_objall["groupArr_up"], down_num);
                    }
                    if (!_bool_down) {
                        var _obj_down = this.qi_group(down_num, this.gameArr[down_num][0]);
                        _objall["groupArr_down"] = _obj_down["groupArr"];
                        _objall["qiArr_down"] = _obj_down["qiArr"];
                    }
                }
            }
        }
        //检查“左”
        if (_indnum % 19 != 0) {
            var left_num = _indnum - 1;
            if (this.gameArr[left_num][0]) {
                if (this.gameArr[left_num][0] != b_or_w) {
                    //检查是否重复
                    var _bool_left = false;
                    if (_objall["groupArr_up"].length > 0) {
                        _bool_left = this.repeat_fun(_objall["groupArr_up"], left_num);
                    }
                    if (!_bool_left) {
                        if (_objall["groupArr_down"].length > 0) {
                            _bool_left = this.repeat_fun(_objall["groupArr_down"], left_num);
                        }
                    }
                    if (!_bool_left) {
                        var _obj_left = this.qi_group(left_num, this.gameArr[left_num][0]);
                        _objall["groupArr_left"] = _obj_left["groupArr"];
                        _objall["qiArr_left"] = _obj_left["qiArr"];
                    }
                }
            }
        }
        //检查“右”
        if (_indnum % 19 != 18) {
            var right_num = _indnum + 1;
            if (this.gameArr[right_num][0]) {
                if (this.gameArr[right_num][0] != b_or_w) {
                    //检查是否重复
                    var _bool_right = false;
                    if (_objall["groupArr_up"].length > 0) {
                        _bool_right = this.repeat_fun(_objall["groupArr_up"], right_num);
                    }
                    if (!_bool_right) {
                        if (_objall["groupArr_down"].length > 0) {
                            _bool_right = this.repeat_fun(_objall["groupArr_down"], right_num);
                        }
                    }
                    if (!_bool_right) {
                        if (_objall["groupArr_left"].length > 0) {
                            _bool_right = this.repeat_fun(_objall["groupArr_left"], right_num);
                        }
                    }
                    if (!_bool_right) {
                        var _obj_right = this.qi_group(right_num, this.gameArr[right_num][0]);
                        _objall["groupArr_right"] = _obj_right["groupArr"];
                        _objall["qiArr_right"] = _obj_right["qiArr"];
                    }
                }
            }
        }
        return _objall;
    };
    //检查某组棋的气数
    Global.qi_group = function (_indnum, b_or_w) {
        var _obj = Object();
        var _arr = new Array(); //同组棋子索引数组
        var qi_arr = new Array(); //同组棋子“气”索引数组
        _arr.push(_indnum);
        for (var i = 0; i < _arr.length; i++) {
            var _bool = true; //标记是否重复
            var qi_bool = true; //标记"气"是否重复
            //检查上下左右是否有己方棋子，如有则加入数组(不重复)
            var temp_index = _arr[i]; //当前待检查的位置索引
            //检查“上”
            var up_num = temp_index - 19;
            if (up_num >= 0) {
                if (this.gameArr[up_num][0]) {
                    if (this.gameArr[up_num][0] == b_or_w) {
                        _bool = this.repeat_fun(_arr, up_num);
                        if (!_bool)
                            _arr.push(up_num); //如果不重复则加入
                    }
                }
                else {
                    if (up_num != _indnum) {
                        qi_bool = this.repeat_fun(qi_arr, up_num);
                        if (!qi_bool)
                            qi_arr.push(up_num); //如果不重复则加入“气”数组
                    }
                }
            }
            //检查“下”
            var down_num = temp_index + 19;
            if (down_num < 361) {
                if (this.gameArr[down_num][0]) {
                    if (this.gameArr[down_num][0] == b_or_w) {
                        _bool = this.repeat_fun(_arr, down_num);
                        if (!_bool)
                            _arr.push(down_num);
                    }
                }
                else {
                    if (down_num != _indnum) {
                        qi_bool = this.repeat_fun(qi_arr, down_num);
                        if (!qi_bool)
                            qi_arr.push(down_num); //如果不重复则加入“气”数组
                    }
                }
            }
            //检查“左”
            if (temp_index % 19 != 0) {
                var left_num = temp_index - 1;
                if (this.gameArr[left_num][0]) {
                    if (this.gameArr[left_num][0] == b_or_w) {
                        _bool = this.repeat_fun(_arr, left_num);
                        if (!_bool)
                            _arr.push(left_num);
                    }
                }
                else {
                    if (left_num != _indnum) {
                        qi_bool = this.repeat_fun(qi_arr, left_num);
                        if (!qi_bool)
                            qi_arr.push(left_num); //如果不重复则加入“气”数组
                    }
                }
            }
            //检查“右”
            if (temp_index % 19 != 18) {
                var right_num = temp_index + 1;
                if (this.gameArr[right_num][0]) {
                    if (this.gameArr[right_num][0] == b_or_w) {
                        _bool = this.repeat_fun(_arr, right_num);
                        if (!_bool)
                            _arr.push(right_num);
                    }
                }
                else {
                    if (right_num != _indnum) {
                        qi_bool = this.repeat_fun(qi_arr, right_num);
                        if (!qi_bool)
                            qi_arr.push(right_num); //如果不重复则加入“气”数组
                    }
                }
            }
        }
        _obj["groupArr"] = _arr;
        _obj["qiArr"] = qi_arr;
        return _obj;
    };
    //检查是否重复
    Global.repeat_fun = function (_arr, _index) {
        var resBool = false;
        for (var i = 0; i < _arr.length; i++) {
            if (_arr[i] == _index) {
                resBool = true;
                break;
            }
        }
        return resBool;
    };
    //检查某处棋子的气数
    Global.qi_one = function (_indnum) {
        var qi_num = 0;
        //检查“上”
        var up_num = _indnum - 19;
        if (up_num >= 0) {
            if (!this.gameArr[up_num][0]) {
                qi_num++;
            }
        }
        //检查“下”
        var down_num = _indnum + 19;
        if (down_num < 361) {
            if (!this.gameArr[down_num][0]) {
                qi_num++;
            }
        }
        //检查“左”
        if (_indnum % 19 != 0) {
            var left_num = _indnum - 1;
            if (!this.gameArr[left_num][0]) {
                qi_num++;
            }
        }
        //检查“右”
        if (_indnum % 19 != 18) {
            var right_num = _indnum + 1;
            if (!this.gameArr[right_num][0]) {
                qi_num++;
            }
        }
        return qi_num;
    };
    Global.show_pop = function (_msgstr) {
        alert(_msgstr);
    };
    //复位棋局参与者信息
    Global.reset_gameInfo = function () {
        this.own_role = ""; //自己在棋局中的角色 B黑棋 W白棋 C旁观者
        this.role_l = ""; //当前棋局左侧玩家的角色
        this.uid_l = ""; //当前棋局的左侧玩家的uid
        this.role_r = ""; //当前棋局右侧玩家的角色
        this.uid_r = ""; //当前棋局的右侧玩家的uid
        this.baseData = ""; //本局棋谱
        this.dateArr = new Array(); //本局棋谱数组
    };
    //==================终局查棋===========================================
    /*
    算法思路：按顺序找到第一个空白位开始检查；从此空白位向四周延伸一直到遇到棋子或边界为止（如果在边界中掺杂黑白两色，则判定未完成收官或残子未提净）；
    检查结果边界为黑色或边界的空位区域，判定为黑棋围空。
    */
    Global.count_over = function () {
        var b_count = 0; //黑棋数量
        var kong_count = 0; //有效空的数量
        var bad_count = 0; //无效空的数量
        var goodArr = new Array(); //有效组
        var badArr = new Array(); //无效组
        for (var i = 0; i < this.gameArr.length; i++) {
            if (this.gameArr[i][0]) {
                if (this.gameArr[i][0] == "B") {
                    b_count++;
                }
            }
            else {
                //检查是否重复
                var _bool = false;
                for (var m = 0; m < goodArr.length; m++) {
                    _bool = this.repeat_fun(goodArr[m], i);
                    if (_bool)
                        break;
                }
                if (!_bool) {
                    for (var n = 0; n < badArr.length; n++) {
                        _bool = this.repeat_fun(badArr[n], i);
                        if (_bool)
                            break;
                    }
                }
                if (!_bool) {
                    var _obj = this.kong_group(i); //检查某处空白的组状态
                    if (_obj["goodBool"]) {
                        goodArr.push(_obj["groupArr"]);
                        kong_count += _obj["groupArr"].length;
                    }
                    else {
                        badArr.push(_obj["groupArr"]);
                        bad_count += _obj["groupArr"].length;
                    }
                }
            }
        }
        egret.log("有效空白数量:" + kong_count + "，共有空白组：" + goodArr.length + "组，黑子数量=" + b_count);
        egret.log("无效空白数量:" + bad_count + "，共有无效组：" + badArr.length + "组");
    };
    //检查某处空白的组状态
    Global.kong_group = function (_indnum) {
        var _obj = Object();
        var goodBool = true; //标记本组空白是否有效
        var _arr = new Array(); //同组空白索引数组
        _arr.push(_indnum);
        for (var i = 0; i < _arr.length; i++) {
            var _bool = true; //标记是否重复
            //检查上下左右是否有空白，如有则加入数组(不重复)
            var temp_index = _arr[i]; //当前待检查的位置索引
            //检查“上”
            var up_num = temp_index - 19;
            if (up_num >= 0) {
                if (this.gameArr[up_num][0]) {
                    if (this.gameArr[up_num][0] == "W") {
                        goodBool = false; //标记无效
                    }
                }
                else {
                    _bool = this.repeat_fun(_arr, up_num);
                    if (!_bool)
                        _arr.push(up_num); //如果不重复则加入
                }
            }
            //检查“下”
            var down_num = temp_index + 19;
            if (down_num < 361) {
                if (this.gameArr[down_num][0]) {
                    if (this.gameArr[down_num][0] == "W") {
                        goodBool = false; //标记无效
                    }
                }
                else {
                    _bool = this.repeat_fun(_arr, down_num);
                    if (!_bool)
                        _arr.push(down_num); //如果不重复则加入
                }
            }
            //检查“左”
            if (temp_index % 19 != 0) {
                var left_num = temp_index - 1;
                if (this.gameArr[left_num][0]) {
                    if (this.gameArr[left_num][0] == "W") {
                        goodBool = false; //标记无效
                    }
                }
                else {
                    _bool = this.repeat_fun(_arr, left_num);
                    if (!_bool)
                        _arr.push(left_num); //如果不重复则加入
                }
            }
            //检查“右”
            if (temp_index % 19 != 18) {
                var right_num = temp_index + 1;
                if (this.gameArr[right_num][0]) {
                    if (this.gameArr[right_num][0] == "W") {
                        goodBool = false; //标记无效
                    }
                }
                else {
                    _bool = this.repeat_fun(_arr, right_num);
                    if (!_bool)
                        _arr.push(right_num); //如果不重复则加入
                }
            }
        }
        _obj["groupArr"] = _arr;
        _obj["goodBool"] = goodBool;
        return _obj;
    };
    Global.glourl = 'http://gzh.game0635.com';
    Global.uid = "127"; //128  127
    Global.gogame_name = "128_1516418488765"; //当前棋局id  'gogameid'   128_1514472265116  128_1514900304943  128_1515078823678
    Global.headImgurl = "http://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIMgyoP2nl9cK3d9GQaiaNBfk4h0OUnJNH9a34xsGoPxefFXbCR0avsEASpNGKvfuzW6lCvJJJWFZA/0";
    Global.nickname = "egret端"; //jason  测试
    Global.main_btnEnable = true; //按钮触摸使能
    Global.situation = ""; //本局行棋记录
    Global.baseData = ""; //本局棋谱
    Global.own_role = ""; //自己在棋局中的角色 B黑棋 W白棋 C旁观者
    Global.role_l = ""; //当前棋局左侧玩家的角色
    Global.uid_l = ""; //当前棋局的左侧玩家的uid
    Global.nickName_l = ""; //当前棋局左侧玩家的昵称
    Global.time_l = 0; //当前棋局的左侧玩家的累计时间
    Global.role_r = ""; //当前棋局右侧玩家的角色
    Global.uid_r = ""; //当前棋局的右侧玩家的uid
    Global.nickName_r = ""; //当前棋局右侧玩家的昵称
    Global.time_r = 0; //当前棋局的右侧玩家的累计时间
    return Global;
}());
__reflect(Global.prototype, "Global");
//# sourceMappingURL=Global.js.map