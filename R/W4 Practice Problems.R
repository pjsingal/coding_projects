setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

MyData=read.csv("IrisMeasurements.csv", colClasses = c('numeric','numeric','numeric','numeric','factor'))

# Easy way
summary(MyData)

par(mfrow=c(2,2)) # Combines plots into 2x2 subplots
hist(MyData$SepalLength)
hist(MyData$SepalWidth)
hist(MyData$PetalLength)
hist(MyData$PetalWidth)