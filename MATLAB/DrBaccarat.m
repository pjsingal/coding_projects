% "Dr. Baccarat"

% Exploring the effect of initial bet and number of rounds played on 
% expected value when employing the Martingale betting strategy for
% Baccarat. In the Martingale strategy, the player bets a certain initial
% amount, P. If they win a round, then they bet P again for the next round.
% If they lose a round, then they bet 2*P in the next round. If they lose
% again, then they bet 2*2*P in the next round. This doubling strategy 
% continues until a hand has been won. Once they eventually win again, 
% then the player reverts to betting P in the next round. With infinite
% availability of funds, this strategy would theoretically ensure that a
% player never experiences a net loss in the long run (because the
% probability of losing an infinite number of hands in a row is zero). 
% In practice, however, the availability of funds is constrained by
% whatever amount the player decides is the most that they are willing to
% risk (their "stopgap").

% This program aims to determine whether there exists an optimal initial 
% bet (P) and number of rounds to play (n) at which the probability 
% of losing all n rounds becomes so remote that the player becomes more 
% likely to experience a net gain rather than lose everything (expected 
% value > 0). The analysis also accounts for the fact that a player is only 
% willing to sustain a certain maximum amount of total losses before quitting
% (stopgap = $1,000). Thus, the maximum number of consecutive rounds that
% a player could engage in depends on the size of their base (initial) 
% betting amount, P. If P = $1,000 then the potential for short-term payoff 
% is much greater but they would only be able to sustain up to n=1 losses 
% before reaching their stopgap and having to quit. Thus, the odds of them
% experiencing a net loss is 50%. If P = $1, however, then the potential for
% short-term payoff is very small but they would need to sustain a huge
% (and, statistically, nearly impossible) number of consecutive losses 
% before reaching their stopgap. This program intends to discover whether
% there exists an optimal balance between the revenue-generating benefits of
% high P and the game-prolonging benefits of low P that maximizes expected
% value in the medium-to-long term.

close all

% Generating matrix of discrete data points
syms n i j

% Define array of potential initial bets (P), in dollars
P = [2.5, 5, 10, 15, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 500, 600];

% Set up quasi-continuous array of x-vals that spans the entire range btwn 
% the lowest and highest possible initial bet (P) [2.5, 600]. This array 
% will serve as the independent variable when plotting splines later on.
step = 0.001;
rangemax = length(P);
xx1 = 0:step:rangemax;

% A single letter (A or B) denotes empty matrix to later store discrete 
% data w.r.t. each index of P (length of P = 16)
A = zeros(length(P) + 1, rangemax); % 17 rows; 16 cols (extra row will contain our independent variables as a "header")
B = zeros(2, rangemax); % 2 rows; 16 cols

% A double letter (AA or BB) denotes empty matrix to later store 
% quasi-continuous data w.r.t. each index of xx1,
AA = zeros(length(P) + 1, length(xx1)); % 17 rows; 16001 cols

j = 1;
stopgap = 1000; % max amount of dollars lost you are willing to sustain before quitting the game
nMaxArray = zeros(1,length(P)); % max # of consecutive rounds lost allowed, based on initial bet P and chosen stopgap
EVArray = zeros(1,length(P));

figure(1) % cum. amount lost (sumLoss) vs. # of consecutive losses (n)
while j <= length(P) % each loop iter considers a different initial bet P_j
    for n=1:rangemax % considers up to 16 consec losses
            f = P(j)*((2^i)- 1); % amount of money lost for i losses in a row (e.g. amount lost if i = 5th loss in a row)
            V = subs(f, i, 1:n); % substitute i with the total range of n consec. losses being considered per iter [1,n], so that f is computed n times for each iter of this "for" loop
            sumLoss = sum(V); % adds all n calculations of f to get total amount lost after a given number of consecutive losses have been sustained. 
            A(1,n)=n; % "header" row contains range of independent variable, num. of consec. losses (n) [1, n]
            A(j+1,n)=sumLoss; %each additional row below header relates to one initial bet, P_j, and each column in that row denotes the value of sumLoss after n losses
    end

    % Fill in one row of AA with splined values based on the data in the corresponding row of A
    x1 = A(1,:);
    y1 = A(j+1,:);
    yy1 = spline(x1,y1,xx1);
    AA(1,:) = xx1;
    AA(j+1,:) = yy1;
    plot(x1,y1,'o',xx1,yy1) % Plot quasi-continuous and discrete results w.r.t. a given initial bet, P_j
    hold on
    
    % Compute the maximum number of consec. losses (nMax) that can be sustained
    % for a given initial bet, P_j
    AA_local = zeros(2, length(xx1));
    AA_local(1,:)= AA(1,:);
    AA_local(2,:)= AA(j+1,:);
    [W,V] = find(AA_local==min(AA_local(AA_local>=stopgap)));
    nMax = (V-1)*step;
    nMaxArray(1,j)=nMax;
    fprintf('At P = $%d: max. number of consecutive losses allowed = %.3f\n\n', P(j),nMaxArray(1,j));

    % Compute the overall expected value for a given initial bet, P_j
    q = 0.5; % Probability to lose a single game
    prob_fullLoss = q^(nMax); % Probability to lose every single game (and thus reach your stopgap)
    EVArray(1,j) = P(j)*(1-prob_fullLoss)-stopgap*q^nMax;

    j = j+1;
