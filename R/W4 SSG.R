setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

# # Part 1: Tutorial

# MyData=read.csv("mercury.csv", colClasses = c('numeric','factor'))

# OddBall = subset(MyData$mercury, lake=="O")
# Lucky = subset(MyData$mercury, lake=="L")

# lake=c('O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L')

# risk=c('Y', 'Y', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'Y', 'N', 'N', 'Y', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N')

# # Contingency table
# table(lake,risk)

# # Histogram
# hist(Lucky,main="Lucky Lake",xlab="Hg Concentration (ppb)",ylab="Observed Frequency")
# hist(OddBall,main="OddBall Lake",xlab="Hg Concentration (ppb)",ylab="Observed Frequency")

# # Basic bar plot
# barplot(Lucky, ylim=c(0,100),col='red',main='Lucky Lake',xlab='Sediment Sample',ylab='Mercury Concentration (ppb)')

# # Stacked bar plot
# BothLakes=data.frame('OddBall'=OddBall, 'Lucky'=Lucky)
# BothLakesTransform = t(BothLakes)
# barplot(BothLakesTransform, xlab='Depth Interval', ylab='Concentration of Mercury (ppb)', ylim=c(0,250), col=c('red','lightblue'))
# legend(15, 250, c('OddBall', 'Lucky'), col=c('red','lightblue'), pch=19)

# # Grouped bar plot
# barplot(BothLakesTransform, xlab='Depth Interval', ylab='Concentration of Mercury (ppb)', ylim=c(0,250), col=c('red','lightblue'), beside=TRUE)
# legend(15, 250, c('OddBall', 'Lucky'), col=c('red','lightblue'), pch=19)

# # Box plot
# boxplot(mercury~lake, main='Mercury Concentrations by Lake', ylab='Mercury Concentration (ppb)', xlab='Lake', col = c('lightblue', 'red'), data=MyData)
# MyData$lake=factor(MyData$lake,c('O','L')) #Switching order of factors shown on x-axis
# levels(MyData$lake)

# # Scatter plot
# plot(OddBall,Lucky,main='Comparing Lake Mercury Concentrations',xlab='OddBall Lake Concentration',ylab='Lucky Lake Concentration',xlim=c(60,130),ylim=c(40,90))
# abline(v=84.1155,col='blue') # abline creates straight lines on plot (v indicates where to draw vertical line)
# abline(h=69.0015,col='red') # h indicates where to draw horizontal line

# Part 2: Self-Assessment

MyData=read.csv("cholera.csv", colClasses = c('factor','numeric','numeric','factor'))
str(MyData)

MyData$Water=factor(MyData$Water,c('WesternThamesRiver','NewRiver','CentralThamesRiver'))
boxplot(Deaths~Water, main='Cholera Mortality by Water Source', xlab='Water Source',ylab='Deaths per 10,000', ylim=c(0,220), col=c('blue','orange','red'),data=MyData)

Density = MyData$Density
Deaths = MyData$Deaths

plot(Density,Deaths,xlab='Population density per district',ylab='Deaths per 10,000',pch=18, ylim=c(0,220), col=c('blue'))

