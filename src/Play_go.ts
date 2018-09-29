/**
 *行棋类
 *
 * @author bobo
 *左上角 23，20   右下角694，747   X轴长度671 Y轴长度727  X轴步长37.27777777777778  Y轴步长40.38888888888889
 */

class Play_go extends egret.Sprite{
	public showStatus: Boolean = false; //是否在显示状态
	public nowPlayer:string = "B";//标记当前行动方， B黑方  W白方
	
    private waitingBool:boolean = false;//标记是否在等待对方走棋状态
    private par: GameStage;
    private btnEnable:Boolean = false;//按钮使能开关
	private now_index:number;//当前落子的位置索引
	private qp_bg:egret.Bitmap;//棋盘背景图
	private qpShape:egret.Shape = new egret.Shape();//棋盘线绘画层
	private stepX:number = 37.278;//X轴步长
	private stepY:number = 40.389;//Y轴步长
	private xyArr:any[];//交叉点数组
	private gameArr:any[];//行棋数组
	private src_x:number = 23;//X轴起始位置
	private src_y:number = 20;//Y轴起始位置
	private qizi_ready:egret.Bitmap = null;//待确认棋子
	private lettersArr:any[] = new Array("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s");
	private dajie_ind:number = -1;//单提一子的标记，为打劫判断使用
	private luozi_sound:egret.Sound;//落子声音
	private lastIndex:number = -1;//最后一步棋的索引
	private lastIcon:egret.Shape;//最后一个棋子标记
	private count_over_btn:BtnSprite;//查棋按钮
	
	public constructor(_par: GameStage) {
		super();
		this.par = _par;
		this.createView();//构建显示元素
	}

	//构建显示元素
    private createView(): void {
        var stageW: number = Global.stageW;
        var stageH: number = Global.stageH;
		Global.play_go = this;
		this.luozi_sound = RES.getRes("luozi_mp3");//落子声音

		//背景
        this.qp_bg = Global.createBitmapByName("qipan_jpg");
		//egret.log("stageW="+stageW+", stageH="+stageH);
		//egret.log("qp_bg.width="+this.qp_bg.width+", qp_bg.height="+this.qp_bg.height);
        this.addChild(this.qp_bg);

		//最后一个棋子标记
		this.lastIcon = new egret.Shape();
        this.lastIcon.graphics.beginFill(0xff5151);
        this.lastIcon.graphics.drawRect(0,0,18,18);
        this.lastIcon.graphics.endFill();
		this.lastIcon.alpha = 0.8;

		//初始化交叉点数组
		this.xyArr = new Array();
		for(var i=0; i<19; i++) {
			for(var j=0; j<19; j++) {
				this.xyArr.push([Math.floor(this.stepX*j)+this.src_x,Math.floor(this.stepY*i)+this.src_y]);
			}
		}
		//egret.log(this.xyArr);

		//绘制棋盘线
		this.qpShape.graphics.lineStyle(1,0x111111,1,false,egret.StageScaleMode.SHOW_ALL,null,null,3);//设置线条样式
		var count = this.xyArr.length;
        for(var i = 0;i <19;i++) {
			this.qpShape.graphics.moveTo(this.xyArr[i*19][0],this.xyArr[i*19][1]);//横线
            this.qpShape.graphics.lineTo(this.xyArr[i*19+18][0],this.xyArr[i*19+18][1]);

			this.qpShape.graphics.moveTo(this.xyArr[i][0],this.xyArr[i][1]);//竖线
            this.qpShape.graphics.lineTo(this.xyArr[i+342][0],this.xyArr[i+342][1]);

			//画星位
			if(i == 3 || i==9 || i==15) {
				for(var j=1; j<6; j+=2) {
					this.qpShape.graphics.beginFill(0x000000);
					this.qpShape.graphics.drawCircle(this.xyArr[i+j*57][0], this.xyArr[i+j*57][1], 3);
        			this.qpShape.graphics.endFill();
				}
			}
        }
		this.addChild(this.qpShape);

		//查棋按钮
		this.count_over_btn = new BtnSprite("查棋", "", 0x1aac19);
		this.count_over_btn.x = this.qp_bg.width/2 - 40;
		this.count_over_btn.y = this.qp_bg.y + this.qp_bg.height + 5;
		this.addChild(this.count_over_btn);
	}

