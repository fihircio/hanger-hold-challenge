package com.example.springdemo;

import android.os.Message;
import android.util.Log;

import com.ys.springboard.control.MsgTrade;
import com.ys.springboard.control.TcnComDef;
import com.ys.springboard.control.TcnComResultDef;
import com.ys.springboard.control.TcnVendIF;


/**
 * Created by Administrator on 2016/6/30.
 */
public class VendIF {
    private static final String TAG = "VendIF";
    private static VendIF m_Instance = null;

    /**************************  故障代码表Error code table ****************************
    public static final int ERR_CODE_0             = 0;   //正常	normal
    public static final int ERR_CODE_1             = 1;   //光电开关在没有发射的情况下也有信号输出 There is a signal output when the photoelectric switch no emission.
    public static final int ERR_CODE_2             = 2;    //发射有改变的时候 也没有信号输出 No signal is output when the emission changes
    public static final int ERR_CODE_3             = 3;     //出货时一直有输出信号 不能判断好坏 There is always an output signal when commodity is dispensing.
    public static final int ERR_CODE_4             = 4;    //没有检测到出货（在开启光检的时候TcnShareUseData.getInstance().setDropSensorCheck(true);，弹簧转了个空货道，光检没有检测到掉货，就会报此故障）No shipment detected. ( when turn on drop sensor, TcnShareUseData.getInstance().setDropSensorCheck(true);the spring rotate but no commodity on the slot, to an empty cargo lane, so the drop sensor cannot detect a commodity. In this case, error code 4 is reported)
    public static final int ERR_CODE_22             = 22;   //P型MOS管有短路16 P-type MOS tube has short circuit; 16
    public static final int ERR_CODE_23             = 23;    //P型MOS管有短路; 光电开关在没有发射的情况下也有信号输出;17 P-type MOS tube has short circuit,there is a signal output when the photoelectric switch no emission ;17
    public static final int ERR_CODE_24             = 24;    //P型MOS管有短路; 发射有改变的时候 也没有信号输出;18 P-type MOS tube has short  circuit, no signal is output when the emission changes ;18
    public static final int ERR_CODE_25             = 25;    //P型MOS管有短路; 出货时一直有输出信号 不能判断好坏;19 P-type MOS tube has short circuit,there is always an output signal when commodity is dispensing; 19.
    public static final int ERR_CODE_50             = 50;    //N型MOS管有短路;32 N-type MOS tube has short circuit 32
    public static final int ERR_CODE_51             = 51;    //N型MOS管有短路; 光电开关在没有发射的情况下也有信号输出;33N-type MOS tube has short circuit,  The photoelectric switch also has a signal output when there is no emission; 33N
    public static final int ERR_CODE_52             = 52;    //N型MOS管有短路; 发射有改变的时候 也没有信号输出;34 N-type MOS tube has short circuit,  No signal is output when the transmission changes ;34N
    public static final int ERR_CODE_53             = 53;    //N型MOS管有短路; 出货时一直有输出信号 不能判断好坏;35 N-type MOS tube has short circuit,  There is always an output signal when commodity is dispensing ;35N
    public static final int ERR_CODE_72             = 72;    //电机短路;48 Motor short; 48
    public static final int ERR_CODE_73             = 73;    //电机短路; 光电开关在没有发射的情况下也有信号输出;73 Motor short circuit; There is a signal output when the photoelectric switch no emission; 73
    public static final int ERR_CODE_80             = 80;    //电机短路; 发射有改变的时候 也没有信号输出;50 Motor is short-circuited; No signal is output when the emission changes ;50
    public static final int ERR_CODE_81             = 81;    //电机短路;出货时一直有输出信号 不能判断好坏;51 The motor is short-circuited; There is always an output signal when commodity is dispensing; 51.
    public static final int ERR_CODE_100             = 100;    //电机断路;64 Motor open circuit; 64
    public static final int ERR_CODE_101             = 101;    //电机断路; 光电开关在没有发射的情况下也有信号输出;65 Motor is open circuit; photoelectric switch also has signal output when there is no emission; 65
    public static final int ERR_CODE_102             = 102;    //电机断路; 发射有改变的时候 也没有信号输出;66 Motor is open circuit; no signal is output when the transmission is changed; 66
    public static final int ERR_CODE_103             = 103;    //电机断路;出货时一直有输出信号 不能判断好坏;67 The motor is open; There is always an output signal when commodity is dispensing. 67
    public static final int ERR_CODE_128             = 128;    //RAM出错,电机转动超时。80 RAM error, motor rotation timed out. 80
    public static final int ERR_CODE_129             = 129;    //在规定时间内没有接收到回复数据 表明驱动板工作不正常或者与驱动板连接有问题。81  If no response data is received within the stipulated time, the problem may be the driver board does not properly or there is a problem with the driver board connection. 81
    public static final int ERR_CODE_130             = 130;    //接收到数据不完整。82 Received data is incomplete. 82
    public static final int ERR_CODE_131             = 131;    //校验不正确。131 Check is incorrect. 131
    public static final int ERR_CODE_132             = 132;    //地址不正确。132 The address is incorrect. 132
    public static final int ERR_CODE_134             = 134;    //货道不存在。134 The slot does not exist. 134
    public static final int ERR_CODE_135             = 135;    //返回故障代码有错超出范围。87 The returned error code is out of range. 87
    public static final int ERR_CODE_144             = 144;    //连续多少次转动正常但没检测到商品售出。90 Slot rotations normal but no commodity is detected. 90
    public static final int ERR_CODE_255            = 255;   //货道不存在 The slot does not exist

    ********************************************************************************/


