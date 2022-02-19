# Q1

setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

MyData=read.csv("Quiz2_DataSet1_9.csv", stringsAsFactors = TRUE, colClasses = c('factor','numeric','factor'))

SubMyData = subset(MyData, Generation=='Gen2020')
#SubMyData$Career=factor(SubMyData$Career, c("Sales","Professional", "Clerical", "Education", "Pop Star"))
hist(SubMyData$Cynicism, ylim=c(0,50))
table(SubMyData$Cynicism)

MyData$Generation=factor(MyData$Generation, c("Traditionalists","Boomers", "GenerationX", "Millenials", "Gen2020"))
boxplot(MyData$Cynicism~MyData$Generation)

# # job = SubMyData$Career
# job
# table(job)

# Q4

# a)
1 - pnorm(67,49.5,11.8)

# b)
pnorm(19,49.5,11.8)

# c)
under55 = pnorm(55, 49.5, 11.8)
under45 = pnorm(45,49.5,11.8)
under55-under45
