/**
 *
 *游戏场景
 *
 */
class GameStage extends egret.Sprite {
    private showStatus: Boolean = false; //是否在显示状态
    private main: Main;
    private sendBool:Boolean = false;//标记是否在发送阶段

    private userPanel:UserPanel;//用户信息面板
	private play_go:Play_go;//行棋类
    private new_room_icon:Room_icon;//新建棋局按钮
    private homepage:egret.Bitmap;//返回首页按钮
    private homeBool:boolean = false;//返回首页按钮是否在显示状态
    private room_iconArr:any[];//棋局按钮管理数组
    private stagePop:StagePop;//选择弹窗
    private waitingSprite:WaitingSprite;//等待通信中
    private chatSprite:ChatSprite;//聊天面板

    public mapSprite:egret.Sprite;//地图容器
    private minY:number;//地图位移的上限
    private maxY:number = 150;//地图位移的下限
    private moveVal:number = 0;//记录触摸滑动位移
    private touchinitY:number;//触摸按下时的Y轴坐标
    public move_bool:boolean = false;//标记是否滑动过
    
    public constructor(_main: Main) {
        super();
        this.main = _main;
        this.createView();//构建显示元素
    }
    
    //构建显示元素
    private createView(): void {
        Global.gameStage = this;
        //背景地图
        this.mapSprite = new egret.Sprite();//地图容器
        //Global.mapContainerArr = new Array();//大地图数组
        //for(var i=0; i<Global.mapArr.length; i++) {
            //var _mapStr:string = Global.mapArr[i];
            //var mapContainer:MapContainer = new MapContainer(this, _mapStr, i);
            //Global.mapContainerArr.push(mapContainer);
        //}

        this.userPanel = new UserPanel(this);//用户信息面板

        //行棋类
		this.play_go = new Play_go(this);
        this.play_go.y = this.userPanel.y + this.userPanel.height + 10;

        //聊天面板
        this.chatSprite = new ChatSprite(this);

        //新建棋局按钮
        this.new_room_icon = new Room_icon(this, "新 建 棋 局");     
        this.new_room_icon.x = Global.stageW/2 - this.new_room_icon.width/2;//居中显示
        this.new_room_icon.y = this.userPanel.y + this.userPanel.height + 60;

        //返回首页按钮
        this.homepage = Global.createBitmapByName("homepage_png");
        this.homepage.x = Global.stageW/2 - this.homepage.width/2;
        this.homepage.y = 0;
        this.homeBool = false;//返回首页按钮是否在显示状态

        //选择弹窗
        this.stagePop = new StagePop(this);

        //等待通信中
        this.waitingSprite = new WaitingSprite(this);
    }
	
    //显示处理
    public addFun(): void {
        this.main.addChild(this);
        this.showStatus = true; //是否在显示状态
        
        this.userPanel.showThis();//显示用户信息面板
        if(Global.gogame_name == 'gogameid') {//如果没有gogameid的参数值,则显示新建按钮
            this.new_room_icon.showThis();//显示新建按钮
        }
        else {//如果有gogameid的参数值，则直接进入棋局
            SocketBase.sendjoinGroup(Global.gogame_name);//加入已有的组
        }
        this.addBtnTouchEvent();//添加按钮触摸侦听
    }

	//显示棋局
	public show_game():void {
        Global.main_btnEnable = true;
        this.new_room_icon.removeThis();//移除新建按钮
        Global.userPanel.change_info();//修改用户信息，准备开始棋局
        this.play_go.showThis();//显示棋局
        this.addhomepage_btn();//显示返回首页按钮
        this.chatSprite.showThis();//显示聊天面板
        if(Global.own_role == "") {//如果尚未有人应战，则显示选择界面“应战或旁观”
            this.stagePop.showThis("尚未有人应战，请点击按钮选择");
        }
        else {
            window["sendMessage"](SocketBase.group_name);//传递棋局参数至网页容器，作为分享参数使用
        }
    }

    //移除等待通信画面并退出棋局
    public remove_waitingSprite(_action:string):void {
        this.waitingSprite.removeThis();//移除等待弹窗
        
        switch(_action) {
            case "leaveGroup"://在选择界面，自己退出棋局
                this.removehomepage_btn();//移除返回首页按钮
                this.stagePop.removeThis();//移除选择弹窗
                this.play_go.removeThis();//移除棋局
                Global.userPanel.change_role();//更改自己的角色,还原初始状态
                this.new_room_icon.showThis();//显示新建按钮
                break;
            case "joinGame_own"://在选择界面，自己应战
                this.stagePop.removeThis();//移除选择弹窗
                window["sendMessage"](SocketBase.group_name);//传递棋局参数至网页容器，作为分享参数使用
                //更新参与棋局的用户信息内容
                Global.userPanel.change_uesr_r(_action);
                break;
            case "joinGame_other"://在选择界面，其他人应战
                if(this.stagePop.showStatus) {
                     this.stagePop.removeThis();//移除选择弹窗
                     window["sendMessage"](SocketBase.group_name);//传递棋局参数至网页容器，作为分享参数使用
                }
                //更新参与棋局的用户信息内容
                Global.userPanel.change_uesr_r(_action);
                break;
            case "joinViewer_own"://在选择界面，自己加入棋局--观众
                this.stagePop.removeThis();//移除选择弹窗
                window["sendMessage"](SocketBase.group_name);//传递棋局参数至网页容器，作为分享参数使用
                break;
        }
    }