end

% Formatting figure(1)
xlabel('Number of Consecutive Losses (n)');
ylabel('Cumulative Amount Lost ($)');
format shortG

% Fill matrix B with expected value data
B(1,:)=P; % "header" row contains range of independent variable, initial bet (P) [2.5, 600]
B(2,:)=EVArray; % EV values previously calculated w.r.t. each value P_j

% Generate splined values based on the data in row 2 of B
xx2 = 0:step:max(P);
x2 = B(1,:);
y2 = B(2,:);
yy2 = spline(x2,y2,xx2);

figure(2) % Plot expected value vs. base (initial) bet (P)
plot(x2,y2,'o',xx2,yy2);
hold on
xlabel('Base Bet ($)');
ylabel('Expected Value ($)');




%% ______________________________________________________________________________________________
%% [Unfinished Work] Determining the Optimal Number of Games to Play

q = 0.5; % probability of loss
p = 0.5; % probability of win
k = 1;
numgames = zeros(2,length(P));
while k<=length(P)
    numgames(1,k) = k;
    numgames(2,k) = 1/p*((1/q)^k - 1);
    k = k+1;
end

xx3 = 0:step:length(P);
x3 = numgames(1,1:length(P));
y3 = numgames(2,1:length(P));
yy3 = spline(x3,y3,xx3); % interpolated numgames

xx4 = 0:step:length(P);
x4 = P(1,:);
y4 = nMaxArray(1,:);
yy4 = spline(x4,y4,xx4); % interpolated n-max values for each incremental P

pnMax = zeros(2,length(xx4));
pnMax(1,:) = xx4; % P
pnMax(2,:) = yy4; % nMax given P

splineNumgames = zeros(2,length(xx4));
splineNumgames(1,:) = xx4; % number of consecutive games
splineNumgames(2,:) = yy3; % # of games to be played to get n consecutive

% figure(3)
% plot(optimgames(1,:), optimgames(2,:))

% z = 1;
% while z<=length(xx4)
%     splineNumgames2 = zeros(1,length(xx4));
%     splineNumgames2 = splineNumgames(2,:);
%     pnMax2 = zeros(1,length(xx4));
%     pnMax2 = pnMax(2,:);
%     [F,G] = find(abs(splineNumgames2-pnMax2)<);
%     F
%     G
%     z=z+1;
% end
    
% z=1;
% while z<=length(P)
%     find(P
%     xx3 = 0:step:length(P);
%     x3 = C(2,:);
%     x3 = numgames(1,1:length(P));
%     y3 = numgames(2,1:length(P));
%     yy3 = spline(x3,y3,xx3);
%     
%     AA_CC( = zeros(2, length(xx1));
%     AA_local(1,:)= AA(1,:);
%     AA_local(2,:)= AA(j+1,:);
%     [W,V] = find(AA_local==min(AA_local(AA_local>=stopgap)));
%     
%     AA_CC = (V-1)*step; % This is the final result we wanted 
%     
%     nMaxArray(1,j)=nMax;
%     
% C

% figure(3)
% xx3 = 0:step:length(P);
% x3 = numgames(1,1:length(P));
% y3 = numgames(2,1:length(P));
% yy3 = spline(x3,y3,xx3);
% plot(x3,y3,'o',xx3,yy3);
% xlabel("# of consecutive losses (n)");
% ylabel("# of rounds until n consec. losses");

% % Finding optimal number of games to play, given initial bet and stopgap
% optimgames = zeros(1,numgamerange);
% m = 1;
% while m<=numgamerange
%     scaling=numgames(1,m)/nMaxArray(1,
%     optimgames(1,m) = numgames(
%     
%     numgames(1,k) = k;
%     numgames(2,k) = 1/p*((1/q)^k - 1);
%     k = k+1;
% end
% 
% if n

