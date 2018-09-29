/**
 *
 *弹窗类
 */
class StagePop extends egret.Sprite{
	private par:GameStage;
	public showStatus:Boolean = false;
	private sendBool:boolean = false;//标记是否在消息发送中
	
	private pbShape:egret.Shape;//屏蔽层
	private bg_bmp:egret.Bitmap;//背景图
	private exit_btn:egret.Bitmap;//退出按钮
	private join_btn:BtnSprite;//加入按钮
    private bystande_btn:BtnSprite;//旁观者按钮
	private title_txt:egret.TextField;
	private titleStr:string;

	public constructor(_par:GameStage) {
		super();
		this.par = _par;
		this.createView();//构建显示元素
	}

	//构建显示元素
	private createView(): void {
		//屏蔽层
        this.pbShape = new egret.Shape();
        this.pbShape.graphics.beginFill(0x000000);
        this.pbShape.graphics.drawRect(0,0,Global.stageW,Global.stageH);
        this.pbShape.graphics.endFill();
		this.pbShape.alpha = 0.6;
        this.addChild(this.pbShape);

		//背景图
		this.bg_bmp = Global.createBitmapByName("stagePop_bg_png");
        this.bg_bmp.x = Global.stageW/2 - this.bg_bmp.width/2;
        this.bg_bmp.y = 320;
        this.addChild(this.bg_bmp);

		//说明文本
		this.title_txt = new egret.TextField();
		this.title_txt.fontFamily = "SimHei";
        this.title_txt.textColor = 0xffffff;
        //this.title_txt.bold = true;
        this.title_txt.textAlign = "center";
        this.title_txt.size = 38;
        this.title_txt.width = this.bg_bmp.width-80;
        //this.title_txt.height = 60;
        //this.title_txt.text = this.titleStr;
		this.title_txt.x = this.bg_bmp.x + 40;
        this.title_txt.y = this.bg_bmp.y + 70;
        this.addChild(this.title_txt);

		//退出按钮
		this.exit_btn = Global.createBitmapByName("signin_x_btn_png");
		this.exit_btn.x = this.bg_bmp.x + this.bg_bmp.width - this.exit_btn.width;
		this.exit_btn.y = this.bg_bmp.y - 30;
		this.addChild(this.exit_btn);

		//加入按钮
        this.join_btn = new BtnSprite("应战", "g_btn_png");
        this.join_btn.x = this.bg_bmp.x + 60;
        this.join_btn.y = this.bg_bmp.y + 230;
		this.addChild(this.join_btn);

        //旁观者按钮
        this.bystande_btn = new BtnSprite("旁观", "y_btn_png");
        this.bystande_btn.x =  this.bg_bmp.x + this.bg_bmp.width - this.bystande_btn.width - 60;
        this.bystande_btn.y = this.join_btn.y;
		this.addChild(this.bystande_btn);
	}

	public showThis(_str:string):void {
        if(this.showStatus) return;
		this.par.addChild(this);
		this.showStatus = true;
		this.title_txt.text = _str;
		this.addBtnTouchEvent();//添加按钮触摸侦听
	}

	public removeThis():void {
		if(this.showStatus) {
			this.par.removeChild(this);
			this.showStatus = false;
			this.removeBtnTouchEvent();//移除按钮触摸侦听
			this.sendBool = false;//标记是否在消息发送中
		}
	}

	//添加按钮触摸侦听
	private addBtnTouchEvent():void {
		this.pbShape.touchEnabled = true;
		this.pbShape.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch_bak,this);
		this.exit_btn.touchEnabled = true;
		this.exit_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
		this.join_btn.touchEnabled = true;
		this.join_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
		this.bystande_btn.touchEnabled = true;
		this.bystande_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
    }

    //移除按钮触摸侦听
    private removeBtnTouchEvent():void {
		this.pbShape.touchEnabled = false;
		this.pbShape.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch_bak,this);
		this.exit_btn.touchEnabled = false;
		this.exit_btn.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
		this.join_btn.touchEnabled = false;
		this.join_btn.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
		this.bystande_btn.touchEnabled = false;
		this.bystande_btn.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
    }

    //按钮点击 
    private onTapTouch(event: egret.TouchEvent): void {
		if(this.sendBool) return;
        switch(event.target) {
            case this.exit_btn://退出按钮，退出棋局-即退出组
				this.sendBool = true;//标记是否在消息发送中
				//发送退出组的消息
				var _magStr_l:string = '{"type":"leaveGroup","uid":"'+Global.uid+
											'","group":"'+SocketBase.group_name+'"}';
            	SocketBase.sendData(_magStr_l);
				Global.gameStage.show_waitingSprite();//显示等待通信画面
                break;
			case this.join_btn://加入按钮
                this.sendBool = true;//标记是否在消息发送中
				//发送加入棋局的消息
				var _magStr_l:string = '{"type":"joinGame","uid":"'+Global.uid+
											'","group":"'+SocketBase.group_name+'","nickName":"'+Global.nickname+'","headImgurl":"'+Global.headImgurl+'"}';
            	SocketBase.sendData(_magStr_l);
				Global.gameStage.show_waitingSprite();//显示等待通信画面
                break;
			case this.bystande_btn://旁观者按钮
                this.sendBool = true;//标记是否在消息发送中
				//发送旁观棋局的消息
				var _magStr_l:string = '{"type":"viewer","uid":"'+Global.uid+
											'","group":"'+SocketBase.group_name+'","nickName":"'+Global.nickname+'"}';
            	SocketBase.sendData(_magStr_l);
				Global.gameStage.show_waitingSprite();//显示等待通信画面
                break;
        }
    }

    //无用点击 
	private onTapTouch_bak(event: egret.TouchEvent): void {
		//egret.log("");
	}

	
	



}