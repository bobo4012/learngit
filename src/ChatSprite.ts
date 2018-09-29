/**
 *
 *聊天面板
 */
class ChatSprite extends egret.Sprite{
	private par:GameStage;
	private showStatus:Boolean = false;
    private sendBool:Boolean = false;//标记是否在发送阶段

	private chatContainer:egret.Sprite;//聊天记录容器
	private chatdateTxt:egret.TextField;//聊天记录文本
	private maskShape:egret.Shape;//聊天记录容器的遮罩
	private minY:number = 0;//聊天记录位移的上限
    private maxY:number = 0;//聊天记录位移的下限
    private moveVal:number = 0;//记录触摸滑动位移
    private touchinitY:number;//触摸按下时的Y轴坐标
	private maskHeight:number = 230;//遮罩层的高度

	private input_bg:egret.Bitmap;//输入背景条
    private inputTxt:egret.TextField;//输入文本
	private btnSprite:BtnSprite;//发送按钮
	private msg_sound:egret.Sound;//消息声音

	public constructor(_main:GameStage) {
		super();
		this.par = _main;
		this.createView();//构建显示元素
	}

	//构建显示元素
	private createView(): void {
		Global.chatSprite = this;
		this.msg_sound = RES.getRes("msg_mp3");//消息声音
		//聊天记录容器
		this.chatContainer = new egret.Sprite();
		this.chatContainer.x = 0;
		this.addChild(this.chatContainer);

		//聊天记录文本
		this.chatdateTxt = new egret.TextField();
		this.chatdateTxt.fontFamily = "SimHei";
        this.chatdateTxt.textColor = 0x000000;
        this.chatdateTxt.textAlign = "left";
        this.chatdateTxt.size = 32;
		this.chatdateTxt.width = 710;
        this.chatdateTxt.x = 5;
        this.chatdateTxt.y = 0;
        this.chatContainer.addChild(this.chatdateTxt);

		//聊天记录容器的遮罩
        this.maskShape = new egret.Shape();
        this.maskShape.graphics.beginFill(0x000000);
        this.maskShape.graphics.drawRect(0,0,720, this.maskHeight);
        this.maskShape.graphics.endFill();
        this.maskShape.x = this.chatContainer.x;
        this.maskShape.y = this.chatContainer.y;
        this.addChild(this.maskShape);
        this.chatContainer.mask = this.maskShape;

		//输入背景条
		this.input_bg = Global.createBitmapByName("chat_input_jpg");
        this.input_bg.x = 0;
        this.input_bg.y = this.maskShape.y + this.maskShape.height - this.input_bg.height;
        this.addChild(this.input_bg);

        //输入文本
        this.inputTxt = new egret.TextField();
        this.inputTxt.fontFamily = "SimHei";
        this.inputTxt.textColor = 0x000000;
        this.inputTxt.textAlign = "left";
        this.inputTxt.size = 34;
		this.inputTxt.width = 588;
		this.inputTxt.height = 40;
        this.inputTxt.x = this.input_bg.x + 18;
        this.inputTxt.y = this.input_bg.y + 30;
		this.inputTxt.type = egret.TextFieldType.INPUT;
		this.inputTxt.maxChars = 50;//最大输入字符数
        this.addChild(this.inputTxt);

		//发送按钮
		this.btnSprite = new BtnSprite("发送", "", 0x1aac19);
		this.btnSprite.x = this.input_bg.x + 620;
		this.btnSprite.y = this.input_bg.y + 15;
		this.addChild(this.btnSprite);

		this.y = Global.stageH - this.height;
	}

	public showThis():void {
		this.par.addChild(this);
		this.showStatus = true;

		this.chatContainer.touchEnabled = true;
        this.chatContainer.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.onBeginTouch,this);//聊天容器触摸开始事件
        this.chatContainer.addEventListener(egret.TouchEvent.TOUCH_END,this.onEndTouch,this);//聊天容器触摸结束事件
		this.btnSprite.touchEnabled = true;
        this.btnSprite.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
	}

	public removeThis():void {
		if(this.showStatus) {
			this.par.removeChild(this);
			this.showStatus = false;

			this.chatContainer.touchEnabled = false;
        	this.chatContainer.removeEventListener(egret.TouchEvent.TOUCH_BEGIN,this.onBeginTouch,this);//聊天容器触摸开始事件
        	this.chatContainer.removeEventListener(egret.TouchEvent.TOUCH_END,this.onEndTouch,this);//聊天容器触摸结束事件
			this.btnSprite.touchEnabled = false;
        	this.btnSprite.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
		}
	}

	//背景触摸开始事件
    private onBeginTouch(event: egret.TouchEvent): void {
        if(!Global.main_btnEnable) return;
        this.chatContainer.addEventListener(egret.TouchEvent.TOUCH_MOVE,this.onMoveTouch,this);//注册触摸滑动事件监听
        this.moveVal = event.stageY - this.chatContainer.y;//记录触摸滑动位移
        this.touchinitY = event.stageY;//记录触摸开始时的Y轴坐标
        //this.move_bool = false;//标记是否滑动过
        //egret.log("触摸开始event.localY="+event.localY);
    }

	//背景触摸滑动事件
    private onMoveTouch(event: egret.TouchEvent): void {
        //this.move_bool = true;//标记是否滑动过
        //egret.log("this.move_bool="+this.move_bool);
        //var tag_moveVal = event.stageY - this.moveVal;//目标Y值
        var tag_moveVal = this.chatContainer.y + (event.stageY - this.touchinitY)*1;//目标Y值

        if(tag_moveVal > this.maxY) {
            tag_moveVal = this.maxY;
        }
        else if(tag_moveVal < this.minY) {
            tag_moveVal = this.minY;
        }
        this.chatContainer.y = tag_moveVal;
        this.touchinitY = event.stageY;//记录触摸开始时的Y轴坐标
    }

	//触摸结束事件
    private onEndTouch(event: egret.TouchEvent): void {
        this.chatContainer.removeEventListener(egret.TouchEvent.TOUCH_MOVE,this.onMoveTouch,this);//移除触摸滑动事件监听
    } 

	//发送聊天按钮点击
	private onTapTouch(event: egret.TouchEvent): void {
		if(this.inputTxt.text == "") return;
		var _magStr_l:string = '{"type":"chat_group","uid":"'+Global.uid+
											'","group":"'+SocketBase.group_name+'","chatcontent":"'+this.inputTxt.text+'","nickName":"'+Global.nickname+'"}';
        SocketBase.sendData(_magStr_l);
		this.inputTxt.text = "";
	}

	//改变聊天记录内容
	public change_chatTxt(_str:string):void {
		this.msg_sound.play(0,1);//消息声音
		this.chatdateTxt.text += _str+"\n";
		this.minY = this.maskHeight - this.chatdateTxt.height - this.input_bg.height;
		if(this.minY > 0) this.minY = 0;
	}



    //无用素材的点击 
    private onTapTouch_bak(event: egret.TouchEvent): void {
        //egret.log("无用点击");
    }






















}