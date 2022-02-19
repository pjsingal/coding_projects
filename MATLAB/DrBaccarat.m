% "Dr. Baccarat"

close all

% syms P
% n1 = P;
% n2 = 2*n1+P;
% n3 = 2*n2 + P;
% n4 = 2*n3+P;
% n5 = 2*n4 + P;
% n6 = 2*n5 + P;
% n7 = 2*n6 + P;
% n8 = 2*n7 + P;
% n9 = 2*n8 + P;
% n1, n2, n3, n4, n5, n6, n7, n8, n9

% Generating matrix of discrete data points
syms n i j
stopgap = 1000;
% P = linspace(0,100,600);
P = [2.5, 5, 10, 15, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 500, 600];
step = 0.001; % For spline

rangemax = length(P);
xx1 = 0:step:rangemax; % For spline

A = zeros(length(P) + 1, rangemax);
AA = zeros(length(P) + 1, length(xx1));
B = zeros(2, rangemax);
BB = zeros(length(P) + 1, length(xx1));

j = 1;

% labels = [{'P = $2.5'}, {'P = $5'}, {'P = $10'}, {'P = $15'}, {'P = $20'}, {'P = $25'}, {'P = $30'}, {'P = $35'}];

nMaxArray = zeros(1,length(P));
full_lossArray = zeros(1,length(P));
EVArray = zeros(1,length(P));

figure(1)
while j <= length(P)
    for n=1:rangemax
            f = P(j)*((2^i)- 1);
            V = subs(f, i, 1:n);
            loss = sum(V);
            A(1,n)=n;
            A(j+1,n)=loss;
    end
    
    % For spline:
    x1 = A(1,:);
    y1 = A(j+1,:);
    yy1 = spline(x1,y1,xx1);
    AA(1,:) = xx1;
    AA(j+1,:) = yy1;
%     AA_local = AA(j+1,:); 
    plot(x1,y1,'o',xx1,yy1)
    hold on
    
    AA_local = zeros(2, length(xx1));
    AA_local(1,:)= AA(1,:);
    AA_local(2,:)= AA(j+1,:);
    [W,V] = find(AA_local==min(AA_local(AA_local>=stopgap)));
    nMax = (V-1)*step; % This is the final result we wanted 
%     fprintf('Max. number of losses allowed for P = $%.0d: %.3f\n',P(j),nMax)
    
    nMaxArray(1,j)=nMax;
    
%     
%     AA_local = AA(j+1,:);
%     [I,J] = find(AA_local==stopgap);
% %     [I,J] = find(AA==min(AA(AA>=stopgap)));
%     nMax = (J-1)*step; % This is the final result we wanted
% %     scatter(find(AA==nMax),nMax, 'markersize', 215)
    
    % Expected value
    q = 0.5; % Probability to lose a single game
    full_lossArray(1,j) = q^(nMax); % Probability to lose and reach your stopgap 
    EVArray(1,j) = P(j)*(1-q^nMax)-stopgap*q^nMax;
%     full_loss*100;

   % fprintf('At P = $%d:\n Maximum number of consecutive losses allowed = %.3f\n Probability of reaching stopgap in one streak = %.3f\n Expected value = $%.2f \n\n\n', P(j), nMaxArray(1,j), EVArray(1,j));
    fprintf('At P = $%d: max. number of consecutive losses allowed = %.3f\n', P(j),nMaxArray(1,j));
    fprintf('\n');
    
    j = j+1;
end

%legend(labels, 'Location', 'northwest');
%format shortG


xlabel('Number of Consecutive Losses (n)');
ylabel('Cumulative Amount Lost ($)');
% legend(labels, 'Location', 'northwest');
format shortG

B(1,:)=P;
B(2,:)=EVArray;

figure(2)
xx2 = 0:step:max(P);
x2 = B(1,:);
y2 = B(2,:);
yy2 = spline(x2,y2,xx2);
plot(x2,y2,'o',xx2,yy2);
% scatter(x2,y2);
%     yy2 = spline(x2,y2,xx);
%     BB(j+1,:) = yy2;

%     plot(x2,y2,'o',xx,yy2)
%     plot(nMaxArray(1,k),EVArray(1,k))
hold on

% k = 1;
% while k<=length(P)
%     x2 = B(1,k);
%     y2 = B(2,k);
%     scatter(x2,y2);
% %     yy2 = spline(x2,y2,xx);
% %     BB(j+1,:) = yy2;
% 
% %     plot(x2,y2,'o',xx,yy2)
% %     plot(nMaxArray(1,k),EVArray(1,k))
%     hold on
% end

xlabel('Base Bet ($)');
ylabel('Expected Value ($)');


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

% CC = zeros(2,length(xx3));
% CC(1,:)=xx3;
% CC(2,:)=yy3;
% % Interpolated numgames

% AA_CC = zeros(length(P)+1, length(xx3));
% AA_CC(1,:)=AA(1,:);
% AA_CC(2,:)=AA(2,:); %
% AA_CC(3,:)=CC(2,:); % number of games played before an n-loss streak occurs

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

