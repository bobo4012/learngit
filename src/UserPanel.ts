/**
 *
 *用户信息面板
 */
class UserPanel extends egret.Sprite{
	private par:GameStage;
	private showStatus:Boolean = false;
    private sendBool:Boolean = false;//标记是否在发送阶段

    private nullimg_bmp_l:egret.Bitmap;//左侧空头像
    private nullimg_bool_l:boolean = false;//左侧空头像是否在显示状态
    private nullimg_bmp_r:egret.Bitmap;//右侧空头像
    private nullimg_bool_r:boolean = false;//右侧空头像是否在显示状态
    private headImgSprite_l:egret.Sprite;//左侧头像的容器
    private headImgSprite_r:egret.Sprite;//右侧头像的容器
	private maskShape_l: egret.Shape;//左侧头像的遮罩
    private maskShape_r: egret.Shape;//右侧头像的遮罩
    private textArr:any[];//文本数组
    private headArr:any[];//头像显示管理数组
    //private headContainerArr:any[];//头像容器管理数组
    private ownHeadimg:egret.Bitmap;//自己的头像引用
    private head_img_l:egret.Bitmap;//左侧的头像
    private head_img_r:egret.Bitmap;//右侧的头像
    private b_bmp:egret.Bitmap;//黑棋
    private b_bool:boolean = false;//黑棋图标是否在显示状态
    private w_bmp:egret.Bitmap;//白棋
    private w_bool:boolean = false;//白棋图标是否在显示状态
    private timeTxt_l:egret.TextField;//时间显示文本-左
    private timeNum_l:number = 0;//行棋累计时间-左
    private timeTxt_r:egret.TextField;//时间显示文本-右
    private timeNum_r:number = 0;//行棋累计时间-右

	public constructor(_main:GameStage) {
		super();
		this.par = _main;
		this.createView();//构建显示元素
	}

	//构建显示元素
	private createView(): void {
        Global.userPanel = this;
        
        //黑棋
        this.b_bmp = Global.createBitmapByName("hei_png");

        //白棋
        this.w_bmp = Global.createBitmapByName("bai_png");

        //左侧头像容器
        this.headImgSprite_l = new egret.Sprite();
        this.headImgSprite_l.x = 20;
        this.headImgSprite_l.y = 16;
        this.addChild(this.headImgSprite_l);

        //左侧头像的遮罩
        this.maskShape_l = new egret.Shape();
        this.maskShape_l.graphics.beginFill(0x000000);
        this.maskShape_l.graphics.drawCircle(0,0,40);
        this.maskShape_l.graphics.endFill();
        this.maskShape_l.x = this.headImgSprite_l.x + 40;
        this.maskShape_l.y = this.headImgSprite_l.y + 40;
        this.addChild(this.maskShape_l);
        this.headImgSprite_l.mask = this.maskShape_l;

        //右侧头像的容器
        this.headImgSprite_r = new egret.Sprite();
        this.headImgSprite_r.x = Global.stageW - 100;
        this.headImgSprite_r.y = this.headImgSprite_l.y;
        this.addChild(this.headImgSprite_r);

        //左侧空头像
		this.nullimg_bmp_l = Global.createBitmapByName("nullheadimg_png");

        //右侧空头像
		this.nullimg_bmp_r = Global.createBitmapByName("nullheadimg_png");

        //右侧头像的遮罩
        this.maskShape_r = new egret.Shape();
        this.maskShape_r.graphics.beginFill(0x000000);
        this.maskShape_r.graphics.drawCircle(0,0,40);
        this.maskShape_r.graphics.endFill();
        this.maskShape_r.x = this.headImgSprite_r.x + 40;
        this.maskShape_r.y = this.headImgSprite_r.y + 40;
        this.addChild(this.maskShape_r);
        this.headImgSprite_r.mask = this.maskShape_r;

        //文本
        var _arr:any[] = new Array(["昵称:", this.headImgSprite_l.x, this.headImgSprite_l.y+85], ["", 700, this.headImgSprite_l.y+85]);
        this.textArr = new Array();
        for(var i=0; i<_arr.length; i++) {
            var _text:egret.TextField = new egret.TextField();
            _text.fontFamily = "SimHei";
            _text.textColor = 0x333333;
            _text.textAlign = "left";
            //_text.bold = true;
            _text.size = 32;
            //_text.width = 436;
            //_text.height = 50;
            _text.x = _arr[i][1];
            _text.y = _arr[i][2];
            _text.text = _arr[i][0];
            this.addChild(_text);
            this.textArr.push(_text);
            _text.touchEnabled = true;
            _text.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch_bak,this);
        }

