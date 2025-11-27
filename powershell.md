Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Try the new cross-platform PowerShell https://aka.ms/pscore6

PS C:\Users\Administrator> Get-WmiObject -Class Win32_SerialPort | Select-Object DeviceID, Description, MaxBaudRate
>> ```

DeviceID Description         MaxBaudRate
-------- -----------         -----------
COM1     Communications Port      115200
`` : The term '``' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the
spelling of the name, or if a path was included, verify that the path is correct and try again.
At line:2 char:1
+ ```
+ ~~~
    + CategoryInfo          : ObjectNotFound: (``:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException



PS C:\Users\Administrator> Get-PnpDevice -Class Ports | Where-Object {$_.FriendlyName -like "*COM*" -and $_.FriendlyName -like "*USB*"} |
>>     Select-Object FriendlyName, InstanceId, Status, Problem |
>>     Format-Table -AutoSize

FriendlyName             InstanceId                                    Status          Problem
------------             ----------                                    ------          -------
USB Serial Device (COM6) USB\VID_2341&PID_0036\5&DED9A49&0&3           Unknown CM_PROB_PHANTOM
USB Serial Device (COM4) USB\VID_2341&PID_0036\5&DED9A49&0&4           Unknown CM_PROB_PHANTOM
USB Serial Device (COM5) USB\VID_2341&PID_8036&MI_00\6&11603854&0&0000 Unknown CM_PROB_PHANTOM
USB Serial Device (COM3) USB\VID_2341&PID_8036&MI_00\6&2419E8F9&0&0000 Unknown CM_PROB_PHANTOM


PS C:\Users\Administrator> Get-WmiObject -Class Win32_PnPEntity | Where-Object {$_.Name -like "*COM*"} |
>>     Select-Object Name, DeviceID, DriverVersion, DriverDate, Manufacturer |
>>     Format-Table -AutoSize

Name                                DeviceID                                            DriverVersion DriverDate Manufa
                                                                                                                 cturer
----                                --------                                            ------------- ---------- ------
Composite Bus Enumerator            ROOT\COMPOSITEBUS\0000                                                       Mic...
Communications Port (COM1)          ACPI\PNP0501\0                                                               (St...
HID-compliant touch screen          HID\VID_1FF7&PID_0013&MI_00&COL01\8&3165CE45&0&0000                          (St...
HID-compliant mouse                 HID\VID_1FF7&PID_0013&MI_01&COL01\8&338D5FEB&0&0000                          Mic...
PCI Express Root Complex            ACPI\PNP0A08\0                                                               (St...
USB Composite Device                USB\VID_1FF7&PID_0013\6&14A240A1&0&1                                         (St...
Microsoft ACPI-Compliant System     ACPI_HAL\PNP0C08\0                                                           Mic...
HID-compliant vendor-defined device HID\VID_1FF7&PID_0013&MI_00&COL03\8&3165CE45&0&0002                          (St...


PS C:\Users\Administrator> $tcnAdapters = Get-PnpDevice -Class Ports | Where-Object {
>>     $_.FriendlyName -match "(Prolific|CH340|FTDI|Qinheng)" -and
>>     $_.FriendlyName -match "COM"
>> }
>>
>> if ($tcnAdapters) {
>>     Write-Host "TCN-Compatible Adapters Found:" -ForegroundColor Green
>>     $tcnAdapters | Select-Object FriendlyName, InstanceId, Status | Format-Table -AutoSize
>> } else {
>>     Write-Host "No TCN-compatible adapters found" -ForegroundColor Red
>> }
No TCN-compatible adapters found
PS C:\Users\Administrator>