    public static synchronized VendIF getInstance() {
        if (null == m_Instance) {
            m_Instance = new VendIF();
        }
        return m_Instance;
    }

    public void initialize() {
        registerListener ();
    }


    public void deInitialize() {
        unregisterListener();
    }

    public void registerListener () {
        TcnVendIF.getInstance().setOnCommunicationListener(m_CommunicationListener);
    }

    public void unregisterListener() {
        TcnVendIF.getInstance().setOnCommunicationListener(null);
    }

    private void OnSelectedSlotNo(int slotNo) {

    }

    //驱动板上报过来的数据(Data reported from the driver board) slotNo:货道号     status:0 货道状态正常 slot status normal     4：没有检测到掉货      255(No commodity detected 255:)：货道号不存在（检测不到该货道）The slot number does not exist (the slot number cannot be detected)
    public void OnUploadSlotNoInfo(boolean finish, int slotNo, int status) {

    }

    //驱动板上报过来的数据(Data reported from the driver board) slotNo:货道号     status:0 货道状态正常    slot status normal    4：没有检测到掉货      255(No commodity detected 255:)：货道号不存在（检测不到该货道）The slot number does not exist (the slot number cannot be detected)
    public void OnUploadSlotNoInfoSingle(boolean finish, int slotNo, int status) {
        Log.i(TAG, "OnUploadSlotNoInfoSingle finish: " + finish + " slotNo: " + slotNo + " status: " + status);
    }

    //出货状态返回(commodity dispensing status return)    slotNo： 货道号    shipStatus： 出货状态 dispensing status   status: 货道状态正常    支付订单号（出货接口传入，原样返回） slot status is normal, paid transaction number (dispensing interface data in, return as it is)  amount：支付金额（出货接口传入，原样返回）paid amount (dispensing interface data in, return as it is); 
    private void OnShipWithMethod(int slotNo, int shipStatus,int errCode, String tradeNo, String amount) {
        Log.i(TAG, "OnShipWithMethod slotNo: " + slotNo + " shipStatus: " + shipStatus+" errCode: "+errCode
                + " tradeNo: " + tradeNo+" amount: "+amount);

        if (TcnComResultDef.SHIP_SHIPING == shipStatus) {   //出货中 commodity is dispensing

        } else if (TcnComResultDef.SHIP_SUCCESS == shipStatus) {   //出货成功 commodity is dispensed successfully

        } else if (TcnComResultDef.SHIP_FAIL == shipStatus) {    //出货失败 commodity is dispensed failed

        } else {

        }
    }

