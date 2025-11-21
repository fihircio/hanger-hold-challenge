package com.example.springdemo;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.ys.springboard.control.TcnVendIF;


/**
 * 描述 description： 
 * 作者 Author：Jiancheng,Song on 2016/5/31 15:30
 * 邮箱 mailbox：m68013@qq.com
 */
public class BootBroadcastReceiver extends BroadcastReceiver {

    private static final String action_boot="android.intent.action.BOOT_COMPLETED";
    private Context m_context = null;
    private Intent m_intent_Service;


    @Override
    public void onReceive(Context context, Intent intent) {
        if (null == context) {
            return;
        }
        m_context = context;
        if(action_boot.equals(intent.getAction())){
            TcnVendIF.getInstance().LoggerDebug("BootBroadcastReceiver", "action_boot");
            //启动服务与主板进行通讯 Start the service to communicate with the motherboard
            m_intent_Service = new Intent(m_context, VendService.class);
            m_context.startService(m_intent_Service);
        }
    }
}
