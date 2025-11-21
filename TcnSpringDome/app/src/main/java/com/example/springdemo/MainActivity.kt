package com.example.springdemo

import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.enableEdgeToEdge
import com.ys.sdk.demos.R
import com.ys.springboard.control.TcnVendEventID
import com.ys.springboard.control.TcnVendIF

class MainActivity : ComponentActivity() {

    companion object{
        private const val TAG = "MainActivity"
    }

    private lateinit var tvLog: TextView
    private lateinit var btShip: Button
    private lateinit var btBack: Button
    private val sb = StringBuilder()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)

        tvLog = findViewById(R.id.tvLog)
        btShip = findViewById(R.id.btShip)
        btBack = findViewById(R.id.btBack)

        btShip.setOnClickListener {
            testShip()
        }
        btBack.setOnClickListener {
            finish()
        }

        TcnVendIF.getInstance().registerListener(listener)
    }

    private fun testShip() {
        sb.append("testShip")
        sb.append("1(货道出货)\n")
        tvLog.text = sb.toString()
        TcnVendIF.getInstance().reqShipTest(1)
    }

    override fun onDestroy() {
        super.onDestroy()
        TcnVendIF.getInstance().unregisterListener(listener)
    }

    private val listener = TcnVendIF.VendEventListener {
        TcnVendIF.getInstance().LoggerInfoForce(TAG, "eventId : ${it.m_iEventID} param1: ${it.m_lParam1} param2: ${it.m_lParam2} param3: ${it.m_lParam3} param4: ${it.m_lParam5}")
        when (it.m_iEventID) {
            TcnVendEventID.COMMAND_SHIPPING -> {//出货中  commodity is dispensed successfully
                sb.append("出货中\n\n")
                tvLog.text = sb.toString()
            }
            TcnVendEventID.COMMAND_SHIPMENT_SUCCESS-> { //出货成功 commodity is dispensed successfully
                sb.append("出货成功\n\n")
                tvLog.text = sb.toString()
            }
            TcnVendEventID.COMMAND_SHIPMENT_FAILURE-> {//出货失败  commodity delivery failed
                sb.append("出货失败\n\n")
                tvLog.text = sb.toString()
            }

            TcnVendEventID.CMD_TEST_SLOT-> {//测试出货结果  commodity delivery failed
                var result: String = ""
                if (it.m_lParam3.toInt() == 1) {
                    result = "出货中"
                }else if (it.m_lParam3.toInt() == 2) {
                    result = "出货成功"
                }else if (it.m_lParam3.toInt() == 3) {
                    result = "出货失败"
                }
                Log.e(TAG, result)
            }
        }

    }
}
