% Using the Darcy-Brinkman equations to simulate airflow through
% porous zeolite media. The zeolite cylinders in ventilator extract N2 from 
% ambient air, leaving behind a gas with extremely high O2 content. This 
% air can then be used as an alternative oxygen supply for this COVID-19 
% medical ventilator. The analysis below will eventually provide a 
% mathematical model upon which CFD simulation can be performed.

%% Assumptions

% STP assumed for all initial conditions
% Air is a binary ideal gas of 79% N2, 21% O2
% Uniform bed voidage, particle diameter
% Isothermal at 298 K
% Effects of gravity are negligible


%% Constants

% Subscript notation: i = O2, j = N2
% Assume air and all of its components are incompressible
% Assume STP for all initial conditions

% Air properties
rho_air = 1.184; % density[kg/m3]
rho_O2 = 1.186; % [kg/m3]
rho_N2 = 1.039; % [kg/m3]

mu_air = 1.84e-5; % dynamic viscosity [Pa*s]
T = 298; % ambient assumed as room temp. [K]
R = 8.31; % ideal gas constant [J/(K*mol)]

% Gauge pressure
p = 1.79; % "p0" in COMSOL; inflow gauge pressure [barg]

% Particle packing properties
d_zeo = 0.002; % avg. Zeolite 13X sphere particle diameter, assumed [m]
ec = 0.36; % approx. column voidage for dense, random packing [-]
ep = 0.35; % approx. particle voidage [-]
rho_zeo = 790; % zeolite bulk density [kg/m3]

% Molar mass [kg/mol]
M_i = 31.99e-3;
M_j = 28.01e-3;

% Collision diameter [m]
sigma_i = 6.06e-10;
sigma_j = 3.67e-10;

% Characteristic energy [K]
% e_char_O2 = e_O2/kb_O2, where e_O2 = energy [J] and kb_O2 = Boltzman's constant [J/K]
e_char_i = 113;
e_char_j = 99.8;

% Dimensionless Henry's Law constant [-]
henry_i = 3.2e-2;
henry_j = 1.5e-2;

% Pore tortuosity [-]
taup = 3;

% Volume fraction [-]
w_i = 0.21; % fraction of O2 in ambient air
w_j = 0.79; % fraction of N2 in ambient air

% Maximum surface excess [mol/kg]
% Called qe_i in the report
qmax_i = 6.06; % [mol/kg]
qmax_j = 3.42; % [mol/kg]

% Adsorption constant [1/bar]
b_i = 0.02;
b_j = 0.09;

% Adsorbed gas concentration  [mol/kg]
q_i1 = 0.02564; % initial O2
q_j1 = 0.3172; % initial N2


%% Permeability

% Blake Kozeny Equation [m2], "Nanosize" Eq. 3
K_perm = ((d_zeo^2)/150)*(ec/(1-ec))^2; 

%% Mass Source Term

% We need to solve: Qbr = -(k_i*M_i*(c_i-c_pi) + k_j*M_j*(c_j-c_pj))
% where: ep*(dcpi_dt) + rho_zeo*(dqi_dt) = (k_i*M_i*(c_i-c_pi))

% Average collision diameter [m], "Nanosize" Eq. 7
sigma_ij = (sigma_i + sigma_j)/2;

% Standardized temperature [-], "Nanosize" Eq. 9
Tn = T/(((e_char_i)^(1/2))*((e_char_j)^(1/2)));

% Collision integral [-], "Nanosize" Eq. 8
SIGMA_d = (1.060/(Tn^0.156)) + (0.193/exp(Tn*0.476)) + (1.036/exp(Tn*1.530)) + (1.765/exp(Tn*3.894));

% Chapman-Enskog Equation [m2/s], "Nanosize" Eq. 6
% Molecular gas diffusivity of gases into zeolite pore area
D_ij = (5.953e-24/(p*sigma_ij^2*SIGMA_d))*(T^3/M_i+T^3/M_j)^(1/2);

