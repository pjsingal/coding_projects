# FIRST TRY

setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

MyData=read.csv("Perch.csv", colClasses = c('numeric','numeric'))
m06 = mean(MyData$Perch.2006)
n06 = length(MyData$Perch.2006)
SE06 = sd(MyData$Perch.2006)/sqrt(n06)

m16 = mean(MyData$Perch.2016)
n16 = length(MyData$Perch.2016)
SE16 = sd(MyData$Perch.2016)/sqrt(n16)

LCI06 = m06 + qt(0.025, n06-1)*SE06
UCI06 = m06 + qt(0.975, n06-1)*SE06


LCI16 = m16 + qt(0.025, n16-1)*SE16
UCI16 = m16 + qt(0.975, n16-1)*SE16

LCI06
UCI06

LCI16
UCI16

t.test(MyData$Perch.2006, MyData$Perch.2016, mu=0, paired = TRUE)

# 2
n = 18
m = 101.0
sd = 6.03
mu = 100

SE = sd/sqrt(n) # standard error
to = (m-mu)/SE
tc = qt(0.025, n-1)

to
tc

LCI = m + qt(0.025, n-1)*SE
UCI = m + qt(0.975, n-1)*SE
LCI
UCI


# 3 
setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

cort=read.csv("cort.csv", colClasses = c('numeric','numeric'))

t.test(cort$NoPred, cort$Pred, mu = 0, paired = TRUE)


# SECOND TRY

#2
n = 18
m = 101.0
sd = 6.03
mu = 100

SE = sd/sqrt(n) # standard error
to = (m-mu)/SE
to
tc = qt(0.975, n-1)
tc

LCI = m + qt(0.025, n-1)*SE
UCI = m + qt(0.975, n-1)*SE
LCI
UCI

#Finding tobs
t.test()
