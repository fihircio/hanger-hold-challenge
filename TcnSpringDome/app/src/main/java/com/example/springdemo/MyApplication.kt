package com.example.springdemo

import android.app.Application
import com.ys.springboard.control.TcnShareUseData
import com.ys.springboard.control.TcnVendIF

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        //首先初始化TcnVendIF
        TcnVendIF.getInstance().run {
            init(this@MyApplication)
            setConfig()
            startWorkThread()
        }
        //此处主板串口接安卓哪个串口，就填哪个串口  Please fill in the serial port that the mother board is connected to the android board.
        TcnShareUseData.getInstance().boardSerPortFirst = "/dev/ttyS1"
//        TcnShareUseData.getInstance().setBoardSerPortFirst("/dev/ttymxc1");
        //VendIF 这个文件里面 TcnComDef.COMMAND_SLOTNO_INFO这个消息，是上报货道信息的消息,每次重启程序都会查询一次所有的货道信息 The message TcnComDef.COMMAND_SLOTNO_INFO in the VendIF folder is a message reporting the slot information. All slots information will be queried each time when the program is restarted.

        /****************  如果接有副柜  副柜是弹簧机，则需要如下设置  If the slave machine is connected, and the slave machine is a spring machine, it needs to be set as follows **********************/
//        TcnShareUseData.getInstance().setSerPortGroupMapFirst("0");    //设置主柜组号，也可不设置，默认就是0. Set master machine group number, you can do not set it as well, the default is 0
//        TcnShareUseData.getInstance().setSerPortGroupMapSecond("0");   //设置副柜组号为0,副柜需要接安卓另外一个串口 Set the slave machine group number to 0.The slave machine needs to be connect to another serial port of Android.
        //TcnShareUseData.getInstance().setBoardTypeSecond("thj");   //设置副柜类型为弹簧机  Set the slave machine type to be spring machine
//        TcnShareUseData.getInstance().setBoardSerPortSecond("/dev/ttyS1");    //设置副柜串口，副柜接安卓哪个串口，就填哪个串口 Set the serial port of the slave machine, fill in that serial port is connected to the Android board.

        /****************  如果接有副柜，副柜是格子机  则需要如下设置   If the slave machine is connected and the slave machine is a locker, the following settings are required**********************/
//        TcnShareUseData.getInstance().setSerPortGroupMapSecond("1");   //设置副柜组号为1,副柜需要接安卓另外一个串口 Set the slave machine group number to 1.The slave machine needs to be connected to another serial port of Android board.
//         TcnShareUseData.getInstance().setBoardTypeSecond("gzj");   //设置副柜类型为格子机 Set the slave machine type to locker.
//        TcnShareUseData.getInstance().setBoardSerPortSecond("/dev/ttyS1");    //设置副柜串口，副柜接安卓哪个串口，就填哪个串口 Set the serial port of the slave machine, which serial port is connected to the Android board.

        /****************  锁机限制 Locking restrictions **********************/

        //TcnShareUseData.getInstance().setShipContinFailCount(0);  当前连续出货失败次数 Current consecutive shipment failures
        //TcnShareUseData.getInstance().getShipContinFailCount()；
        //
        //TcnShareUseData.getInstance().setShipFailCountLock(Integer.valueOf(str[which]).intValue());  //设置为9就是取消锁机限制，不锁机 Set to 9 to cancel the lock restriction, not lock
        // TcnShareUseData.getInstance().getShipFailCountLock();连续多少次出货失败锁机 How many consecutive shipment failures lock the machine


        /*******************************      如果有电子价格标签  **************************************/

        //  TcnShareUseData.getInstance().setBoardSerPortDgtDsp("/dev/ttysWK3");    //电子价格标签串口，接哪个就设置哪个 Electronic price tag serial port, whichever is set
        //TcnVendIF.getInstance().reqCmdDisplay(int slotNo,String price);  //设置价格标签 Set price tags  slotNo:货道号   price：价格
        // 一次性设置多个价格，底层会自动循环设置  modifyListInfo：变动的价格集合（有变动，就优先设置这个）  Set multiple prices at one time, and the bottom layer will automatically set modifyListInfo: changing price set (there is priority to set this if there is a change)   allListInfo：所有的货道的价格集合(如果没有变动，就会每隔一会就从这里面拿来设置)The price set of all cargo lanes (if there is no change, it will be set from there every other time)
        //TcnVendIF.getInstance().reqModifyDisplay(List<Coil_info> modifyListInfo,List<Coil_info> allListInfo)


        /****************  如果带现金  则需要如下设置  If the machine is installed with bill acceptor or coin chanager, you need to set up as follows **********************/
