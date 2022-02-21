# Coding Project
This repository contains select examples of coding projects written in Python, MATLAB, Arduino language, and R. The website, "psingal.ca", however, was developed using the Svelte component framework and involved HTML, CSS, and JavaScript. All works were created solely by Patrick Singal unless otherwise noted.

## Arduino
### 1. "LynxBot_Reacts_to_Environment"
LynxBots are small, motorized vehicles that are operated by on-board microcontrollers. We reconfigured the circuitry and added sensors to allow the LynxBot to efficiently navigate an obstacle course by sensing light, distance, and angles of rotation.

In this program, the LynxBot follows a wall, turns a corner, follows another wall, and then stops before colliding head-on into a third wall. The LynxBot then turns 90deg, follows that third wall, and stops after passing ~1m beyond that wall's end. The LynxBot orients itself in the direction 
of maximum light (a lamp), drives forward, and then stops to reorient itself ~1m away from the light source. Finally, the LynxBot approaches the 
light, turns 180º, and then reverses to block it (a cardboad "blocker" has been fixed to the LynxBot's rear).

### 2. "Rival Lab Radio-Enabled ICP Pressure Transducer [In Progress]"
I am a researcher in Queen's University's Rival Lab, which focuses on experimental fluid dynamics. We have been running towing tank experiments on airfoils across a range of boundary conditions to collect edata for training a predictive algorithm for sparse pressure data in gusty, turbulent flows. However, these data acquisition efforts have been hampered by noisy and high-error pressure readings. The current pressure transducers are located above the towing tank and connected to channels embedded within the airfoil by tubing. To solve this issue, I am programming, assembling, and validating a new high-precision, long-range wireless sensor network. This setup will eliminate the need for tubing altogether by embedding the pressure transducers directly within the airfoil and transmitting data wirelessly to the DAQ. The programs shown below are very much works in progress. I am currently reworking their C++ reference libraries to eliminate redundancies and improve processing speed.

##### 2a. "ICP_LoRa_Client" 
The client microcontroller receives and reconstructs data packets that have been transmitted by the server. Despite the name, the client is attached to a long-range (LoRa) radio breakout board but not an ICP pressure sensor. This component will be located outside of the towing tank and wired directly into the lab computer. 

##### 2b. "ICP_LoRa_Server" 
The server microcontroller collects pressure data via an ICP sensor and transmits them as 8-bit packets to the client via an attached LoRa breakout board. The server has a waterproof casing and is embedded directly within the submerged airfoil.

## MATLAB
### 1. "BrinkmanEquations_CodeLifeVentilatorChallenge"
In March 2020, I collaborated with a team of professional engineers to develop the "AirMax DMV", a low-cost, oxygen-generating mechanical ventilator intended to address shortages caused by COVID-19 in developing countries. Our design ranked in the top 65 of 1,029 international submissions at the Code Life Ventilator Challenge. This ventilator design was unique in that it supplemented the oxygen supplied by canisters with that derived from ambient air. This was accomplished by passing ambient air through cylinders of porous zeolite material, which could extract N2 and leave behind a gas of extremely high O2 content.

Preliminary attempts were made to model the rate of zeolite N2 adsorption and compute the resultant O2 concentration. This MATLAB program aimed to derive a mathematical model based on the Darcy-Brinkman equations, which concern flow through porous media. Once the necessary coefficients had been calculated, a CFD simulation of these equations could be conducted. However, this effort never progressed beyond the MATLAB stage due to timeline constraints. 

### 2. "Dr. Baccarat"
Exploring the effect of initial bet and number of rounds played on expected value when employing the Martingale betting strategy for Baccarat. In the Martingale strategy, the player bets a certain initial amount, P. If they win a round, then they bet P again for the next round. If they lose a round, then they bet 2xP in the next round. If they lose again, then they bet 2x2xP in the next round. This doubling strategy continues until a hand has been won. Once they eventually win again, then the player reverts to betting P in the next round. With infinite availability of funds, this strategy would theoretically ensure that a player never experiences a net loss in the long run (because the probability of losing an infinite number of hands in a row is zero). In practice, however, the availability of funds is constrained by whatever amount the player decides is the most that they are willing to risk (their "stopgap").

This program aims to determine whether there exists an optimal initial bet (P) and number of rounds to play (n) at which the probability of losing all n rounds becomes so remote that the player becomes more likely to experience a net gain rather than lose everything (expected value > 0). The analysis also accounts for the fact that a player is only willing to sustain a certain maximum amount of total losses before quitting (stopgap = $1,000). Thus, the maximum number of consecutive rounds that a player could engage in depends on the size of their base (initial) betting amount, P. If P = $1,000 then the potential for short-term payoff is much greater but they would only be able to sustain up to n=1 losses before reaching their stopgap and having to quit. Thus, the odds of them experiencing a net loss is 50%. If P = $1, however, then the potential for short-term payoff is very small but they would need to sustain a huge (and, statistically, nearly impossible) number of consecutive losses before reaching their stopgap. This program intends to discover whether there exists an optimal balance between the revenue-generating benefits of high P and the game-prolonging benefits of low P that maximizes expected value in the medium-to-long term.

### 3. "RoboticArm_Kinematics"
Computes and plots the position, velocity, and acceleration of a Mars Rover robotic arm that was designed for a project in MECH 328.

### 4. "VerticalFarm_SupplyPumpSizing"
Models a simplified version of the Queen's Vertical Farming Team's pressurized supply line to determine the pump performance characteristics that will achieve the flow and pressure conditions required by the micro-droplet sprinkler nozzles in the plant growth zone. 

## Python