        //时间显示文本-左
        this.timeTxt_l = new egret.TextField();
        this.timeTxt_l.fontFamily = "SimHei";
        this.timeTxt_l.textColor = 0x333333;
        this.timeTxt_l.textAlign = "left";
        this.timeTxt_l.size = 32;
        this.timeTxt_l.x = this.headImgSprite_l.x + 90;
        this.timeTxt_l.y = this.headImgSprite_l.y + 10;
        //this.addChild(this.timeTxt_l);
        
        //昵称的遮罩
        var nick_mask :egret.Shape= new egret.Shape();
        nick_mask.graphics.beginFill(0x000000);
        nick_mask.graphics.drawRect(0, 0, 245, 50);//
        nick_mask.graphics.endFill();
        nick_mask.x = this.textArr[0].x;
        nick_mask.y = this.textArr[0].y;
        this.addChild(nick_mask);
        this.textArr[0].mask = nick_mask;

        //头像容器管理数组
        //this.headContainerArr = new Array(this.headImgSprite_l, this.headImgSprite_l, this.headImgSprite_r);

        //头像显示管理数组
        this.ownHeadimg = new egret.Bitmap();
        this.headArr = new Array([this.ownHeadimg, false], [this.head_img_l, false], [this.head_img_r, false]);

        //用户微信头像
        if(Global.headImgurl != "") {
			this.loadUsardImg();
		}
        this.textArr[0].text = Global.nickname;
	}

	public showThis():void {
		this.par.addChild(this);
		this.showStatus = true;
        //this.textArr[0].text = "昵称:"+Global.nickname;
	}

	public removeThis():void {
		if(this.showStatus) {
			this.par.removeChild(this);
			this.showStatus = false;
		}
	}

	//更改自己的角色,还原初始状态
    public change_role():void {
        this.clear_content();//清除已显示的玩家信息
        this.headImgSprite_l.addChild(this.headArr[0][0]);//添加头像
        this.headArr[0][1] = this.headImgSprite_l;//标记自己的头像在显示状态
        this.textArr[0].text = Global.nickname;
    }

    //修改用户信息，准备开始棋局
    public change_info():void {
        this.clear_content();//清除已显示的玩家信息
        
        //左侧
        if(Global.uid_l == Global.uid) {//如果左侧是自己
            this.textArr[0].text = Global.nickname;
            this.headImgSprite_l.addChild(this.headArr[0][0]);//添加头像
            this.headArr[0][1] = this.headImgSprite_l;//标记自己的头像在显示状态

        }
        else {
            this.textArr[0].text = Global.nickName_l;
            this.headImgSprite_l.addChild(this.nullimg_bmp_l);//显示空头像
            this.nullimg_bool_l = true;//左侧空头像是否在显示状态

            if(Global.uid_l != "") {
                //发送获取该uid的信息
                var _magStr_l:string = '{"type":"getuidInfoByGroup","uid":"'+Global.uid_l+
											'","group":"'+SocketBase.group_name+'"}';
                SocketBase.sendData(_magStr_l);
            }
        }
        //显示黑白棋子
        //egret.log("左侧Global.role_l="+Global.role_l);
        if(Global.role_l == "B") {//黑棋
            this.b_bmp.x = this.headImgSprite_l.x + 90;
            this.b_bmp.y = this.headImgSprite_l.y + 30;
            this.addChild(this.b_bmp);
            this.b_bool = true;
        }
        else if(Global.role_l == "W"){//白棋
            this.w_bmp.x = this.headImgSprite_l.x + 90;
            this.w_bmp.y = this.headImgSprite_l.y + 30;
            this.addChild(this.w_bmp);
            this.w_bool = true;
        }
        
        //右侧
        if(Global.uid_r == Global.uid) {//如果右侧是自己
            this.textArr[1].text = Global.nickname;
            this.headImgSprite_r.addChild(this.headArr[0][0]);//添加头像
            this.headArr[0][1] = this.headImgSprite_r;//标记自己的头像在显示状态
        }
        else {
            this.textArr[1].text = Global.nickName_r;
            this.headImgSprite_r.addChild(this.nullimg_bmp_r);//显示空头像
            this.nullimg_bool_r = true;//右侧空头像是否在显示状态

            if(Global.uid_r != "") {
                //发送获取该uid的信息
                var _magStr_r:string = '{"type":"getuidInfoByGroup","uid":"'+Global.uid_r+
											'","group":"'+SocketBase.group_name+'"}';
                SocketBase.sendData(_magStr_r);
            }
        }
        //显示黑白棋子
        if(Global.role_r == "B") {//黑棋
            this.b_bmp.x = this.headImgSprite_r.x - this.b_bmp.width - 10;
            this.b_bmp.y = this.headImgSprite_r.y + 30;
            this.addChild(this.b_bmp);
            this.b_bool = true;
        }
        else if(Global.role_r == "W"){//白棋
            this.w_bmp.x = this.headImgSprite_r.x - this.w_bmp.width - 10;
            this.w_bmp.y = this.headImgSprite_r.y + 30;
            this.addChild(this.w_bmp);
            this.w_bool = true;
        }
        this.textArr[1].x = Global.stageW - this.textArr[1].width - 20;
    }

    //修改右侧参与者信息
    public change_uesr_r(_action:string):void {
        if(this.nullimg_bool_r) {//如果有空头像，则移除
            this.headImgSprite_r.removeChild(this.nullimg_bmp_r);
            this.nullimg_bool_r = false;//右侧空头像是否在显示状态
        }

        if(_action == "joinGame_own") {//自己应战
            this.headImgSprite_r.addChild(this.headArr[0][0]);//添加头像
            this.headArr[0][1] = this.headImgSprite_r;//标记自己的头像在显示状态
            this.textArr[1].text = Global.nickname;
            this.textArr[1].x = Global.stageW - this.textArr[1].width - 20;
        }
        else if(_action == "joinGame_other"){//其他人应战
            this.textArr[1].text = Global.nickName_r;
            this.textArr[1].x = Global.stageW - this.textArr[1].width - 20;

            //显示头像-右侧
            this.loadUsardImg_r(SocketBase.group_all[2][3]);
        }
        //显示黑白棋子
        if(Global.role_r == "B") {//黑棋
            this.b_bmp.x = this.headImgSprite_r.x - this.b_bmp.width - 10;
            this.b_bmp.y = this.headImgSprite_r.y + 30;
            this.addChild(this.b_bmp);
            this.b_bool = true;
        }
        else if(Global.role_r == "W"){//白棋
            this.w_bmp.x = this.headImgSprite_r.x - this.w_bmp.width - 10;
            this.w_bmp.y = this.headImgSprite_r.y + 30;
            this.addChild(this.w_bmp);
            this.w_bool = true;
        }
    }

    //load图片
    private loadUsardImg():void {
        var imageLoader: egret.ImageLoader = new egret.ImageLoader();
        imageLoader.addEventListener(egret.Event.COMPLETE,this.loadCompleteHandler,this);//
        imageLoader.addEventListener(egret.IOErrorEvent.IO_ERROR,this.onimageLoadError,this); //添加加载失败侦听
        imageLoader.load(Global.headImgurl);
    }

    //加载头像成功
    private loadCompleteHandler(event: egret.Event): void {
        //终止问题，防止正在加载的图片在移除本面板时处理错误
        var imageLoader = <egret.ImageLoader>event.currentTarget;
         
        //this.headArr[0][0] = new egret.Bitmap(imageLoader.data);
        let texture = new egret.Texture();
        texture._setBitmapData(imageLoader.data);
        this.headArr[0][0] = new egret.Bitmap(texture);
        this.headArr[0][0].width = 80;
        this.headArr[0][0].height = 80;
        this.headImgSprite_l.addChild(this.headArr[0][0]);//添加头像
        this.headArr[0][1] = this.headImgSprite_l;//标记自己的头像在显示状态
    }
    private onimageLoadError(): void {
        //console.log("onLoadError");
    }

    //load左侧玩家图片
    public loadUsardImg_l(_url_l:string):void {
        var imageLoader: egret.ImageLoader = new egret.ImageLoader();
        imageLoader.addEventListener(egret.Event.COMPLETE,this.loadCompleteHandler_l,this);//
        imageLoader.addEventListener(egret.IOErrorEvent.IO_ERROR,this.onimageLoadError_l,this); //添加加载失败侦听
        imageLoader.load(_url_l);
    }

    //加载左侧头像成功
    private loadCompleteHandler_l(event: egret.Event): void {
        //终止问题，防止正在加载的图片在移除本面板时处理错误
        var imageLoader = <egret.ImageLoader>event.currentTarget;
         
        //this.headArr[1][0] = new egret.Bitmap(imageLoader.data);
        let texture = new egret.Texture();
        texture._setBitmapData(imageLoader.data);
        this.headArr[1][0] = new egret.Bitmap(texture);
        this.headArr[1][0].width = 80;
        this.headArr[1][0].height = 80;
        this.headImgSprite_l.addChild(this.headArr[1][0]);//添加头像
        this.headArr[1][1] = this.headImgSprite_l;//标记自己的头像在显示状态
    }
    private onimageLoadError_l(): void {
        //console.log("onLoadError");
    }	

    //load右侧玩家图片
    public loadUsardImg_r(_url_r:string):void {
        var imageLoader: egret.ImageLoader = new egret.ImageLoader();
        imageLoader.addEventListener(egret.Event.COMPLETE,this.loadCompleteHandler_r,this);//
        imageLoader.addEventListener(egret.IOErrorEvent.IO_ERROR,this.onimageLoadError_r,this); //添加加载失败侦听
        imageLoader.load(_url_r);
    }

    //加载右侧头像成功
    private loadCompleteHandler_r(event: egret.Event): void {
        //终止问题，防止正在加载的图片在移除本面板时处理错误
        var imageLoader = <egret.ImageLoader>event.currentTarget;
         
        //this.headArr[2][0] = new egret.Bitmap(imageLoader.data);
        let texture = new egret.Texture();
        texture._setBitmapData(imageLoader.data);
        this.headArr[2][0] = new egret.Bitmap(texture);

        this.headArr[2][0].width = 80;
        this.headArr[2][0].height = 80;
        this.headImgSprite_r.addChild(this.headArr[2][0]);//添加头像
        this.headArr[2][1] = this.headImgSprite_r;//标记自己的头像在显示状态
    }
    private onimageLoadError_r(): void {
        //console.log("onLoadError");
    }

    //清除已显示的玩家信息
    private clear_content():void {
        //移除黑白棋图标
        if(this.b_bool) {
            this.removeChild(this.b_bmp);
            this.b_bool = false;
        }
        if(this.w_bool) {
            this.removeChild(this.w_bmp);
            this.w_bool = false;
        }

        //移除头像及昵称--未开始棋局时加载的自己头像
        for(var i=0; i<this.headArr.length; i++) {
            if(this.headArr[i][1]) {
                this.headArr[i][1].removeChild(this.headArr[i][0]);
                this.headArr[i][1] = false;
            }
        }
        this.textArr[0].text = "";
        this.textArr[1].text = "";

        //移除空头像，如果在显示状态的话
        if(this.nullimg_bool_l) {
            this.headImgSprite_l.removeChild(this.nullimg_bmp_l);
            this.nullimg_bool_l = false;//左侧空头像是否在显示状态
        }
        if(this.nullimg_bool_r) {
            this.headImgSprite_r.removeChild(this.nullimg_bmp_r);
            this.nullimg_bool_r = false;//右侧空头像是否在显示状态
        }
    }

    //初始化时间
    public init_time(_time_l:number, _time_r:number):void {
        this.timeNum_l = _time_l;//行棋累计时间-左
        //this.timeTxt_l.text = "00:00:00";
        this.timeNum_r = _time_r;//行棋累计时间-右
        //this.timeTxt_r.text = "00:00:00";
    }

    //根据当前累计时间显示
    public change_timetxt(_LorR:string, _time:number):string {
        //小时
        var _hourNum:number = Math.floor(_time/3600);
        var _hourStr:string;
        if(_hourNum < 10) {
            _hourStr = "0" + String(_hourNum);
        }
        else {
            _hourStr = String(_hourNum);
        }

        //分钟
        var _minuteNum:number = Math.floor(_time%3600/60);
        var _minuteStr:string;
        if(_minuteNum < 10) {
            _minuteStr = "0" + String(_minuteNum);
        }
        else {
            _minuteStr = String(_minuteNum);
        }

        //秒
        var _secondNum:number = Math.floor(_time%3600%60);
        var _secondStr:string;
        if(_secondNum < 10) {
            _secondStr = "0" + String(_secondNum);
        }
        else {
            _secondStr = String(_secondNum);
        }

        return _hourStr+":"+_minuteStr+":"+_secondStr;
    }







    //无用素材的点击 
    private onTapTouch_bak(event: egret.TouchEvent): void {
        //egret.log("无用点击");
    }






















}