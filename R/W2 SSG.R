setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

# Tutorial Instructions
MyData=read.csv("metabolic.csv", colClasses = c('factor','numeric','factor','numeric','factor','numeric'))
str(MyData)
x = MyData$ExerciseLevel
y = MyData$MetabolicRate

boxplot(y~x, col=c("orange","blue","green"), ylab = "Metabolic Rate (Calories per day)", xlab="Exercise Level")

SubMyData = subset (MyData, ExerciseLevel=='high')
mean(SubMyData$MetabolicRate)
SubMyData2 = subset (MyData, ExerciseLevel=='high' & Sex=='female')
mean(SubMyData2$MetabolicRate)

# Self-Assessment Questions
MyData=read.csv("RunningPerform.csv", colClasses = c('numeric','numeric','numeric'))

mean(MyData$RunningSpeed)
mean(MyData$Age)
mean(MyData$RunningFrequency)

x = MyData$Age
y1 = MyData$RunningSpeed
y2 = MyData$RunningFrequency

plot(x,y1, xlab="Age (years)", ylab="Running Speed (miles/min)")
plot(x,y2, xlab="Age (years)", ylab="Running Frequency (days/week)")