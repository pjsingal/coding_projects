# SINGLE-SAMPLE T-TESTS
eggs=c(778,1367,947,1002,521,656,1082,1144,735,1283)

# Two-tailed
t.test(eggs, mu=1100) # mu is the constant you want to test the mean against
# df: degrees of freedom
# t: observed t-value
# p-value
# Default is two-tailed
# H0 = there's no difference btwn mean no. of eggs per fish in sample and the threshold of 1100 
# HA = there's a difference btwn mean no. of eggs per fish in sample and the min. threshold of 1100
# Here, we're unconcerned about directionality (we just want to know if it's different versus if it's greater or less than)
# In this case, we'd fail to reject the null hypothesis because p>0.05. 

# We can achieve the same result from the qt() function. For a two-tailed Type I error rate of alpha=0.05, the probability we'd seek is p = 1- alpha/2.
qt(0.025,9)
# Thus, for the two-tailed test the left-side value of the critical test statistic is tc = -2.262, which is < the observed value to=-1.697

# One-tailed
# This is the best approach, since our purpose of sampling the fist is to evaluate whether the eggs per fish are less than the minimum threshold
# H0 = the mean no. of eggs per fish in sample is not < the threshold of 1100
# HA = the mean no. of eggs per fish in sample is < the threshold of 1100
t.test(eggs, mu=1100, alternative = 'less')
# Unlike ealier, we must also include the 'alternative' argument for the alternative hypothesis (either 'greater' or 'less')


# PAIRED-SAMPLE T-TESTS
PreEvent=c(18.1, 21.3, 16, 21.6, 21, 20.3, 25.2, 22, 22.9, 23.5, 24, 26.1, 18.1, 24.2, 21, 19.2, 24, 21.8, 19.2, 19.8, 26.7, 23.1, 25, 14.8)
PostEvent=c(33.1, 39.4, 36.1, 42, 33.2, 43.6, 39.4, 39.1, 37.8, 45.1, 1.2, 0.8, 1.7, 12.1, 9.7, 10.1, 4.8, 4.1, 10.2, 5.2, 6.3, 8.1, 4.1, 2.3)

# H0 = mean difference btwn pre and post event densities is zero
# HA = mean difference btwn pre and post event densities is not zero

t.test(PreEvent, PostEvent, mu=0, paired=TRUE)
# Output shows p>0.05, so we fail to reject H0

# Alternatively, we can use this approach:
# Since H0 is two-sided, we calculate a two-sided critical t-score as:
qt(0.975,length(PreEvent)-1)
# Since magnitude of tc>to, we fail to reject H0 and conclude that data do not provide strong evidence that the difference is something other than zero


# INDEPENDENT TWO-SAMPLE TESTS
egg.count=c(78, 72, 88, 80, 73, 81, 62, 76, 73, 90, 92, 76, 71, 74, 58, 57, 45, 56, 66, 60, 49, 51, 52, 65, 50, 48, 58, 57)
trial=c('N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S')
Mydata = data.frame('Hatched'=egg.count, 'Trial'=trial)
Mydata

# H0 = the difference betwen the population means is zero
# HA = the difference between the population means is not zero

t.test(Hatched~Trial, data=Mydata)
# Output shows separate values for each categorical variable in 'trial'
# Output is similar to that of the paired t-test, but the alternative hyp. is slightly different
# Since p<0.05, we reject H0 and conclude that stream flow changes the mean hatching rate of fish eggs


# SELF-ASSESSMENT
setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

# 1

MyData=read.csv("GulfOil.csv", colClasses = c('factor','numeric','numeric'))

# H0 = the mean shrimp catch in the Gulf did not change between the 2009 and 2010 seasons
# HA = the mean shrimp catch in the Gulf changed between the 2009 and 2010 seasons
par(mfrow=c(1,2))

catch09 = MyData$Catch09
catch10 = MyData$Catch10
hist(catch09)
hist(catch10)

# Using a paired-sample t-test
t.test(catch09, catch10, mu=0, paired=TRUE)
