class SocketBase {
	static socket:egret.WebSocket;
	static client_id:string = "";//socketID
	static group_name:string = "";//组的名称
	static group_all:any[];//当前组（棋局）成员的信息管理数组

	public constructor() {
	}

	//初始化socket
	static initSocket():void {
		this.socket = new egret.WebSocket();
		//this.socket.type = egret.WebSocket.TYPE_BINARY;//设置数据格式为二进制，默认为字符串
        this.socket.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onReceiveMessage, this);//添加收到数据侦听，收到数据会调用此方法
        this.socket.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);//添加链接打开侦听，连接成功会调用此方法
        this.socket.addEventListener(egret.Event.CLOSE, this.onSocketClose, this);//添加链接关闭侦听，手动关闭或者服务器关闭连接会调用此方法
        this.socket.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onSocketError, this);//添加异常侦听，出现异常会调用此方法
        this.socket.connect("115.29.35.209", 2345);//连接服务器192.168.1.8
	}

	//连接成功会调用此方法
	static onSocketOpen():void {
		//egret.log("WebSocketOpen");
    }

	//发送数据
	static sendData(_msgStr:string):void {
        this.socket.writeUTF(_msgStr); //写入字符串信息
		egret.log("发送数据:"+_msgStr);
    }

	//手动关闭或者服务器关闭连接会调用此方法
	static onSocketClose():void {
        egret.log("WebSocketClose");
		this.client_id = "";
		alert("服务器连接关闭，请尝试重新登录或联系客服");
    }

	//出现异常会调用此方法
    static onSocketError():void {
        egret.log("WebSocketError");
		this.client_id = "";
		alert("服务器连接断开，请尝试重新登录或联系客服");
    }

	//收到数据会调用此方法
	static onReceiveMessage(e:egret.Event):void {
        //读取数据
		var msgStr:string = this.socket.readUTF();
		var obj = JSON.parse(msgStr);
		if(obj["type"]) {
			switch(obj["type"]) {
				case "login"://登录
					this.client_id = obj["content"];//记录本次通讯的client_id
					var _magStr:string = '{"type":"bind","uid":"'+Global.uid+
											'","nickname":"'+Global.nickname+
											'","headImgurl":"'+Global.headImgurl+'"}';
					this.sendData(_magStr);//发送绑定uid
					break;
				case "binded"://收到绑定成功
					Global.main.add_gameStage();//显示主场景
					break;
				case "group"://组消息
					if(obj["action"] == "build") {//新建组
						this.receivebuildGroup(obj);//收到新建组的消息处理
					}
					else if(obj["action"] == "joinGetInfo") {//加入并读取组信息
						this.receiveJoinGetInfo(obj);//收到加入并读取组信息的消息处理
					}
					else if(obj["action"] == "join") {//其他成员加入
						this.receive_joinGroup(obj);//收到加入组的消息处理
					}
					else if(obj["action"] == "leaveGroup") {//从组中删除某client
						this.receiveLeaveGroup(obj);
					}
					else if(obj["action"] == "joinGame") {//加入棋局--有人应战
						this.receive_joinGame(obj);
					}
					else if(obj["action"] == "joinViewer") {//加入棋局--观众
						this.receive_joinViewer(obj);
					}
					else if(obj["action"] == "getuidInfoByGroup") {//获取某个uid是否在指定组内，如果在，则返回昵称、头像地址等信息
						this.receive_uidInfoByGroup(obj);
					}
					else if(obj["action"] == "gomove") {//收到行棋消息
						this.receive_gomove(obj);
					}
					else if(obj["action"] == "chat_group") {//收到组内聊天消息
						this.receive_chat(obj);
					}
					break;
			}
		}
		//egret.log("client_id="+this.client_id);
        egret.log("收到数据:"+msgStr);
    }

	//发送加入组消息
	static sendjoinGroup(_group_name:string = ''):void {
		var _magStr:string = '';
		if(_group_name == "") {//建立新组
			var join_time:number =new Date().getTime();//记录建立组时的时间戳
			var join_time_str:string = String(join_time);
			_magStr = '{"type":"join_new","uid":"'+Global.uid+'","group":"'+Global.uid+'_'+join_time_str+'","nickName":"'+Global.nickname+'"}';
		}
		else {
			_magStr = '{"type":"join","uid":"'+Global.uid+'","group":"'+_group_name+'"}';
		}
		
		this.sendData(_magStr);
	}

	//记录组的名称，即新建或者加入某个组的初始操作
	static record_groupName(_str:string):void {
		this.group_name = _str;//记录组名称
		this.group_all = new Array();//初始化当前组（棋局）成员的信息管理数组
		this.joinUserInfo(Global.uid, Global.own_role, Global.nickname, Global.headImgurl);//加入组成员至管理数组--自己
		this.joinUserInfo("", "", "", "");//加入组成员至管理数组--左
		this.joinUserInfo("", "", "", "");//加入组成员至管理数组--右
	}

	//加入组成员至管理数组
	static joinUserInfo(_uid:string, _role:string, _nickName:string, _headImgurl:string):void {
		var _arr:any[] = new Array(_uid, _role, _nickName, _headImgurl);
		this.group_all.push(_arr);
	}

	//修改组成员信息至管理数组
	static changeGroupInfo(_uid:string, _role:string, _nickName:string, _headImgurl:string, _index:number=-1):void {
		if(_index > -1 && _index < this.group_all.length) {
			var _arr:any[] = new Array(_uid, _role, _nickName, _headImgurl);
			this.group_all[_index] = _arr;
		}
		else {
			for(var i=1; i<this.group_all.length; i++) {//从第二个数据开始，因第一个是用户自己的信息
				if(this.group_all[i][0] == _uid) {
					if(_role != "") {
						this.group_all[i][1] = _role;
					}
					if(_nickName != "") {
						this.group_all[i][2] = _nickName;
					}
					if(_headImgurl != "") {
						this.group_all[i][3] = _headImgurl;
					}
					break;
				}
			}
		}
	}

	//收到新建组的消息处理
	static receivebuildGroup(_obj:Object):void {
		this.record_groupName(_obj["group_name"]);//记录组名称
		//Global.gogameid = _obj["insert_id"];//记录当前棋局id

		//解析参与者信息
		var _arr:any[] = new Array(["", ""], ["", ""]);
		var _plarArr:any[] = _obj["players"].split("_");
		var _ownIndex:number = -1;//标记对局双方中自己的索引，如没有则为-1
		for(var i=0; i<_plarArr.length; i++) {
			var _first:string = _plarArr[i].substring(0, 1);//角色代码
			var _uid:string = _plarArr[i].substring(1);
			_arr[i][0] = _first;
			_arr[i][1] = _uid;
			if(_uid == Global.uid) {//找到自己的角色
				_ownIndex = i;
			}
		}

		Global.baseData = _obj["baseData"];//本局棋谱
		Global.situation = "";//本局行棋记录
		Global.role_l = _arr[0][0];//当前棋局左侧玩家的角色
		Global.uid_l = _arr[0][1];//当前棋局的左侧玩家的uid
		Global.nickName_l = _obj["nickName_l"];//当前棋局左侧玩家的昵称
		this.changeGroupInfo(Global.uid_l, Global.role_l, _obj["nickName_l"], Global.headImgurl, 1);//修改组成员信息至管理数组
		Global.role_r = _arr[1][0];//当前棋局右侧玩家的角色
		Global.uid_r = _arr[1][1];//当前棋局的右侧玩家的uid
		Global.nickName_r = "";//当前棋局右侧玩家的昵称
		
		if(_ownIndex == -1) {//如果自己不在比赛参与者中
			if(_plarArr.length == 2) {
				Global.own_role = "C";//标记自己在棋局中的角色 B黑棋 W白棋 C旁观者
			}
			else {//尚未有人应战，则显示选择界面“应战或旁观”

			}
		}
		else {//自己在比赛参与者中
			Global.own_role = _arr[_ownIndex][0];//B黑棋 W白棋
			Global.gameStage.show_game();//显示棋局
		}
	}

	//收到加入并读取组信息的消息处理
	static receiveJoinGetInfo(_obj:Object):void {
		this.record_groupName(_obj["group_name"]);//记录组名称
		//Global.gogameid = _obj["insert_id"];//记录当前棋局id

		//解析参与者信息
		var _arr:any[] = new Array(["", ""], ["", ""]);
		var _plarArr:any[] = _obj["players"].split("_");
		var _ownIndex:number = -1;//标记对局双方中自己的索引，如没有则为-1
		for(var i=0; i<_plarArr.length; i++) {
			var _first:string = _plarArr[i].substring(0, 1);//角色代码
			var _uid:string = _plarArr[i].substring(1);
			_arr[i][0] = _first;
			_arr[i][1] = _uid;
			if(_uid == Global.uid) {//找到自己的角色
				_ownIndex = i;
			}
		}
		
		Global.baseData = _obj["baseData"];//本局棋谱
		Global.situation = _obj["situation"];//本局行棋记录
		Global.role_l = _arr[0][0];//当前棋局左侧玩家的角色
		Global.uid_l = _arr[0][1];//当前棋局的左侧玩家的uid
		Global.nickName_l = _obj["nickName_l"];//当前棋局左侧玩家的昵称
		this.changeGroupInfo(Global.uid_l, Global.role_l, _obj["nickName_l"], "", 1);//修改组成员信息至管理数组
		Global.role_r = _arr[1][0];//当前棋局右侧玩家的角色
		Global.uid_r = _arr[1][1];//当前棋局的右侧玩家的uid
		Global.nickName_r = _obj["nickName_r"];//当前棋局右侧玩家的昵称
		this.changeGroupInfo(Global.uid_r, Global.role_r, _obj["nickName_r"], "", 2);//修改组成员信息至管理数组
		if(_ownIndex == -1) {//如果自己不在比赛参与者中
			if(_plarArr.length == 2) {
				Global.own_role = "C";//标记自己在棋局中的角色 B黑棋 W白棋 C旁观者
				Global.gameStage.show_game();//显示棋局
			}
			else {//尚未有人应战，则显示选择界面“应战或旁观”
				Global.gameStage.show_game();//显示棋局
			}
		}
		else {//自己在比赛参与者中
			Global.own_role = _arr[_ownIndex][0];//B黑棋 W白棋
			//egret.log("Global.own_role="+Global.own_role);
			this.changeGroupInfo(Global.uid, Global.own_role, Global.nickname, Global.headImgurl, _ownIndex+1);//修改组成员信息至管理数组
			Global.gameStage.show_game();//显示棋局
		}
	}

	//收到加入组的消息处理
	static receive_joinGroup(_obj:Object):void {
		if(_obj["uid"] == Global.uid) {//如果是自己加入
			//暂时不做处理
		}
		else {//其他人加入
			//判断是否参赛者
			if(_obj["uid"] == Global.uid_l) {//左
				this.changeGroupInfo(_obj["uid"], Global.role_l, _obj["nickname"], _obj["headImgurl"], 1);//修改组成员信息至管理数组
				Global.userPanel.loadUsardImg_l(this.group_all[1][3]);//显示头像-左
			}
			else if(_obj["uid"] == Global.uid_r) {//右
				this.changeGroupInfo(_obj["uid"], Global.role_r, _obj["nickname"], _obj["headImgurl"], 2);//修改组成员信息至管理数组
				Global.userPanel.loadUsardImg_r(this.group_all[2][3]);//显示头像-右
			}
		}
	}

	//获取某个uid是否在指定组内，如果在，则返回昵称、头像地址等信息
	static receive_uidInfoByGroup(_obj:Object):void {
		if(_obj["uid"] == "") return;
		//egret.log("debug--_obj['uid']=" + _obj["uid"]);
		//判断是否参赛者
		if(_obj["uid"] == Global.uid_l) {//左
			this.changeGroupInfo(_obj["uid"], Global.role_l, _obj["nickname"], _obj["headImgurl"], 1);//修改组成员信息至管理数组
			Global.userPanel.loadUsardImg_l(this.group_all[1][3]);//显示头像-左
		}
		else if(_obj["uid"] == Global.uid_r) {//右
			this.changeGroupInfo(_obj["uid"], Global.role_r, _obj["nickname"], _obj["headImgurl"], 2);//修改组成员信息至管理数组
			Global.userPanel.loadUsardImg_r(this.group_all[2][3]);//显示头像-右
		}
	}

	//收到退出组的消息，从组中删除某client
	static receiveLeaveGroup(_obj:Object):void {
		if(_obj["uid"] == Global.uid) {//如果是自己退出
			Global.reset_gameInfo();//复位棋局参与者信息
			this.record_groupName("");//复位socket组相关信息
			Global.gameStage.remove_waitingSprite("leaveGroup");//移除等待通信画面并显示正常进入界面
		}
		else {//其他人退出
			//判断是否参赛者
			if(_obj["uid"] == Global.uid_l) {//左
				this.changeGroupInfo("", "", "", "", 1);//修改组成员信息至管理数组
				//移除头像
			}
			else if(_obj["uid"] == Global.uid_r) {//右
				this.changeGroupInfo("", "", "", "", 2);//修改组成员信息至管理数组
				//移除头像
			}
		}
	}

	//收到加入棋局--有人应战的消息
	static receive_joinGame(_obj:Object):void {
		if(_obj["uid"] == Global.uid) {//如果是自己应战
			if(_obj["errcode"] == "success") {//应战成功
				Global.role_r = Global.own_role = _obj["color"];//当前棋局右侧玩家的角色
		        Global.uid_r = _obj["uid"];//当前棋局的右侧玩家的uid
				Global.nickName_r = _obj["nickName_r"];//当前棋局右侧玩家的昵称
				this.changeGroupInfo(_obj["uid"], _obj["color"], _obj["nickName_r"], _obj["headImgurl"], 2);//修改组成员信息至管理数组
				Global.gameStage.remove_waitingSprite("joinGame_own");//移除等待通信画面并显示棋局
			}
		}
		else {//其他人应战
			if(_obj["errcode"] == "success") {//应战成功
				Global.role_r = _obj["color"];//当前棋局右侧玩家的角色
		        Global.uid_r = _obj["uid"];//当前棋局的右侧玩家的uid
				Global.nickName_r = _obj["nickName_r"];//当前棋局右侧玩家的昵称
				this.changeGroupInfo(_obj["uid"], _obj["color"], _obj["nickName_r"], _obj["headImgurl"], 2);//修改组成员信息至管理数组
				Global.gameStage.remove_waitingSprite("joinGame_other");//移除等待通信画面并显示棋局
			}
		}
	}

	//加入棋局--观众
	static receive_joinViewer(_obj:Object):void {
		if(_obj["uid"] == Global.uid) {//如果是自己加入观众
			Global.own_role = "C";//标记自己在棋局中的角色 B黑棋 W白棋 C旁观者
			Global.gameStage.remove_waitingSprite("joinViewer_own");//移除等待通信画面并显示棋局
		}
		else {//其他人加入观众
			
		}
	}

	//收到行棋记录
	static receive_gomove(_obj:Object):void {
		if(_obj["errcode"] == "success") {
			Global.play_go.receive_gomove(_obj);//收到落子消息
		}
		else {
			if(_obj["uid"] == Global.uid){//如果是自己行棋
				Global.show_pop("未能正常发送落子消息！");
			}
		}
	}

	//收到组内聊天消息
	static receive_chat(_obj:Object):void {
		var _name:string = "";
		if(_obj["uid"] == Global.uid) {
			_name = "我";
		}
		else {
			_name = _obj["nickName"];
		}
		Global.chatSprite.change_chatTxt(_name+"："+_obj["chatcontent"]);
	}






}