//        TcnShareUseData.getInstance().setCashPayOpen(true);  //设置是否启用现金支付 Set whether or  not to enable cash payment method
//        TcnShareUseData.getInstance().setBoardSerPortMDB("/dev/ttyS2");    //此处MDB主板设备接安卓哪个串口，就填哪个串口 Here, fill in which serial port of the MDB convert board is connected to Android board.

        //TcnShareUseData.getInstance().setPaperChangeOpen(xx)
        //  TcnShareUseData.getInstance().getPaperChangeOpen(); //纸币找零类型  0:不支持找零  1：按金额找零  2：按张数找零(一张找完，再找下一张,一张一张找) Banknote change type 0: Does not support change 1: Change by amount 2: Change by number of bank note (bank note changer normally support to return 1 denomination only.)


        //        TcnVendIF.getInstance().upLoadMoneyToCard(soltNo,price,tradeNo);        //向刷卡器上报现金消费
//        TcnVendIF.getInstance().payCardSuccess(soltNo,tradeNo);    //MDB刷卡出货成功
//        TcnVendIF.getInstance().payCardFail(soltNo,tradeNo);    //MDB刷卡出货失败

        //TcnVendIF.getInstance().isCardCanPay()判断能不能刷卡购买


        /*
        一、配置串口
        比如：
        TcnShareUseData.getInstance().setBoardSerPortFirst("/dev/ttyS1");
        TcnShareUseData.getInstance().setCashPayOpen(true);
        TcnShareUseData.getInstance().setBoardSerPortMDB("/dev/ttyS2");

        二、重启

        三、重启  等 TcnComDef.COMMAND_SLOTNO_INFO 接收到所有货道的状态


        四、选货
        发选货命令 TcnVendIF.getInstance().reqSelectSlotNo();
        收到TcnVendEventID.COMMAND_SELECT_GOODS 通知之后，表示选货成功，该货道正常，可以购买

        选货成功之后 TcnVendIF.getInstance().reqCardPay   请求刷卡命令   收到信息TcnVendEventID.CMD_START_CARD_PAY之后，表示请求成功

        五、投纸币或者硬币 会接收到下面的消息
        接收纸币: TcnVendEventID.MDB_RECIVE_PAPER_MONEY
        接收硬币: TcnVendEventID.MDB_RECIVE_COIN_MONEY

        调用：TcnVendIF.getInstance().getBalance()  获取当前余额

        cEventInfo.m_lParam4:投币金额

        六、如果投币金额到达购买的金额之后，调用出货命令 TcnVendIF.getInstance().reqShip(cEventInfo.m_lParam2,PayMethod.PAYMETHED_CASH,amount,tradeNo);      //此处调用出货命令


        //先运行程序之后，请将TcnKey目录的tcn_sdk_device_id.txt文件发给我们，授权才能使用，每台机器都必须先授权。 After running the program first, please send us the tcn_sdk_device_id.txt file in the TcnKey directory for authorization to use, and each machine must be authorized first.


        七、出货结果返回
        case TcnVendEventID.COMMAND_SHIPPING: //出货中  commodity is dispensed successfully
        case TcnVendEventID.COMMAND_SHIPMENT_SUCCESS: //出货成功 commodity is dispensed successfully
        case TcnVendEventID.COMMAND_SHIPMENT_FAILURE: //出货失败  commodity delivery failed

        */

        /*******************************      故障代码表见 VendIF  这个文件  See the VendIF file for the fault code table**************************************/


        /*
        MainAct中：
        注册底层监听：Register the underlying listener
        TcnVendIF.getInstance().registerListener(m_vendListener);

        取消监听： Cancel listening
        TcnVendIF.getInstance().unregisterListener(m_vendListener);


        常用命令如下： Common commands are as follows:

        出货：TcnVendIF.getInstance().reqShip(slotNo,shipMethod,amount,tradeNo);
        测试出货：TcnVendIF.getInstance().reqShipTest(Integer.parseInt(strParam));
        选货（只有选货成功，才能代表该货道可以购买）：TcnVendIF.getInstance().reqSelectSlotNo(Integer.valueOf(strParam));
        查询命令：TcnVendIF.getInstance().reqQueryStatus(-1);



        出货返回消息：Shipping return message
        出货中 Shipping：TcnVendEventID.COMMAND_SHIPPING
        出货成功 Shipped successfully：TcnVendEventID.COMMAND_SHIPMENT_SUCCESS
        出货失败 Shipping failed：TcnVendEventID.COMMAND_SHIPMENT_FAILURE

        选货成功返回消息：TcnVendEventID.COMMAND_SELECT_GOODS


                case TcnVendEventID.CMD_QUERY_SWIPE_STATUS:
//					TcnVendEventResultID.CARD_SWIPE_STATUS_FREE  = 0;  //空闲
//					TcnVendEventResultID.CARD_SWIPE_STATUS_SWIPED = 1;       //已刷卡   此时请不要发送停止刷卡指令，禁止返回，等待刷卡器超时返回
//					TcnVendEventResultID.CARD_SWIPE_STATUS_REQPAY = 2;       //请求交易
//					TcnVendEventResultID.CARD_SWIPE_STATUS_CONSUMED  = 3;       //交易完成
//					TcnVendEventResultID.CARD_SWIPE_STATUS_CONSUM_ERR  = 4;       //交易异常

//					if (m_DialogPay != null) {
//						if (cEventInfo.m_lParam1 == TcnVendEventResultID.CARD_SWIPE_STATUS_SWIPED) {
//							m_DialogPay.setButtonBackEnable(false);
//						} else {
//							m_DialogPay.setButtonBackEnable(true);
//						}
//
//					}
					break;
				case TcnVendEventID.CMD_CARD_CONSUMED_SUCCESS:    //msg.arg1:货道号 刷卡消费成功 card pay success
					break;
				case TcnVendEventID.CMD_CARD_CONSUMED_FAIL:
					break;
				case TcnVendEventID.CMD_PAYOUT_AMOUNT:
					if (TcnVendEventResultID.MDB_PAYOUT_START == cEventInfo.m_lParam1) {        //开始退币

					} else if (TcnVendEventResultID.MDB_PAYOUT_END == cEventInfo.m_lParam1) {   //退币结束

					} else {

					}
					break;

		*/


        /******************** 5寸屏主板用着MDB主板通讯控制现金和刷卡**************************************/
