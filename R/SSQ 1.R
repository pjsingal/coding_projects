#1
a = c(20.7, 9.4, 20.5, 15, 1.7, 17.8, 24.4, 1.8, 2.1, 8.3, 7.8, 11.1)
amed = median(a)
 
b = a - amed

a
amed
b
min(b)
max(b)

#2
a = c(23.4, 1.9, 13.8, 17, 15.6, 14 )
b = a^3

a
b
median(b)

#3
setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

MyData=read.csv("Quiz1_DataSet1_7.csv", colClasses = c('numeric','factor','numeric'))
MyData
mean(MyData$HoursSleep)
SubMyData = subset (MyData, Type=='latte')
mean(SubMyData$HoursSleep)
x = MyData$CupsCoffee
y = MyData$HoursSleep
plot(x, y)

#4
MyData=read.csv("Quiz1_DataSet2_5.csv", colClasses = c('numeric','factor'))
MyData
IQR(MyData$Happiness)

x = MyData$Visits
y = MyData$Happiness

boxplot(y~x, ylab = "Happiness", xlab="Visits")
