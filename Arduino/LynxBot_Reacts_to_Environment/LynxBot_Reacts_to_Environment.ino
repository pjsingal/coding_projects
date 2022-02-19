/************************************************************
"LynxBot Reacts to Environment"
Created by P. Singal, R. Doyle, 01/11/2021
LynxBot follows wall, turns corner, follows wall, and then 
stops before colliding head-on into another wall. The LynxBot 
turns, follows wall, and then stops about 1m after passing the 
terminal end of that wall. LynxBot orients itself in direction 
of maximum light. It drives in that direction, and stops to 
reorient itself ~1m away from the light. It then approaches the 
light, turns 180º, and then reverses to block the light.
*************************************************************/

int RED = 4;         //red LED Pin
int GRN = 5;         //green LED Pin
int YLW = 6;         //yellow LED Pin 
int servoPin = 12;    //servo connected to digital pin 12
int myAngle;          //angle of the servo roughly 0-180
int LIGHT = A0;     //photoresistor pin (can't be lowercase a0)


int BUTTON_A = 7;
int BUTTON_B = 8;
int BUTTON_C = 9;
int MOTOR_L = 10;  // left motor signal
int MOTOR_R = 11;  // right motor signal
int BUMPER = 13;
int SHARP1 = A1;   // sharp input pin
int SHARP2 = A3;
int sensor1;       // sharp sensor reading
int sensor2;      //forward sharp

int result;          //A to D value from photoresistor
int mvresult;        //millivolt value for photoresistor

int mvMid = 2850; // [mv] for 1.0m
int HyMid = 600; // [mv] noise for 1.0m is ±300 mv
int mvTarg = 4300; // [mv] for 1.0m
int HyTarg = 100; // [mv] noise for 1.0m is ±300 mv
int ii;
int jj;
int kk;
int numIter;
int maxVal;
int maxIdx;
int maxVal2;
int lightArray;
int light;
int maxValLoc;
int error1;  // comment
int dummy;

int insideWall = 2140;

int flag;
int WALL = 1100;       // 700 (40cm) for corridor, 1200 (20cm) for wall         ///Tune
int STOP_SPEED = 149;  // 150 to begin
 int delta = 20;        // 15 to begin                                     ///Tune
 int HYS1  = 100;   // 50 as default for HYS1terisis                          ///Tune 
 int HYS2 = 200;
float KP = 0.25;

const int time90 = 980;
const int time180 = 2500;

// Setup Routine
void setup() {                
  pinMode(GRN, OUTPUT);
  pinMode(YLW, OUTPUT);
  pinMode(RED, OUTPUT);
  pinMode(BUTTON_B, INPUT);
  pinMode(LIGHT, INPUT);
   pinMode(MOTOR_L, OUTPUT); // initialize motor outputs
  pinMode(MOTOR_R, OUTPUT);
   pinMode(BUMPER, INPUT);  // initialize inputs
  pinMode(BUTTON_A, INPUT);
  pinMode(BUTTON_C, INPUT);
  
  Serial.begin(9600);
  Serial.println(4500);            // set desired max vertical scale
  Serial.println(0);
  Serial.println("Program loaded.");
  Serial.println("Press button to start.");
  runMotors(0,0);  // check motors are stopped
   runMotors(0,0);  //stop motors
 do {
    toggleLED(GRN);         //motors stopped, Green LED flashing
  } while(digitalRead(BUTTON_B)== HIGH);
  
  sensor1 = map(analogRead(SHARP1),0,1023,0,5000); // initialize sensor
  sensor2 = map(analogRead(SHARP2),0,1023,0,5000); // initialize sensor
  Serial.println("Program Running. Press bumper to stop");
  flag=0;
}
// Main Loop
void loop() {

do{
  sensor2 = map(analogRead(SHARP2),0,1023,0,5000); // initialize sensor
  if(flag==0){
    turnOnLED(YLW);
    digitalRead(BUMPER);
    followWall(SHARP1,SHARP2);
    sensor1 = map(analogRead(SHARP1),0,1023,0,5000); // initialize sensor
    sensor2 = map(analogRead(SHARP2),0,1023,0,5000); // initialize sensor
    if (sensor2>900){
      flag++;
    }
  }
  else if (flag==1){
    turnOnLED(RED);
      seeWall(SHARP2);
    } else if ((flag ==2)&&(digitalRead(BUMPER)==LOW)){
    turnOnLED(YLW);
    followWall(SHARP1,SHARP2);
    sensor1 = map(analogRead(SHARP1),0,1023,0,5000); // initialize sensor
    sensor2 = map(analogRead(SHARP2),0,1023,0,5000); // initialize sensor
    if (sensor1<800){
        flag++; //stop the do/while loop
    }
    }
    else if(flag ==3){
      digitalRead(BUMPER);
      flashAllLEDs();
      runMotors(delta,delta);
      delay(1500);
      runMotors(0,0);
      delay(2000);
      flag++;
    }

    else if(flag==4){
      digitalRead(BUMPER);
     int jj=0;
     result = analogRead(LIGHT);                //read the value of the photoresistor
     mvresult = map(result, 0, 1024, 0, 5000);   //convert value to millivolts  
      findBearing(LIGHT); //orients LynxBot in direction of light source
      turnOnLED(RED);
      runMotors(delta,delta);
      delay(500);
      digitalRead(BUMPER);
       for(jj=0; jj<200; jj++){ 
        digitalRead(BUMPER);
        turnOnLED(GRN);
        runMotors(delta,delta);
      sensor2 = map(analogRead(SHARP2),0,1023,0,5000); // initialize sensor
     result = analogRead(LIGHT);                //read the value of the photoresistor
     mvresult = map(result, 0, 1024, 0, 5000);   //convert value to millivolts  
      Serial.println(sensor2);
   //   if((sensor2>300)&&(mvresult>2000)){
      if((sensor2>350)){
        digitalRead(BUMPER);
        turnOnLED(YLW);
        runMotors(0,0);
        delay(500);
        findBearing(LIGHT); //orients LynxBot in direction of light source
        jj=200;  
        flag=5;
      }
      delay (40);
      digitalRead(BUMPER);
      Serial.println(sensor2);
      }
    }
else if(flag==5){
  digitalRead(BUMPER);
     for(kk=0; kk<100; kk++){ 
      digitalRead(BUMPER);
        turnOnLED(RED);
        runMotors(delta,delta);
      sensor2 = map(analogRead(SHARP2),0,1023,0,5000); // initialize sensor
      Serial.println(sensor2);
      if(sensor2>400){
        digitalRead(BUMPER);
        flashAllLEDs();
        runMotors(0,0);
        delay(2000);
        flag=6;
        kk=100;  
      }
      delay (41);
      digitalRead(BUMPER);
      Serial.println(sensor2);
      }
    }

    else if (flag==6){
      turnOnLED(GRN);
      runMotors(delta,-delta);
      delay(time180);      
      runMotors(0,0);
      delay(500);
      runMotors(-delta, -delta);
      delay(700);
      runMotors(0,0);       
      flag++;
    }
    else if (digitalRead(BUMPER)==HIGH){
      runMotors(0,0);
      break;
    }
}while(digitalRead(BUMPER)==LOW); 
runMotors(0,0);
delay(500);
    while(1){                    // loop forever
      flashAllLEDs();
    }
}  