	public showThis():void {
        if(this.showStatus) return;
		this.par.addChild(this);
		this.showStatus = true;
		this.startGame();//开始棋局

		this.count_over_btn.touchEnabled = true;//查棋按钮
        this.count_over_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch_over,this);
	}

	public removeThis():void {
		if(this.showStatus) {
			//移除棋盘触摸点击事件
			this.btnEnable_switch(false);
        	this.qp_bg.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.touch_fun,this);

			if(this.qizi_ready != null) {//如果当前有半透明棋子则先移除
				this.removeChild(this.qizi_ready);
				this.qizi_ready.touchEnabled = false;
				this.qizi_ready.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.qiziTouch_fun,this);//棋盘触摸点击事件
			}
			this.dajie_ind = -1;//单提一子的标记，为打劫判断使用
			this.nowPlayer = "B";//标记当前行动方， B黑方  W白方
			this.now_index=-1;//当前落子的位置索引
			
			//移除当前棋盘中的棋子
			for(var i=0; i<this.gameArr.length; i++) {
				if(this.gameArr[i][0]) {
					this.removeChild(this.gameArr[i][1]);//移除棋子
				}
			}

			//移除最后一步标记
			if(this.lastIndex > -1) {
				this.removeChild(this.lastIcon);
				this.lastIndex = -1;
			}
			this.gameArr = new Array();//清空行棋数组

			this.count_over_btn.touchEnabled = false;//查棋按钮
        	this.count_over_btn.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch_over,this);

			this.par.removeChild(this);
			this.showStatus = false;
		}
	}

	//开始棋局
	public startGame():void {
		//初始化行棋数组
		this.gameArr = new Array();
		for(var i=0; i<361; i++) {
			var _arr:any[] = new Array();
			this.gameArr.push(_arr);
		}
		Global.gameArr = this.gameArr;
		this.now_index=-1;//当前落子的位置索引

		//根据本局棋谱记录，设定当前行动方
		if(Global.baseData == "") {//尚未开始
			this.nowPlayer = "B";//标记当前行动方， B黑方  W白方
			this.lastIndex = -1;//最后一步的索引
		}
		else {
			Global.dateArr = Global.baseData.split("|");
			//最后一条记录
			var _role:string = Global.dateArr[Global.dateArr.length - 1].substring(0, 1);//角色代码
			var _sgfIndex:string = Global.dateArr[Global.dateArr.length - 1].substring(1);//最后一步的位置
			//egret.log("_role="+_role);
			this.lastIndex = Number(_sgfIndex);//最后一步的索引
			this.order_fun(_role);//交换行棋顺序
		}
		this.init_goGame();//根据棋谱，初始化当前棋盘局面(已落子的情况)
		this.show_lastIcon();//根据最后一步的索引，在棋子上显示标记

		//棋盘触摸点击事件
		this.btnEnable_switch(true);
        this.qp_bg.addEventListener(egret.TouchEvent.TOUCH_TAP,this.touch_fun,this);
	}

	//根据棋谱，初始化当前棋盘局面(已落子的情况)
	private init_goGame():void {
		if(Global.situation == "") return;
		var _first:string = "";//标记黑白棋子
		var _situationArr:any[] = Global.situation.split("|");
		//egret.log("落子数组长度："+_situationArr.length);
		for(var i=0; i<_situationArr.length; i++) {
			_first = _situationArr[i];//黑白棋子
			if(_first != "") {
				var _qizi:egret.Bitmap;
				if(_first == "B") {//黑棋子
					_qizi = Global.createBitmapByName("hei_png");
				}
				else if(_first == "W") {//白棋子
					_qizi = Global.createBitmapByName("bai_png");
				}
				_qizi.x = this.xyArr[i][0] - _qizi.width/2;
				_qizi.y = this.xyArr[i][1] - _qizi.height/2;
				this.addChild(_qizi);
				this.gameArr[i] = [_first,_qizi];//加入行棋数组
			}
		}
	}

	//点击棋盘
	private touch_fun(event: egret.TouchEvent):void {
		if(this.waitingBool) return;//如果在发送阶段，则返回
		if(Global.own_role != this.nowPlayer) return;//如果不该自己行棋，则返回 

		var _touch_index:number = this.xy2index(event.localX,event.localY);//根据点击坐标转换落子序号
		if(_touch_index > -1) {
			var qizied:Boolean = this.scanQizied_fun(_touch_index);//检索该处是否可以落子
			if(qizied) {
				this.now_index = _touch_index;//当前落子的位置索引
				this.showQizi_ready(this.xyArr[_touch_index][0], this.xyArr[_touch_index][1]);//显示半透明待确认棋子
			}
		}
		//egret.log("点击棋盘");
	}

	//点击响应使能开关
	public btnEnable_switch(_bool:Boolean):void {
		if(_bool) {
			this.btnEnable = true;
			this.qp_bg.touchEnabled = true;//开启触摸使能
		}
		else {
			this.btnEnable = false;
			this.qp_bg.touchEnabled = false;//开启触摸使能
		}
	}

	//根据点击坐标转换落子序号
	private xy2index(_touchX:number,_touchY:number):number {
		var return_num:number = -1;
		var _l:number = this.xyArr.length;
		for(var i=0; i<_l; i++) {
			var abs_x:number = Math.abs(_touchX - this.xyArr[i][0]);
			var abs_y:number = Math.abs(_touchY - this.xyArr[i][1]);
			if(abs_x <= this.stepX/2 && abs_y <= this.stepY/2) {
				return_num = i;
				break;
			}
		}
		return return_num;
	}

	//显示半透明待确认棋子
	private showQizi_ready(_qiX:number, _qiY:number):void {
		if(this.qizi_ready != null) {//如果当前有半透明棋子则先移除
			this.removeChild(this.qizi_ready);
			this.qizi_ready.touchEnabled = false;
			this.qizi_ready.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.qiziTouch_fun,this);//棋盘触摸点击事件
		}

		if(this.nowPlayer == "B") {//黑棋子
			this.qizi_ready = Global.createBitmapByName("hei_png");
		}
		else if(this.nowPlayer == "W") {//白棋子
			this.qizi_ready = Global.createBitmapByName("bai_png");
		}
		this.qizi_ready.x = _qiX - this.qizi_ready.width/2;
		this.qizi_ready.y = _qiY - this.qizi_ready.height/2;
		this.qizi_ready.alpha = 0.7;
		this.addChild(this.qizi_ready);
		this.qizi_ready.touchEnabled = true;
		this.qizi_ready.addEventListener(egret.TouchEvent.TOUCH_TAP,this.qiziTouch_fun,this);//棋盘触摸点击事件
	}

	//点击半透明棋子
	private qiziTouch_fun(event: egret.TouchEvent):void {
		//检查该组棋子的气
		var _groupObj:Object = Global.qi_group(this.now_index, this.nowPlayer);
		//egret.log("落点棋子有"+_groupObj["groupArr"].length+"个"+this.nowPlayer+"棋子连在一起，共有"+ _groupObj["qiArr"].length + "口气");

		//检查该子落下后，是否吃掉对方棋子
		var _groupall_Obj:Object = Global.enemy_group(this.now_index, this.nowPlayer);
		//egret.log("上方："+_groupall_Obj["qiArr_up"].length+"，下方："+_groupall_Obj["qiArr_down"].length+
					//"，左方："+_groupall_Obj["qiArr_left"].length+"，右方："+_groupall_Obj["qiArr_right"].length);

		if(_groupObj["qiArr"].length == 0) {//如果落子点没有气，则判断是否能吃掉对方棋子
			if(_groupall_Obj["qiArr_up"].length != 1 && _groupall_Obj["qiArr_down"].length != 1 && _groupall_Obj["qiArr_left"].length != 1 && _groupall_Obj["qiArr_right"].length != 1) {
				Global.show_pop("禁着点！");
				return;
			}
		}

		//是否打劫判断
		if(_groupObj["groupArr"].length == 1 && _groupObj["qiArr"].length == 0) {//如果是1个子，并且该棋子气为0
			if(_groupObj["groupArr"][0] == this.dajie_ind) {
				Global.show_pop("打劫违规！");
				return;
			}
		}

		this.qizi_ready.touchEnabled = false;
		this.qizi_ready.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.qiziTouch_fun,this);//棋盘触摸点击事件
		this.qizi_ready.alpha = 1;

		//var _sgfStr:string = this.nowPlayer+this.index2sgf(this.now_index);//根据位置索引，转换sgf位置格式
		var _sgfStr:string = this.nowPlayer+String(this.now_index);//根据位置索引，转换位置索引
		//egret.log(_sgfStr);
		//egret.log("this.now_index="+this.now_index);
		this.gameArr[this.now_index] = [this.nowPlayer,this.qizi_ready];//加入行棋数组
		this.qizi_ready = null;
		//egret.log("this.gameArr[this.now_index][0]="+this.gameArr[this.now_index][0]);

		//如果有死子，则提掉
		var _kill_count:number = 0;//统计被提子数量
		if(_groupall_Obj["qiArr_up"].length == 1) {
			if(_groupall_Obj["groupArr_up"].length == 1) this.dajie_ind = _groupall_Obj["groupArr_up"][0];//如果提掉1个子,则做标记，为打劫判断使用
			_kill_count += _groupall_Obj["groupArr_up"].length;
			this.kill_fun(_groupall_Obj["groupArr_up"]);
		}
		if(_groupall_Obj["qiArr_down"].length == 1) {
			if(_groupall_Obj["groupArr_down"].length == 1) this.dajie_ind = _groupall_Obj["groupArr_down"][0];//如果提掉1个子,则做标记，为打劫判断使用
			_kill_count += _groupall_Obj["groupArr_down"].length;
			this.kill_fun(_groupall_Obj["groupArr_down"]);
		}
		if(_groupall_Obj["qiArr_left"].length == 1) {
			if(_groupall_Obj["groupArr_left"].length == 1) this.dajie_ind = _groupall_Obj["groupArr_left"][0];//如果提掉1个子,则做标记，为打劫判断使用
			_kill_count += _groupall_Obj["groupArr_left"].length;
			this.kill_fun(_groupall_Obj["groupArr_left"]);
		}
		if(_groupall_Obj["qiArr_right"].length == 1) {
			if(_groupall_Obj["groupArr_right"].length == 1) this.dajie_ind = _groupall_Obj["groupArr_right"][0];//如果提掉1个子,则做标记，为打劫判断使用
			_kill_count += _groupall_Obj["groupArr_right"].length;
			this.kill_fun(_groupall_Obj["groupArr_right"]);
		}

		//如果不是仅提1字，则打劫标记复位 只统计1轮
		if(_kill_count != 1) {
			this.dajie_ind = -1;
		}

		this.lastIndex = this.now_index;//标记最后一步
		this.show_lastIcon();//根据最后一步的索引，在棋子上显示标记
		this.luozi_sound.play(0,1);//落子声音
		this.send_gomove(_sgfStr);//发送行棋落子消息
	}

	//检索该处是否可以落子
	private scanQizied_fun(_now_index:number):Boolean {
		if(this.gameArr[_now_index][0]) {
			return false;
		}
		else {
			return true;
		}
	}

	//根据位置索引，转换sgf位置格式
	private index2sgf(_arrindex:number):string {
		var returnStr:string = "";
		var col = _arrindex%19;//列 X轴
		var row = Math.floor(_arrindex/19);//行 Y轴
		returnStr = this.lettersArr[col] + this.lettersArr[row];
		return returnStr;
	}

	//根据sgf棋谱记录，转换位置索引
	//private sgf2index(_sgfStr:string):number {
		//var return_index:number = -1;

		//return return_index;
	//}

	//执行提子 this.gameArr[this.now_index] = [this.nowPlayer,this.qizi_ready];//加入行棋数组
	private kill_fun(_arr:any[]):void {
		for(var i=0; i<_arr.length; i++) {
			var _indnum:number = _arr[i];
			if(this.gameArr[_indnum][0]) {
				this.removeChild(this.gameArr[_indnum][1]);//移除棋子
				var newArr:any[] = new Array();
				this.gameArr[_indnum] = newArr;
			}
		}
	}

	//交换行棋顺序
    public order_fun(_nowPlaye:string):void {
		egret.log("交换行棋顺序："+_nowPlaye);
        if(_nowPlaye == "B") {
            this.nowPlayer = "W";
        }
        else if(_nowPlaye == "W") {
            this.nowPlayer = "B";
        }
		this.waitingBool = false;//标记是否在等待对方走棋状态
    }

	//发送行棋落子消息
	private send_gomove(_sgfStr:string):void {
		this.waitingBool = true;//标记是否在等待对方走棋状态

		//当前盘面，转换为字符串记录
		var _situation:string = "";
		if(this.gameArr[0][0]) {
			_situation = this.gameArr[i][0];
		}
		for(var i=1; i<361; i++) {
			if(this.gameArr[i][0]) {
				_situation += "|"+this.gameArr[i][0];
			}
			else {
				_situation += "|";
			}
		}
		//egret.log("_situation:"+_situation);

		var _magStr_l:string = '{"type":"gomove","uid":"'+Global.uid+
											'","group":"'+SocketBase.group_name+'","gomove":"'+_sgfStr+'","situation":"'+_situation+'"}';
        SocketBase.sendData(_magStr_l);
	}

	//收到落子消息
	public receive_gomove(_obj:Object):void {
		var _first:string = _obj["gomove"].substring(0, 1);//围棋颜色
		var _index:number = Number(_obj["gomove"].substring(1));//行棋位置索引
		
		if(_obj["uid"] != Global.uid) {//如果是其他人行棋，则在棋盘显示落子
			this.luozi_sound.play(0,1);//落子声音
			var _qizi:egret.Bitmap;
			if(_first == "B") {//黑棋子
				_qizi = Global.createBitmapByName("hei_png");
			}
			else if(_first == "W") {//白棋子
				_qizi = Global.createBitmapByName("bai_png");
			}
			_qizi.x = this.xyArr[_index][0] - _qizi.width/2;
			_qizi.y = this.xyArr[_index][1] - _qizi.height/2;
			this.addChild(_qizi);

			//检查该组棋子的气
			var _groupObj:Object = Global.qi_group(_index, _first);

			//检查该子落下后，是否吃掉对方棋子
			var _groupall_Obj:Object = Global.enemy_group(_index, _first);
			this.gameArr[_index] = [_first,_qizi];//加入行棋数组
			this.lastIndex = _index;//标记最后一步
			this.show_lastIcon();//根据最后一步的索引，在棋子上显示标记

			//如果有死子，则提掉
			var _kill_count:number = 0;//统计被提子数量
			if(_groupall_Obj["qiArr_up"].length == 1) {
				if(_groupall_Obj["groupArr_up"].length == 1) this.dajie_ind = _groupall_Obj["groupArr_up"][0];//如果提掉1个子,则做标记，为打劫判断使用
				_kill_count += _groupall_Obj["groupArr_up"].length;
				this.kill_fun(_groupall_Obj["groupArr_up"]);
			}
			if(_groupall_Obj["qiArr_down"].length == 1) {
				if(_groupall_Obj["groupArr_down"].length == 1) this.dajie_ind = _groupall_Obj["groupArr_down"][0];//如果提掉1个子,则做标记，为打劫判断使用
				_kill_count += _groupall_Obj["groupArr_down"].length;
				this.kill_fun(_groupall_Obj["groupArr_down"]);
			}
			if(_groupall_Obj["qiArr_left"].length == 1) {
				if(_groupall_Obj["groupArr_left"].length == 1) this.dajie_ind = _groupall_Obj["groupArr_left"][0];//如果提掉1个子,则做标记，为打劫判断使用
				_kill_count += _groupall_Obj["groupArr_left"].length;
				this.kill_fun(_groupall_Obj["groupArr_left"]);
			}
			if(_groupall_Obj["qiArr_right"].length == 1) {
				if(_groupall_Obj["groupArr_right"].length == 1) this.dajie_ind = _groupall_Obj["groupArr_right"][0];//如果提掉1个子,则做标记，为打劫判断使用
				_kill_count += _groupall_Obj["groupArr_right"].length;
				this.kill_fun(_groupall_Obj["groupArr_right"]);
			}

			//如果不是仅提1字，则打劫标记复位 只统计1轮
			if(_kill_count != 1) {
				this.dajie_ind = -1;
			}
		}
		this.order_fun(_first);//交换行棋顺序
	}

	//根据最后一步的索引，在棋子上显示标记
	private show_lastIcon():void {
		if(this.lastIndex == -1) return;
		
		this.lastIcon.x = this.xyArr[this.lastIndex][0] - this.lastIcon.width/2;
		this.lastIcon.y = this.xyArr[this.lastIndex][1] - this.lastIcon.height/2;
		this.addChild(this.lastIcon);
	}

	//查棋按钮
	private onTapTouch_over(event: egret.TouchEvent): void {
		Global.count_over();
	}












}