% Macropore mass transfer rate into zeolite [1/s], "Nanosize" Eq. 5
k_i = 60*D_ij/(henry_i*d_zeo^2);
k_j = 60*D_ij/(henry_j*d_zeo^2);


% Effective Knudsen diffusivity [m2/s], "Nanosize" Eq. 19
Dek_i = (d_zeo/3)*(8*R*T/(pi()*(M_i)))^(1/2); % O2
Dek_j = (d_zeo/3)*(8*R*T/(pi()*(M_j)))^(1/2); % N2

% Effective intra-particle diffusivity [m2/s], "Nanosize" Eq. 18
De_i = (ep/taup)*(1/(1/Dek_i + 1/D_ij)); % O2
De_j = (ep/taup)*(1/(1/Dek_j + 1/D_ij)); % N2

% Micropore mass transfer rate [1/s], "Nanosize" Eq. 17
kp_i = 60*De_i/(henry_i*d_zeo^2); % O2
kp_j = 60*De_j/(henry_j*d_zeo^2); % O2

% Equilibrium adsorption concentration [mol/kg], "Nanosize" Eq. 15
% See note below about n_i, n_j
qstar_i = qmax_i*((b_i*p*w_i)^(1/n_i)); % O2
qstar_j = qmax_j*((b_j*p*w_j)^(1/n_j)); % N2

% Rate of change of adsorption to zeolite, "Nanosize" Eq. 14
% Can likely generalize as a proper DE once other components of Qbr are found
dqi_dt = kp_i*(qstar_i-q_i1); % only valid at initial condition q_i = q_i1
dqj_dt = kp_j*(qstar_j-q_j1); % only valid at initial condition q_j = q_j1

% Gas concentration [mol/m3]
% c_O2 =
% c_N2 = 

% Particle concentration [mol/m3]
% cp_O2 =
% cp_N2 =

% % Notes and next steps:
%
% 1) n_i and n_j in Eq. 15 (see above) are currently undefined. I'm not
% sure what the n-values are supposed to represent
%
% 2) Need to find out how to calculate dcpi_dt. However, this would be 
% unnecessary if we find ci and cpi (see "Nanosize" Eq. 13). While I 
% looked at the "Bilinear Dispersion" paper, I'm not sure if setting 
% <Cp> = <Cs> would be correct in our situation, as our simulation begins 
% at initial conditions and not equilibrium.
% 
% 3) I don't understand how to work with Eq. 10, 11 in the "Nanosize" paper


%% Ignore everything past this point (Junk/Unfinished Work)

% % Mass of gas in cylinder
% l_cyl = 0.15; % [m]
% d_cyl = 0.035; % [m]
% vol_cyl = pi()*d_cyl^2*l_cyl/4; % [m3]
% m_o = rho_O2/vol_cyl; % [kg]
% m_j = rho_N2/vol_cyl; % [kg]

% Ergun equation
% z is coordinate axis of gas flow [m]
% dP_dz = (150*mu_air/(d_zeo^2))*((1-ec)^2/(ec^2))*u + (1.75*rho_air/d_zeo)*((1-ec)/(ec^3))*u*abs(u);

% Input flow rate (F) [l/min]
% dP_dz = (150*mu_air/(d_zeo^2))*((1-ec)^2/(ec^2))*u + (1.75*rho_air/d_zeo)*((1-ec)/(ec^3))*u*abs(u);

% % Volume force in z-direction
% d_cyl = 0.035; % [m]
% A = (1/4)*pi()*d_cyl^2;
% Fz = p/A;
% 
% disp(rho_air);
% disp(mu_air);
% disp(K_perm);
% disp(Fz);5

% Qbr = rho_air*(dec_dt + du_dz)
% (rho_air/ec)*(du_dt+(du_dz)*(u/ec)) = -dP_dz + d_dz((1/ec)*(mu_air(2(du_dz)-(mu_air*2/3)(du_dz)))) - (mu_air/k + Qbr/(ec^2))*u
