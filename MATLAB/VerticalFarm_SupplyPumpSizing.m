% Supply Line Flow Rate Calculations

% Constants
g = 9.81; % [m/s^2] acc. of gravity 
rho = 997; % [kg/m^3] water density @ room temp. 
P1 = 0; % [Pa] gauge pressure inside mixing tank @ point 1

mu = 0.0009; % [add units] dynamic visc. of water at room temp

% Part 1. ADJUSTABLE PARAMETERS
n_sprinklers = 40; % from CAD, arbitrarily chosen
L = (21+21+9+15+3+18+6+6+3+3)/39.3701; % [m] Pipe length from point 1 to 2
Z1 = 0.5; % [m] fluid height within mixing tank; this value was guessed 
Z2 = 0.63; % [m] height of point 2 based on CAD model; needs an update?
    % Z2 = Z3 always
e = 0.0045e-3; % [m] surface roughness of wrought iron (note: "e-3" means "x10^-3")
D = (60.3-2*3.91)*10^-3; % [m] inner diam. of nominal 2" (50mm) pipe
D = 0.051;
A = pi/4*(D^2); % [m2]
K_elbow_90deg = 0.75;
K_check_valve = 2;
K_tee_joint = 1; % guessed, need more info
K_threeway = 1; % guessed, need more info
K_l = K_elbow_90deg*2 + K_check_valve*2 + K_tee_joint + K_threeway*1;
K_l = 10;
% ^ Minor loss coefficient (K_l):

%% Part 1. Analyze between Point 2 and Point 3

% 1. Determine P, Q at sprinkler line based on other datasheet specs provided
Psprinkler = 50e3; % [Pa] sprinkler discharge pressure from datasheet
Dsprinkler = 0.36e-3; % [m] diameter of sprinkler orifice from datasheet
Asprinkler = pi/4*(Dsprinkler^2); % [m2] sprinkler orifice area
Qsprinkler = 13/3600/1000; % [m3/s] converted from L/hour rating on datasheet
% ^ flow rate per ONE sprinkler
Q2 = Qsprinkler*n_sprinklers; % Total flow rate out of system
V2 = Q2/A;
P2 = Psprinkler; % Assuming constant pressure throughout sprinkler line

% 2. Calculate pump head needed via Bernoulli from point 1 to 2
Re2 = rho*V2*D/mu; % [-] Reynolds # @ pt 2, used to approx. fric. factor
f = (1/(-2*log10((e/D)/3.7-2.51/Re2*...
    (1.8*log10(((e/D)/3.7)^1.11+6.9/Re2)))))^2;
hpump = P2/(rho*g) + Z2 - Z1 + V2^2/(2*g)*(1+K_l+f*L/D); % [m]

% 3. So far our calcs have assumed that the sprinklers are always on.
% How about when they're off? Flow rate would be 0. So let's simulate
% the system performance between these two boundary conditions.

Qactual = linspace(0,Q2);
hsys = P2/(rho*g) + Z2 - Z1 + (1+K_l+f*L/D)*(8/(pi^2*D^4*g)).*Qactual.^2;
close all
subplot(2,2,1)
plot(Qactual*3600000/60, hsys);    
hold on
xlab = xlabel('Flow Rate [L/min]');
ylab = ylabel('System Head [m]');
title('Supply Pump Performance Curve (Metric)')
subplot(2,2,2)
plot(Qactual*15850.323141, hsys*3.28084);
hold on
xlab = xlabel('Flow Rate [GPM]');
ylab = ylabel('System Head [ft]');
title('Supply Pump Performance Curve (Imperial)')
subplot(2,2,3)
plot(Qactual*3600, hsys);
hold on
xlab = xlabel('Flow Rate [m3/h]');
ylab = ylabel('System Head [m]');
title('Supply Pump Performance Curve (Metric)')


% 5. Prevent Cavitation in Pump
% Net-Positive Suction Head (NPSH) available @ Pump
Patm = 101325; %[Pa] Suction line pressure (assume equal to P @ point 1)
Pvapour = 2338.8; % [Pa] pressure at which water becomes vapour @ 20degC
Lsuction = 6/39.3701;
Zpump = 0; %[m]
K_l_suction = K_check_valve*1;
hfpump = V2^2/(2*g)*(f*Lsuction/D); % roughly assume Vsuction is same as V2
hmpump = V2^2/(2*g)*K_l_suction;
NPSH_avail = (Patm - Pvapour)/(rho*g)+Z1-Zpump - V2^2/(2*g) - hfpump - hmpump; % [m]

% 6. DESIGN CONSTRAINT: NPSH_avail must be > NPSH_required
% NPSH_required is obtained from manufacturer's datasheet
% We still need to figure this part out
close all