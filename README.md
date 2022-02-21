# coding_projects
This repository contains select examples of coding projects written in Python, MATLAB, Arduino language, and R. The website, "psingal.ca", however, was developed using the Svelte component framework and involved HTML, CSS, and JavaScript. 

## Arduino
### 1. "LynxBot_Reacts_to_Environment"
LynxBots are small, motorized vehicles that are operated by on-board microcontrollers. We reconfigured the circuitry and added sensors to allow the LynxBot to efficiently navigate an obstacle course by sensing light, distance, and angles of rotation.

In this program, the LynxBot follows a wall, turns a corner, follows another wall, and then stops before colliding head-on into a third wall. The LynxBot then turns 90deg, follows that third wall, and stops after passing ~1m beyond that wall's end. The LynxBot orients itself in the direction 
of maximum light (a lamp), drives forward, and then stops to reorient itself ~1m away from the light source. Finally, the LynxBot approaches the 
light, turns 180º, and then reverses to block it (a cardboad "blocker" has been fixed to the LynxBot's rear).

### 2. "Rival Lab Radio-Enabled ICP Pressure Transducer"
I am a researcher in Queen's University's Rival Lab, which focuses on experimental fluid dynamics. We have been running towing tank experiments on airfoils across a range of boundary conditions to collect edata for training a predictive alforithm for sparse pressure data in gusty, turbulent flows.  

However, these data acquisition efforts have been hampered by noisy and high-error pressure readings. The current pressure transducers are located above the towing tank and connected to channels embedded within the airfoil by tubing. 

To solve this issue, I am programming, assembling, and validating a new high-precision, long-range wireless sensor network. This setup will eliminate the need for tubing altogether by embedding the pressure transducers directly within the airfoil and transmitting data wirelessly to the DAQ.

The programs shown below are very much works in progress. I am currently reworking their C++ reference libraries to eliminate redundancies and improve processing speed.

#### 2a. "ICP_LoRa_Client" [In Progress]
The client microcontroller receives and reconstructs data packets that have been transmitted by the server. Despite the name, the client is attached to a long-range (LoRa) radio breakout board but not an ICP pressure sensor. This component will be located outside of the towing tank and wired directly into the lab computer. 

#### 2b. "ICP_LoRa_Server" [In Progress]
The server microcontroller collects pressure data via an ICP sensor and transmits them as 8-bit packets to the client via an attached LoRa breakout board. The server has a waterproof casing and is embedded directly within the submerged airfoil.  