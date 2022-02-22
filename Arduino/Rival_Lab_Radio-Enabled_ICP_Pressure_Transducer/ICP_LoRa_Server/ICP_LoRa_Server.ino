
#include <RH_RF95.h> // RFM9x radio transmitter/reciever library
#include <SPI.h>
#include <icp101xx.h> // ICP sensor library

ICP101xx mysensor;

#define RFM95_INT 9 // "A"  //***Need to update pin-assignments if they don't match arduino/break-out board
#define RFM95_CS 10 // "B"
#define RFM95_RST 11 // "C"
#define RF95_FREQ 433 //we're using 433 MHz

// Singleton instance of the radio driver
RH_RF95 rf95(RFM95_CS, RFM95_INT);

void setup() {

  //1. INITIALIZE THE RFM95 RADIO TRANSMITTER
  pinMode(RFM95_RST, OUTPUT);
  digitalWrite(RFM95_RST, HIGH);
  //Serial.begin(10000000); //10 MHz is max baud rate that RFM95 can handle but there may be compatibility issues
  Serial.begin(1000000); //Using 1 MHz baud rate [we can adjust]
  while (!Serial) {
    delay(1);
  }
  delay(100); 
  digitalWrite(RFM95_RST, LOW);
  delay(10);
  digitalWrite(RFM95_RST, HIGH);
  delay(10);
  while (!rf95.init()) {
    Serial.println("Radio init failed");
    Serial.println("Uncomment '#define SERIAL_DEBUG' in RH_RF95.cpp for detailed debug info");
    while (1);
  }
  Serial.println("Radio init successful"); 
  // Defaults after init are 434.0MHz, modulation GFSK_Rb250Fd250, +13dbM
  if (!rf95.setFrequency(RF95_FREQ)) {
    Serial.println("setFrequency failed");
    while (1);
  }
  Serial.print("Set Freq to: "); Serial.println(RF95_FREQ);
  // Defaults after init are 434.0MHz, 13dBm, Bw = 125 kHz, Cr = 4/5, Sf = 128chips/symbol, CRC on
  // The default transmitter power is 13dBm, using PA_BOOST.
  // If you are using RFM95/96/97/98 modules which uses the PA_BOOST transmitter pin, then
  // you can set transmitter powers from 5 to 23 dBm:
  rf95.setTxPower(23, false);
  
  //2. INITIALIZE THE ICP-101xx SENSOR
  mysensor.begin(); //sensor will use the Ardino "Wire" object for I2C by default
  if (!mysensor.begin()) {
    Serial.println("Sensor setup failed.");
    while (1);
  }
}

float packetnum = 0; // packet counter, increments each data transmission

void loop() {
  if (mysensor.isConnected()) {
    mysensor.measure(mysensor.FAST); //FAST - Low-power mode, 3ms, ±3.2 Pa noise
    float pdata[2] = {packetnum++,mysensor.getPressurePa()}; //packet num and corresponding pressure reading
    rf95.send((uint8_t *)(&pdata), sizeof(pdata));
    rf95.waitPacketSent(); //Waiting for packet send to complete...
  } else { // ICP sensor is not connected
    Serial.println("Pressure sensor is disconnected!");
    while (1);
  }
}
