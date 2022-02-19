# setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")
# Week 10-11 SSG: Single-Factor ANOVA

growth=c(1.45,0.76,1.11,1.71,0.97,1.24,1.93,1.96,2.20,3.93,2.24,3.71,2.92,3.01,6.33,1.18,0.59,0.52,-0.74,-0.99)

substrate=c('sand','sand','sand','sand','sand','silt','silt', 'silt','silt','silt','pebbles','pebbles','pebbles','pebbles', 'pebbles','glass','glass','glass','glass','glass')

MyData = data.frame('growth'=growth, 'substrate'=substrate)
MyData

boxplot(growth~substrate, ylab = 'Algal Growth Rate (/d)', xlab = 'Substrate Type')

MyFit = lm(growth~substrate, data=MyData)
summary(MyFit)
# Statistical tests shown are all relative to one factor level (glass, in this case)

# Line 1
# (Intercept) in this case is the glass substrate
# 'Estimate' is the least square means (LS means) estimates from the fit model
# 't-test' column conducts a t-test, where the null hypothesis that the algal growth rate is not different from zero (remember: this is always two-tailed so be cautious)
# since p>0, we fail to reject the null hypothesis

# Line 2
# First of the treatment levels relative to the glass treatment
# LS mean algal growth rate is 3.53 per day more than glass, meaning that actual growth rate estimate is 3.53+0.112=3.642 per day
# t-test evaluates hyp that difference in algal growth relative to glass is not zero
# p<-.-5, so we can conclude that the pebbles substrate had an influence on growth relative to glass

# While the above information provides t-test evaluations of the term against zero for each level, we'll need the F TABLE to evaluate the GENERAL SIGNIFICANCE of the factor (substrate, in this case). Use the aov() function to get the F-table:
summary(aov(MyFit))
# Since p<0.05, we reject the null hypothesis and conclude that the substrate had an influence on the per-capita algal growth rate

# Alternatively, we can perform the F-test by finding the F-critical value
qf(0.95,3,16) # analog of qt() and qchisq() for the F-distribution
# arg. 1: alpha = 0.05, so 1-0.05 = 0.95 (because qf calculates event threshold corresponding to prob to the left)
# arg. 2: numerator dof = #groups-1 = 4-1 = 3
# arg. 3: denominator = #observations - #groups = 20-4 = 16
# since f-obs (9.97) > f-critical (3.23), the null hypothesis is rejected

# EVALUATING ANOVA ASSUMPTIONS

# Evaluating normality assumption
MyRes = residuals(MyFit)
hist(MyRes,main="",xlab="Residuals", freq=FALSE)
xfit=seq(min(MyRes),max(MyRes),length=100) #new x variable
yfit=dnorm(xfit,0,sd(MyRes)) #predicted Normal
lines(xfit, yfit, col="blue") #add a blue line
# visual inspection suggests that residuals are NOT symmetrical
# to quantify, we perform Shapiro-Wilkes test
shapiro.test(MyRes)
# since p>0.05, we fail to reject the null hypothesis and conclude that there is no evidence of a deviation from normality

# Evaluating homoscedasticity
plot(MyFit,1) # generating residual plot
# visual inspection suggests that residual variances may not be homoscedastic
# to quantify, we perform Barlett test
bartlett.test(growth~substrate, data=MyData)
# since p>0.05, we fail to reject the null hypothesis and conclude that there is no evidence of a deviation from homoscedasticity

# Group tests using TukeyHSD
# The Tukey Honest Significant Difference test compares all possible pair-wise contrasts
# TukeyHSD automatically adjusts for the multiple contrasts to maintain the family-wise Type I error rate, meaning we can evaluate each test using the family-wise error rate (here it's 5%)
# TukeyHSD becomes problematic when the number of groups is too large, as the number of contrasts will be too large
TukeyHSD(aov(MyFit))
# e.g. Line 4 tests the hypothesis that the growth rate isn't different between the sand and pebble substrates. Since p<0.05, we conclude that the per-capita growth rates are different between the two substrates.

# Group tests using contrasts
# Use contrast statements instead of TukeyHSD if the number of groups is large 
# These will allow for us to test just the group differences we're interested in
# Must adjust the type I error rate (alpha_C) manually to ensure that overall type I error rate of the ANOVE (alpha_F) is maintained
library(contrast)
contrast(MyFit,list(substrate="pebbles"),list(substrate="glass"))
contrast(MyFit,list(substrate="pebbles"),list(substrate="sand"))
contrast(MyFit,list(substrate="pebbles"),list(substrate="silt"))
# Calculating type I error rate for each contrast
alphaF = 0.05
m = 3 # number of contrasts
alphaC = 1-(1-alphaF)^(1/m)
alphaC


# SELF-ASSESSMENT

setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")
MyData=read.csv("KISS1.csv", colClasses = c('numeric','factor'))

gene = MyData$Gene
region = MyData$Region

boxplot(gene~region, ylab='Gene', xlab='Region')

MyFit = lm(gene~region, data=MyData)

# Testing normality
MyRes = residuals(MyFit)
shapiro.test(MyRes)

# Testing homoscedasticity
bartlett.test(gene~region, data=MyData)

# ANOVA
summary(aov(MyFit))

# Test for differences between cortex and each other region using group contrasts
alpha_F = 0.05 # family type I error rate
m = 5 # number of contrast tests
alpha_C = 1-(1-alpha_F)^(1/m) # contrast type I error rate
alpha_C

