setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

# Tutorial
MyData=read.csv("metabolic.csv", colClasses = c('factor','numeric','factor','numeric','factor','numeric'))
MyData

mean(MyData$MetabolicRate) # calculates the mean
median(MyData$MetabolicRate) # calculates the median
var(MyData$MetabolicRate) # calculates the variance
sd(MyData$MetabolicRate) # calculates the standard deviation

quantile(a,0.25) # first quartile range
quantile(a, c(0.25,0.5,0.75)) # gives first (25th %ile), second (50th), and third (75th) quartiles
summary(MyData$MetabolicRate) # gives mean, median, max, min, and intermediate quartile values
IQR(MyData$MetabolicRate) # interquartile range; the difference between the 3rd and 1st quartiles


# Self-Assessment
MyData=read.csv("KyDerby.csv", colClasses = c('factor','factor','numeric','numeric','numeric'))
MyData

summary(MyData$TotalTime)
var(MyData$TotalTime)
IQR(MyData$TotalTime)