setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")
MyData=read.csv("mediasexism.csv", colClasses = c('factor','factor','numeric','numeric','numeric'))

expert = MyData$Expert 
candidates = MyData$Candidates

country = MyData$Country
year = MyData$Year
seats = MyData$Seats


par(mfrow=c(1,2))
MyFit1=cor.test(candidates,expert)
MyFit1
MyFit2=cor.test(seats,expert)
MyFit2

MyFit3=lm(candidates~expert)
summary(MyFit3)
MyFit4=lm(seats~expert)
summary(MyFit4)

plot(expert,candidates, main='Prospective Female Candidates vs. Media Bias', xlab='Number of Portrayals of Female Political Experts in Media', ylab='Number of Female Candidates',  cex.lab=0.9, cex.main=1, pch=13)
abline(MyFit3, col='red')

plot(expert, seats, main='Successful Female Candidates vs. Media Bias', xlab='Number of Portrayals of Female Political Experts in Media', ylab='Number of Seats Won by Female Candidates',  cex.lab=0.9, cex.main=1, pch=13)
abline(MyFit4, col='red')