    //移除处理
    public removeFun(): void {
        this.showStatus = false; //是否在显示状态
        this.removeBtnTouchEvent();//移除按钮触摸侦听
    }

    //添加按钮触摸侦听
	private addBtnTouchEvent():void {
        this.new_room_icon.touchEnabled = true;
        this.new_room_icon.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
        //for(var i=0; i<this.btnArr.length; i++) {
            //this.btnArr[i].touchEnabled = true;
            //this.btnArr[i].addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
        //}
    }

    //移除按钮触摸侦听
    private removeBtnTouchEvent():void {
        this.new_room_icon.touchEnabled = false;
        this.new_room_icon.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
        //for(var i=0; i<this.btnArr.length; i++) {
            //this.btnArr[i].touchEnabled = false;
            //this.btnArr[i].removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch,this);
        //}
    }

    //按钮点击 
    private onTapTouch(event: egret.TouchEvent): void {
		if(!Global.main_btnEnable) return;
        Global.main_btnEnable = false;
        //egret.log(event.target);
        switch(event.target) {
            case this.new_room_icon://开始新棋局按钮
                SocketBase.sendjoinGroup();//建立新组
                break;
        }
    }

    //背景触摸开始事件
    private onBeginTouch(event: egret.TouchEvent): void {
        if(!Global.main_btnEnable) return;
        this.mapSprite.addEventListener(egret.TouchEvent.TOUCH_MOVE,this.onMoveTouch,this);//注册触摸滑动事件监听
        this.moveVal = event.stageY - this.mapSprite.y;//记录触摸滑动位移
        this.touchinitY = event.stageY;//记录触摸开始时的Y轴坐标
        this.move_bool = false;//标记是否滑动过
        //egret.log("触摸开始event.localY="+event.localY);
    }

    //背景触摸滑动事件
    private onMoveTouch(event: egret.TouchEvent): void {
        this.move_bool = true;//标记是否滑动过
        //egret.log("this.move_bool="+this.move_bool);
        //var tag_moveVal = event.stageY - this.moveVal;//目标Y值
        var tag_moveVal = this.mapSprite.y + (event.stageY - this.touchinitY)*2;//目标Y值

        if(tag_moveVal > this.maxY) {
            tag_moveVal = this.maxY;
        }
        else if(tag_moveVal < this.minY) {
            tag_moveVal = this.minY;
        }
        this.mapSprite.y = tag_moveVal;
        this.touchinitY = event.stageY;//记录触摸开始时的Y轴坐标
    }
    
    //触摸结束事件
    private onEndTouch(event: egret.TouchEvent): void {
        this.mapSprite.removeEventListener(egret.TouchEvent.TOUCH_MOVE,this.onMoveTouch,this);//移除触摸滑动事件监听
    } 

    //显示等待通信的画面
    public show_waitingSprite():void {
        this.waitingSprite.showThis();//等待通信中
    }

    //显示返回首页按钮
    private addhomepage_btn():void {
        this.addChild(this.homepage);
        this.homeBool = true;

        this.homepage.touchEnabled = true;
        this.homepage.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch_home,this);
    }

    //移除返回首页按钮
    private removehomepage_btn():void {
        if(this.homeBool) {
            this.removeChild(this.homepage);
            this.homeBool = false;

            this.homepage.touchEnabled = false;
            this.homepage.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.onTapTouch_home,this);
        }
    }

     //返回首页按钮点击 
    private onTapTouch_home(event: egret.TouchEvent): void {
		if(this.sendBool) return;
        this.sendBool = true;//标记是否在消息发送中
		//发送退出组的消息
	    var _magStr_l:string = '{"type":"leaveGroup","uid":"'+Global.uid+
											'","group":"'+SocketBase.group_name+'"}';
        SocketBase.sendData(_magStr_l);
		this.show_waitingSprite();//显示等待通信画面
    }

    //无用点击 
	private onTapTouch_bak(event: egret.TouchEvent): void {
		//egret.log("");
	}

}