//********** FUNCTIONS (subroutines) **************


//Turn on a single LED, and all other off
void turnOnLED(int COLOUR){
  digitalWrite(GRN, LOW);
  digitalWrite(YLW, LOW);
  digitalWrite(RED, LOW); 
  digitalWrite(COLOUR, HIGH);
}

//Toggle an LED on/off
void toggleLED(int colour){
  digitalWrite(colour, HIGH);
  delay(125);
  digitalWrite(colour, LOW);
  delay(125); 
}

void findBearing(int light){
  maxVal=0;
  maxValLoc=0;
  // 2s quarter sweep CCW of 90 deg
 Serial.println("PreFindBearing running.");
    for(jj=0;jj <=98; jj++){                                                  /////Tune
      result = analogRead(LIGHT);                //read the value of the photoresistor
      mvresult = map(result, 0, 1024, 0, 5000);   //convert value to millivolts  
      runMotors(0.95*delta, -0.95*delta); //CCW 90 deg   
     Serial.println("CCW Sweep '\n'");
     //Serial.println(mvresult);
        if (maxVal < mvresult) {
           maxVal =  mvresult;
           maxValLoc = jj;
      }
      delay(41);
    }
  //Serial.println(maxVal);
  //Serial.println(maxValLoc);
  runMotors(0,0);
  delay(1000);
  
for(jj=0;jj<98;jj++){
      runMotors(0.95*delta,-0.95*delta);
     result = analogRead(LIGHT);                //read the value of the photoresistor
      mvresult = map(result, 0, 1024, 0, 5000);   //convert value to millivolts       
      if ((mvresult < maxVal+50)&&(mvresult > maxVal-50)){
        runMotors(0,0);
        delay(500);
        jj=98;
      }
      delay(41);
  }
  //turnOnLED(GRN);

   }

   void runMotors(int delta_L, int delta_R){
  int pulse_L = (STOP_SPEED + delta_L)*10;    //length of pulse in msec
  int pulse_R = (STOP_SPEED + delta_R)*10;
  
  for(int i=0; i<3; i++){
    pulseOut(MOTOR_L, pulse_L);    //send pulse to left motors
    pulseOut(MOTOR_R, pulse_R);    //send pulse to right motors
  }
   }

void pulseOut(int motor, int pulsewidth){
  digitalWrite(motor, HIGH);         
  delayMicroseconds(pulsewidth);  //send pulse of desired pulsewidth      
  digitalWrite(motor, LOW);
}


//flash all LEDs
void flashAllLEDs(){
  digitalWrite(GRN, LOW);
  digitalWrite(YLW, LOW);
  digitalWrite(RED, LOW);
  delay(250);
  digitalWrite(GRN, HIGH);
  digitalWrite(YLW, HIGH);
  digitalWrite(RED, HIGH);
  delay(250);
}

void followWall(int sharp1, int sharp2){
  if(digitalRead(BUMPER)==LOW){
  sensor1 = map(analogRead(sharp1),0,1023,0,5000); 
  sensor2 = map(analogRead(sharp2),0,1023,0,5000);
  int error1 = WALL - sensor1;
  int dummy = min(abs(error1)*KP, 100);
  int deltaV = delta*(100-dummy)/100;
  
    if(error1>0+HYS1){
  //  turnOnLED(YLW);
    runMotors(deltaV,delta);
  } else if (error1<0-HYS1){
  //  turnOnLED(RED);
    runMotors(delta,deltaV);
  } else{
  //  turnOnLED(GRN);
    runMotors(delta,delta);
    }
  }else{
    runMotors(0,0);
  }
}

void seeWall(int sharp2){
  sensor2 = map(analogRead(sharp2),0,1023,0,5000); 
//  if((sensor2<insideWall+HYS2)&&(sensor2>insideWall-HYS2)){
  if(sensor2>insideWall-HYS2){
//    turnOnLED(RED);
    runMotors(0,0);
    delay(100);
    runMotors(delta,-delta);
    delay(time90);
      flag++; //go to seeWall
  }
  else{
//  turnOnLED(GRN);
  runMotors(0.5*delta,0.5*delta);
  }
}
