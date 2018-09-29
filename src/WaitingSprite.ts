/**
 *
 *等待通信中
 */
class WaitingSprite extends egret.Sprite{
	private par:GameStage;
	private showStatus:Boolean = false;
	
	private pbShape:egret.Shape;//屏蔽层
	private bg_bmp:egret.Bitmap;//背景图
	private title_txt:egret.TextField;
	private frameBool:boolean = false;//标记是否在帧频响应状态
	private rotNum:number = 0;//旋转角度
	private pointNum:number = 0;//“点”的数量

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
		this.pbShape.alpha = 0.2;
        this.addChild(this.pbShape);

		//背景图
		this.bg_bmp = Global.createBitmapByName("waiting_png_png");
		this.bg_bmp.anchorOffsetX = this.bg_bmp.width/2;
		this.bg_bmp.anchorOffsetY = this.bg_bmp.height/2;
        this.bg_bmp.x = Global.stageW/2;
        this.bg_bmp.y = Global.stageH/2 - 50;
        this.addChild(this.bg_bmp);

		//说明文本
		this.title_txt = new egret.TextField();
		this.title_txt.fontFamily = "SimHei";
        this.title_txt.textColor = 0xffffff;
        this.title_txt.bold = true;
        this.title_txt.textAlign = "left";
        this.title_txt.size = 38;
        //this.title_txt.width = this.bg_bmp.width-80;
        //this.title_txt.height = 60;
        this.title_txt.text = "";
		this.title_txt.x = this.bg_bmp.x - 60;
        this.title_txt.y = this.bg_bmp.y + 110;
        this.addChild(this.title_txt);
	}

	public showThis():void {
        if(this.showStatus) return;
		this.par.addChild(this);
		this.showStatus = true;
		this.addBtnTouchEvent();//添加按钮触摸侦听
	}

	public removeThis():void {
		if(this.showStatus) {
			this.par.removeChild(this);
			this.showStatus = false;
			this.removeBtnTouchEvent();//移除按钮触摸侦听
		}
	}

	//添加按钮触摸侦听
	private addBtnTouchEvent():void {
		this.pbShape.touchEnabled = true;
		this.pbShape.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch_bak,this);
		//帧事件
		this.addEventListener(egret.Event.ENTER_FRAME,this.onEnterFrame,this);
		this.frameBool = true;//标记是否在帧频响应状态
    }

    //移除按钮触摸侦听
    private removeBtnTouchEvent():void {
		this.pbShape.touchEnabled = false;
		this.pbShape.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch_bak,this);

		if(this.frameBool) {
			this.removeEventListener(egret.Event.ENTER_FRAME,this.onEnterFrame,this);
			this.frameBool = false;
		}
		this.rotNum = 0;//旋转角度
		this.bg_bmp.rotation = 0;
		this.pointNum = 0;//“点”的数量
    }

	//帧响应
	private  onEnterFrame(e:egret.Event){
		if(this.rotNum == 180) this.rotNum *= -1;
		this.rotNum += 2;
		this.bg_bmp.rotation = this.rotNum;

		var _num:number = Math.abs(this.rotNum);
		if(_num % 10 == 0) {
			this.pointNum++;
			if(this.pointNum > 6) {
				this.pointNum = 0;
			}
		}
		var _str:string = "";
		for(var i=0; i<this.pointNum; i++) {
			_str += ".";
		}
		this.title_txt.text = _str;
	}

    //按钮点击 
    //private onTapTouch(event: egret.TouchEvent): void {
        //switch(event.target) {
        //}
    //}

    //无用点击 
	private onTapTouch_bak(event: egret.TouchEvent): void {
		//egret.log("");
	}

	
	



}