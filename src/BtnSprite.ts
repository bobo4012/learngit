/**
 *
 *按钮类
 */
class BtnSprite extends egret.Sprite{
	private showStatus:Boolean = false;
	
	private bg_bit:egret.Bitmap;//背景图
	private bg_Shape:egret.Shape;//背景矢量
	private bgStr:string = "";
	private title_txt:egret.TextField;
	private titleStr:string;
	private txt_color:number = -1;

	public constructor(_title:string, _bgStr:string, _color:number=-1) {
		super();
		this.titleStr = _title;
		this.bgStr =_bgStr;
		this.txt_color = _color;
		this.createView();//构建显示元素
	}

	//构建显示元素
	private createView(): void {
		//背景图
		if(this.txt_color == -1) {
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
		var ck_w:number = 0;
		var ck_h:number = 0;
		if(this.txt_color == -1) {
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
        this.title_txt.y = ck_h/2 - this.title_txt.height/2;
        this.addChild(this.title_txt);
	}

	

    

    //无用点击 
	private onTapTouch_bak(event: egret.TouchEvent): void {
		//egret.log("");
	}

	
	



}