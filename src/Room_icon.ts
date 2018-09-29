/**
 *
 *房间icon
 */
class Room_icon extends egret.Sprite{
	private par:GameStage;
	private showStatus:Boolean = false;
	
	private bg_bit:egret.Bitmap;//背景图
	private title_txt:egret.TextField;
	private titleStr:string;

	public constructor(_par:GameStage, _title:string) {
		super();
		this.par = _par;
		this.titleStr = _title;
		this.createView();//构建显示元素
	}

	//构建显示元素
	private createView(): void {
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
        this.title_txt.y =this.bg_bit.height/2 - this.title_txt.height/2;
        this.addChild(this.title_txt);
	}

	public showThis():void {
        if(this.showStatus) return;
		this.par.addChild(this);
		this.showStatus = true;
	}

	public removeThis():void {
		if(this.showStatus) {
			this.par.removeChild(this);
			this.showStatus = false;
		}
	}

    

    //无用点击 
	private onTapTouch_bak(event: egret.TouchEvent): void {
		//egret.log("");
	}

	
	



}