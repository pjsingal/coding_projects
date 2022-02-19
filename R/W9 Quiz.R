setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

# # 1
# MyData=read.csv("MinnesotaHighSchool.csv", colClasses = c('factor','factor','factor','factor'))

# rank = MyData$HighSchoolRank
# income = MyData$FatherOccupLevel
# a = table(rank,income)
# chisq.test(a)
# alpha = 0.05
# df = 12
# qchisq(1-alpha, df)


# 3
MyData=read.csv("cort.csv", colClasses = c('numeric','numeric'))
a = MyData$NoPred
b = MyData$Pred
t.test(a, b, mu=0, paired=TRUE)