//        初始化设置：
//        TcnShareUseData.getInstance().setMdbBoardType(TcnDriveType.MACHINE_TYPE_5INCH);
//        TcnShareUseData.getInstance().setCashPayOpen(true);
//        TcnShareUseData.getInstance().setBoardSerPortMDB("/dev/ttyS2");    //MDB串口设置  主板接哪个串口就设置为哪个串口

        //MDB消费的时候：
        //如果出货方式调用的是PayMethod.PAYMETHED_CASH 则上报给MDB的出货结果会内部调用，即内部已经调用了TcnVendIF.getInstance().reqUploadMDBCashPay();
        // 如果出货方式不是 PayMethod.PAYMETHED_CASH,可以自己调用TcnVendIF.getInstance().reqUploadMDBCashPay();
//        TcnVendIF.getInstance().ship(1, PayMethod.PAYMETHED_CASH,"0.2","2589764523");

        //如果出货方式调用的是PayMethod.PAYMETHED_MDB_CARD 则上报给MDB的出货结果会内部调用，即内部已经调用了TcnVendIF.getInstance().reqUploadMDBCardPay();
        // 如果出货方式不是 PayMethod.PAYMETHED_MDB_CARD,可以自己调用TcnVendIF.getInstance().reqUploadMDBCardPay();
//        TcnVendIF.getInstance().ship(1, PayMethod.PAYMETHED_MDB_CARD,"0.2","2589764523");

//        TcnVendIF.getInstance().reqSelectSlotNo(); //选货成功之后，返回通知
//        case TcnVendEventID.COMMAND_SELECT_GOODS:  //选货成功  Select commodity successfully
//            TcnUtilityUI.getToast(MainAct.this, "选货成功"); //Select commodity successfully
//              此时可以调用刷卡支付：
//        TcnVendIF.getInstance().reqCardPay();    //请求刷卡
//        TcnVendIF.getInstance().isCardCanPay();
//        TcnVendIF.getInstance().reqStopCardPay();     //取消刷卡
//        TcnVendIF.getInstance().isUploadingMDBPay();  //正在上报消费结果
//            break;
//
//        case TcnVendEventID.CMD_CARD_CONSUMED_SUCCESS:    //msg.arg1:货道号 刷卡消费成功 card pay success
        //              此时可以调用出货指令：TcnVendIF.getInstance().ship(1, PayMethod.PAYMETHED_MDB_CARD,"0.2","2589764523");
//            break;
//        case TcnVendEventID.CMD_CARD_CONSUMED_FAIL: 刷卡消费失败
//            break;
    }
}