package com.example.springdemo;


import android.content.res.Configuration;

import com.ys.springboard.TcnService;
import com.ys.springboard.control.TcnVendIF;

import java.io.PrintWriter;
import java.io.StringWriter;

public class VendService extends TcnService {
    private static final String TAG = "VendService";
    private Thread.UncaughtExceptionHandler m_UncaughHandler = null;


    @Override
    public void onCreate() {
        super.onCreate();
        m_UncaughHandler = new Thread.UncaughtExceptionHandler() {
            public void uncaughtException(Thread thread, Throwable ex) {
                //任意一个线程异常后统一的处理 Unified processing after any thread exception
                StringWriter stringWriter = new StringWriter();
                PrintWriter writer = new PrintWriter(stringWriter);
                ex.printStackTrace(writer); // 打印到输出流 Print to output stream
                String exception =stringWriter.toString();
                stopSelf();
                TcnVendIF.getInstance().LoggerErrorForce(TAG, "setDefaultUncaughtExceptionHandler exception: "+exception);
            }
        };
        ////捕捉异常，并将具体异常信息写入日志中 Catching exceptions and writing specific exception information to logs
        Thread.setDefaultUncaughtExceptionHandler(m_UncaughHandler);

        TcnVendIF.getInstance().LoggerInfoForce(TAG, "onCreate()");
        VendIF.getInstance().initialize();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        TcnVendIF.getInstance().LoggerInfoForce(TAG, "onConfigurationChanged newConfig: "+newConfig.orientation);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        VendIF.getInstance().deInitialize();
        m_UncaughHandler = null;
        Thread.setDefaultUncaughtExceptionHandler(null);
        TcnVendIF.getInstance().LoggerInfoForce(TAG, "onDestroy()");
    }
}
