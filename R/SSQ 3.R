setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")
MyData=read.csv("Quiz3_DataSet1_6.csv", colClasses = c('factor','numeric'))

MyData

teens = subset(MyData, Generation=='Teenager')
adults = subset(MyData, Generation =='Adult')


t.test(teens$Sugar, adults$Sugar, mu=0, paired=TRUE)

qt(0.975,length(teens$Sugar)-1)
qt(0.975,length(adults$Sugar)-1)


# #2
# MyData=read.csv("Quiz3_DataSet2_15.csv", colClasses = c('factor','factor'))
# A = table(MyData$Sugar, MyData$Sex)

# chisq.test(A)
# qchisq(1-0.05,2)