    private void OnDoorSwitch(int door) {

    }

    private void OnSelectedGoods(int slotNoOrKey, String price) {

    }

    private void OnShipForTestSlot(int slotNo, int errCode, int shipStatus) {
        Log.i(TAG, "OnShipForTestSlot slotNo: " + slotNo + " errCode: " + errCode + " shipStatus: " + shipStatus);
    }

//    private void OnUploadGoodsInfo(int slotNo, int finish, Coil_info slotInfo) {
//
//    }

    /*
     * 此处监听底层发过来的数据，此处接收数据位于线程内 Here monitor the data sent from the bottom layer, and the received data here is in the thread
     */
    private VendCommunicationListener m_CommunicationListener = new VendCommunicationListener();
    private class VendCommunicationListener implements TcnVendIF.CommunicationListener {

        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case TcnComDef.COMMAND_SELECT_SLOTNO: //调用TcnVendIF.getInstance().reqSelectSlotNo();
                    OnSelectedSlotNo(msg.arg1);    //选择货道成功 Chose slot successfully
                    break;
                case TcnComDef.COMMAND_SLOTNO_INFO:
                    OnUploadSlotNoInfo((boolean) msg.obj, msg.arg1, msg.arg2);    //底层上报上来的货道状态,会连续上报所有货道 The slot status reported from the bottom layer and all slots will be continuously reported.
                    break;
                case TcnComDef.COMMAND_SLOTNO_INFO_SINGLE: //调用TcnVendIF.getInstance().reqQuerySlotStatus();
                    OnUploadSlotNoInfoSingle((boolean) msg.obj, msg.arg1, msg.arg2);    //底层上报上来的货道状态  The slot status reported from the bottom layer 
                    break;
                case TcnComDef.COMMAND_SHIPMENT_CASHPAY:
	                MsgTrade mMsgToSendcash = (MsgTrade) msg.obj;
                    OnShipWithMethod(msg.arg1, msg.arg2,mMsgToSendcash.getErrCode(), mMsgToSendcash.getTradeNo(),mMsgToSendcash.getAmount());
                    if (TcnComResultDef.SHIP_SUCCESS == msg.arg2) {
//                        TcnVendIF.getInstance().payOutCashBalance(msg.arg1, mMsgToSendcash.getTradeNo());   //
                        TcnVendIF.getInstance().payOutCashBalance();  //退掉剩余的币
                    }
                    break;
                case TcnComDef.COMMAND_SHIPMENT_WECHATPAY:
	                MsgTrade mMsgToSendWx = (MsgTrade) msg.obj;
                    OnShipWithMethod(msg.arg1, msg.arg2, mMsgToSendWx.getErrCode(),mMsgToSendWx.getTradeNo(),mMsgToSendWx.getAmount());
                    break;
                case TcnComDef.COMMAND_SHIPMENT_ALIPAY:
	                MsgTrade mMsgToSendAli = (MsgTrade) msg.obj;
                    OnShipWithMethod(msg.arg1, msg.arg2, mMsgToSendAli.getErrCode(),mMsgToSendAli.getTradeNo(),mMsgToSendAli.getAmount());
                    break;
                case TcnComDef.COMMAND_SHIPMENT_GIFTS:
                    MsgTrade mMsgToSendGifts = (MsgTrade) msg.obj;
                    OnShipWithMethod(msg.arg1, msg.arg2, mMsgToSendGifts.getErrCode(),mMsgToSendGifts.getTradeNo(),mMsgToSendGifts.getAmount());
                    break;
                case TcnComDef.COMMAND_SHIPMENT_REMOTE:
                    MsgTrade mMsgToSendRemote = (MsgTrade) msg.obj;
                    OnShipWithMethod(msg.arg1, msg.arg2, mMsgToSendRemote.getErrCode(),mMsgToSendRemote.getTradeNo(),mMsgToSendRemote.getAmount());
                    break;
                case TcnComDef.COMMAND_SHIPMENT_VERIFY:
                    MsgTrade mMsgToSendVerfy = (MsgTrade) msg.obj;
                    OnShipWithMethod(msg.arg1, msg.arg2, mMsgToSendVerfy.getErrCode(),mMsgToSendVerfy.getTradeNo(),mMsgToSendVerfy.getAmount());
                    break;
                case TcnComDef.COMMAND_SHIPMENT_BANKCARD_ONE:
                    MsgTrade mMsgToSendBankcard = (MsgTrade) msg.obj;
                    OnShipWithMethod(msg.arg1, msg.arg2,mMsgToSendBankcard.getErrCode(), mMsgToSendBankcard.getTradeNo(),mMsgToSendBankcard.getAmount());
                    break;
                case TcnComDef.COMMAND_SHIPMENT_BANKCARD_TWO:
                    MsgTrade mMsgToSendBankcardTwo = (MsgTrade) msg.obj;
                    OnShipWithMethod(msg.arg1, msg.arg2, mMsgToSendBankcardTwo.getErrCode(),mMsgToSendBankcardTwo.getTradeNo(),mMsgToSendBankcardTwo.getAmount());
                    break;
                case TcnComDef.COMMAND_SHIPMENT_TCNCARD_OFFLINE:
                    MsgTrade mMsgToSendBankcardOffLine = (MsgTrade) msg.obj;
                    OnShipWithMethod(msg.arg1, msg.arg2, mMsgToSendBankcardOffLine.getErrCode(),mMsgToSendBankcardOffLine.getTradeNo(),mMsgToSendBankcardOffLine.getAmount());
                    break;
                case TcnComDef.COMMAND_SHIPMENT_TCNCARD_ONLINE:
                    MsgTrade mMsgToSendBankcardOnLine = (MsgTrade) msg.obj;
                    OnShipWithMethod(msg.arg1, msg.arg2, mMsgToSendBankcardOnLine.getErrCode(),mMsgToSendBankcardOnLine.getTradeNo(),mMsgToSendBankcardOnLine.getAmount());
                    break;
                case TcnComDef.COMMAND_SHIPMENT_OTHER_PAY:
                    MsgTrade mMsgToSendBankcardPay = (MsgTrade) msg.obj;
                    OnShipWithMethod(msg.arg1, msg.arg2, mMsgToSendBankcardPay.getErrCode(),mMsgToSendBankcardPay.getTradeNo(),mMsgToSendBankcardPay.getAmount());
                    break;
                case TcnComDef.CMD_TEST_SLOT:
                    OnShipForTestSlot(msg.arg1, msg.arg2, (Integer) msg.obj);
                    break;
                case TcnComDef.CMD_READ_DOOR_STATUS:
                    Log.i(TAG, "CMD_READ_DOOR_STATUS msg.arg1: " + msg.arg1+" msg.arg2: "+msg.arg2);
                    if (TcnComResultDef.DOOR_CLOSE == msg.arg1) {   //关门 close the door

                    } else if (TcnComResultDef.DOOR_OPEN == msg.arg1) {   //OPEN the door

                    }
                    else {

                    }
                    break;
                case TcnComDef.CMD_READ_CURRENT_TEMP:   //单个柜子温度上报 report single machine temperture，msg.arg1：柜子编号 machine number 0,1,2    msg.arg2：温度值 temperature value 
                    String temper = (String) msg.obj;  //温度描述 Temperature description
                    break;
                case TcnComDef.CMD_READ_TEMP:     //所有柜子温度描述 all machine temperature description  (String) msg.obj: 主柜和副柜温度描述 master machine and slave machine temperature descriptions
                    String temperAll = (String) msg.obj;
                    break;
	            case TcnComDef.CMD_CHECK_AUTH:

                    break;
                default:
                    break;
            }
        }
    }
}
