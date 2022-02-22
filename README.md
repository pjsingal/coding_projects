# Coding Projects
This repository contains select examples of coding projects written in Arduino, MATLAB, Python, R, and Svelte. All works were created by Patrick Singal unless otherwise noted.

## Arduino
### 1. "LynxBot_Reacts_to_Environment"
LynxBots are small, motorized vehicles that are operated by on-board microcontrollers. We reconfigured the circuitry and added sensors to allow the LynxBot to efficiently navigate an obstacle course by sensing light and distance, and controlling angles of rotation.

This program was co-created with my partner Riley Doyle. Here, the LynxBot follows a wall, turns a corner, follows another wall, and then stops before colliding head-on into a third wall. The LynxBot then turns 90deg, follows that third wall, and stops after passing ~1m beyond that wall's end. The LynxBot orients itself in the direction 
of maximum light (a lamp), drives forward, and then stops to reorient itself ~1m away from the light source. Finally, the LynxBot approaches the 
light, turns 180º, and then reverses to block it (a cardboad "blocker" has been fixed to the LynxBot's rear).

### 2. "Rival Lab Radio-Enabled ICP Pressure Transducer [In Progress]"
I am a researcher in Queen's University's Rival Lab, which focuses on experimental fluid dynamics. We have been running towing tank experiments on airfoils across a range of boundary conditions to collect data for training a predictive algorithm for sparse pressure data in gusty, turbulent flows. However, these data acquisition efforts have been hampered by noisy and high-error pressure readings. The current pressure transducers are located above the towing tank and connected to channels embedded within the airfoil by tubing. To solve this issue, I am programming, assembling, and validating a new high-precision, long-range wireless sensor network. This setup will eliminate the need for tubing altogether by embedding the pressure transducers directly within the airfoil and transmitting data wirelessly to the DAQ. The programs shown below are very much works in progress. I am currently reworking their C++ reference libraries to eliminate redundancies and improve processing speed.

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
Computes and plots the position, velocity, and acceleration of a Mars Rover robotic arm that was designed for a project in MECH 328: Dynamics and Vibrations.

### 4. "VerticalFarm_SupplyPumpSizing"
Models a simplified version of the Queen's Vertical Farming Team's pressurized supply line to determine the pump performance characteristics that will achieve the flow and pressure conditions required by the micro-droplet sprinkler nozzles in the plant growth zone. 

## Python
### 1. "Thermal-Management-Analysis-Capstone"
I developed this program during the early analysis stage of my group's capstone project. It takes tabular data related to the temperature and heat-generation rates of batteries inside an electric vehicle under different loading scenarios, and interprets it in the context of a simplified thermal management system (TMS). It then applies several thermodynamic assumptions to determine the chiller size that would induce optimal thermoregulation. While they reduced the complexity of calculation significantly, future analyses must remove certain thermodynamic assumptions that are unphysical. This simplified TMS considered here consists of a basic coolant loop passing through batteries, a chiller, and a pump. It neglects other complexities and heat-generating components such as bypass branches, flow dividers, the motor, heater, DCDC converter, traction inverter, and air compressor.

Please visit psingal.ca/projects to view our group's full (unsimplified) TMS design, and a more detailed description of its thermodynamics. A detailed Simulink model has also been created to represent this system (cannot be provided due to client confidentiality reasons). By April 2022, the aforementioned Python script will be updated to consider the full TMS (as opposed to just the "basic" loop) and its scope will be adjusted. Its mathematically derived results will then serve as a benchmark against which Simulink simulation outputs can be compared.

### 2. "Insult Generator"
This program allows a user to randomly generate a desired number of insulting Shakespearean phrases. The desired number must be between 100 and 10,000 phrases (inclusive). All phrases take the form of "Thou [adjective] [adjective] [noun]!".

### 3. "Mortgage Payments"
This program allows a user to compute various metrics related to their mortgage. The user enters the principal amount borrowed, annual % interest rate, and term length, and then decides whether they would like to account for lump-sum anniversary payments as well. The output displays the remaining principal to-be-paid on a month-by-month basis, which declines from the principal amount borrowed in month 0 until it reaches $0.00 in month X. If anniversaries are NOT selected, then month X will coincide with the term length provided by the user. If anniversaries ARE selected, then month X will be reached before the term ends, and the user will be notified as to how many months early they have managed to pay their mortgage. The cumulative total interest, monthly payments, anniversary payments (if selected), and total mortgage cost will be printed as well. 

### 4. "Numerical Methods Final Exam"
rgdfgdf

### 5. "Speech Analysis"
This program analyzes three speeches: "PMHarperBerlinWall.txt", "PresObamaBerlinSpeech.txt", and "PresObamaInauguralAddress.txt". The program determines the longest word, ten most frequent words, and the number of characters (inc. spaces), words, unique words and sentences in each speech. Numerals are excluded from analysis but spelled-out numbers are still included. A full summary (ordered alphabetically) of the number of times each unique word is used in a speech is also saved as an independent .txt file. The most used word over 5 letters in length that occurs in all three speeches: people

### 6. "Truss Energy Optimizer"
 Determines the material properties of elastonium, given length and stress/strain data for a random sample of 42 nominally equivalent rods. Plots the idealized structure of a 2D truss bridge composed entirely of elastonium. Plots the deformation of the structure under loading, which is the configuration at which truss energy is minimized. Determines the maximum loading that the structure can withstand before failure. Comments on the efficacy of elastonium as a material for bridges and other heavy structural applications.

### 7. "Weather Stats"
This program analyzes Toronto monthly weather data between the years 1938 and 2018 (inclusive). The user is prompted to enter a valid month/year. The program will return the amount of rainfall [mm] that occurred in that month. The program identifies the highest/lowest temperature, rainfall, and snowfall that occurred in any single month, and the month in which that occurred. The program also displays the lowest/median/highest annual snowfall, and the year in which that occurred. It also displays the lowest/median/highest mean temperature that ooccurred in any single month, and the month in which that occurred. Lastly, the program computes the annual mean temperature for each year (excluding those w/ <12 months of data), and saves the results to a text file ("YearMeans.txt").

## R
An assortment of weekly quizzes and problem sets completed as part of an introductory statistics course.

## psingal[dot]ca
This website was coded entirely manually using the Svelte component framework, which involves HTML, CSS, and JavaScript. Much of the documentation and general structure can be credited to my friend Ross Hill, who developed qvft.ca, the website from which mine takes much inspiration.