%% 1. Setup

close all

T = 2^0.5/2/0.042 + 0.6/0.042; % total period of the scan cycle

resolution = 10;                    % number of data increments per second
wAB = 0.2019/resolution;            % number of radians per increment
n = 100;                                % size of arrays
time = linspace(0,n,n*resolution); % time array with dt
theta = zeros(1,length(time));
theta(1,1) = 135*pi/180;

k = 2;
while k<= length(time)
    theta(1,k) = theta(1,k-1)+wAB;
    k = k+1;
end

theta1 = wrapTo2Pi(theta); % Constrains theta within the range [0, 2pi]

%% 2. Computing Beta, Velocity, and Acceleration given P(theta) w/ Syms

syms theta

lengthAB = 0.3329;
lengthBC = 0.7247;
beta = acos(0.45-lengthAB*cos(theta)/lengthBC);
r = -lengthAB*sin(theta)+lengthBC*sin(beta); % Derived by hand
vd = diff(r);
ad = diff(vd);

%% 3. Using the Sec. 2 Output to Generate Time-Synchronized Arrays

lengthAB = 0.3329;
lengthBC = 0.7247;

beta = zeros(1,length(time));
r = zeros(1,length(time));
vd = zeros(1,length(time));
ad = zeros(1,length(time));
j = 1;

while j <= length(time)
    beta(1,j) = acos(9/20 - (3329*cos(theta1(1,j)))/7247);
    r(1,j) = -lengthAB*sin(theta1(1,j))+lengthBC*sin(beta(1,j));
    vd(1,j) = (3329*sin(theta1(1,j))*((3329*cos(theta1(1,j)))/...
        7247 - 9/20))/(10000*(1 - ((3329*cos(theta1(1,j)))/7247 - ...
        9/20)^2)^(1/2)) - (3329*cos(theta1(1,j)))/10000;
    ad(1,j) = (3329*sin(theta1(1,j)))/10000 - (11082241*...
        sin(theta1(1,j))^2)/(72470000*(1 - ((3329*cos(theta1(1,j)))...
        /7247 - 9/20)^2)^(1/2)) - (11082241*sin(theta1(1,j))^2*...
        ((3329*cos(theta1(1,j)))/7247 - 9/20)^2)/(72470000*(1 - ...
        ((3329*cos(theta1(1,j)))/7247 - 9/20)^2)^(3/2)) + (3329*...
        cos(theta1(1,j))*((3329*cos(theta1(1,j)))/7247 - 9/20))/...
        (10000*(1 - ((3329*cos(theta1(1,j)))/7247 - 9/20)^2)^(1/2));
    j = j+1;
end

%% 4. Identifying Key Points on Plots

state1 = T; % x-coordinate of state 1 in first period
% y-coordinates of state 1 in first period
rstate1 = 0.2231;
vdstate1 = -0.0543;
adstate1 = 0.2188524;

state2 = 13.2; % x-coordinate of state 2 in first period
% y-coordinates of state 2 in first period
rstate2 = 1.006 ;
vdstate2 = 0;
adstate2 = -0.5123;

startscan = state2;
endscan = state2+2^0.5/2/0.042;

%% 5. Generating Plots

% Position
subplot(3,1,1)
plot(time,r,'HandleVisibility','off')
title("Profilometer Position (2.5 Periods)")
xlabel("Time (s)")
ylabel("Position (m)")
xlim([0,2.5*T])
ylim([-0.8,1.2])
yy = ylim;
line([(startscan),(startscan)],yy,'Color',[0.4660 0.6740 0.1880],...
    'LineStyle','--')
line([(endscan),(endscan)],yy,'Color',[0.6350 0.0780 0.1840],...
    'LineStyle','-.')
line([(startscan+T),(startscan+T)],yy,'Color',[0.4660 0.6740 0.1880],...
    'LineStyle','--','HandleVisibility','off')
line([(endscan+T),(endscan+T)],yy,'Color',[0.6350 0.0780 0.1840],...
    'LineStyle','-.','HandleVisibility','off')
hold on
scatter(state1,rstate1,'b')
text(state1+0.2, rstate1-0.2, num2str(rstate1,'%.3f'), 'Fontsize', 7);
hold on
scatter(state1+T,rstate1, 'b','HandleVisibility','off')
hold on
scatter(state2,rstate2,'r')
text(state2+0.9, rstate2, num2str(rstate2,'%.3f'), 'Fontsize', 7);
hold on
scatter(state2+T,rstate2,'r','HandleVisibility','off')
hold on
legend([{'Start of Scan'},{'End of Scan'},{'State 1'},{'State 2'}])

% Velocity
subplot(3,1,2)
plot(time,vd)
title("Profilometer Velocity (2.5 Periods)")
xlabel("Time (s)")
ylabel("Velocity (m/s)")
xlim([0,2.5*T])
ylim([-0.8,1.2])
hold on
yy = ylim;
line([(startscan),(startscan)],yy,'Color',[0.4660 0.6740 0.1880],...
    'LineStyle','--','HandleVisibility','off')
line([(endscan),(endscan)],yy,'Color',[0.6350 0.0780 0.1840],...
    'LineStyle','-.','HandleVisibility','off')
line([(startscan+T),(startscan+T)],yy,'Color',[0.4660 0.6740 0.1880],...
    'LineStyle','--','HandleVisibility','off')
line([(endscan+T),(endscan+T)],yy,'Color',[0.6350 0.0780 0.1840],...
    'LineStyle','-.','HandleVisibility','off')
hold on
scatter(state1,vdstate1,'b')
text(state1+0.2, vdstate1-0.2, num2str(vdstate1,'%.3f'), 'Fontsize', 7);
hold on
scatter(state1+T,vdstate1, 'b','HandleVisibility','off')
hold on
scatter(state2,vdstate2,'r')
text(state2+0.9, vdstate2, num2str(vdstate2,'%.3f'), 'Fontsize', 7);
hold on
scatter(state2+T,vdstate2,'r','HandleVisibility','off')
hold on

% Acceleration
subplot(3,1,3)
plot(time,ad)
title("Profilometer Acceleration (2.5 Periods)")
xlabel("Time (s)")
ylabel("Acceleration (m/s^2)")
xlim([0,2.5*T])
ylim([-0.8,1.2])
yy = ylim;
line([(startscan),(startscan)],yy,'Color',[0.4660 0.6740 0.1880],...
    'LineStyle','--','HandleVisibility','off')
line([(endscan),(endscan)],yy,'Color',[0.6350 0.0780 0.1840],...
    'LineStyle','-.','HandleVisibility','off')
line([(startscan+T),(startscan+T)],yy,'Color',[0.4660 0.6740 0.1880],...
    'LineStyle','--','HandleVisibility','off')
line([(endscan+T),(endscan+T)],yy,'Color',[0.6350 0.0780 0.1840],...
    'LineStyle','-.','HandleVisibility','off')
hold on
scatter(state1,adstate1,'b')
text(state1+0.2, adstate1-0.2, num2str(adstate1,'%.3f'), 'Fontsize', 7);
hold on
scatter(state1+T,adstate1, 'b','HandleVisibility','off')
hold on
scatter(state2,adstate2,'r')
text(state2+0.9, adstate2, {num2str(adstate2,'%.3f')}, 'Fontsize', 7);
hold on
scatter(state2+T,adstate2,'r','HandleVisibility','off')
hold on
