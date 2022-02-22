# W8 SSG

# Chi-square test is used to test for independence among categorical variables
# H0: categorical variables are independent
# HA: categorical variables are not independent

setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

cottage = c(25,60,65)
no.cottage = c(40,7,3)
Mydata = data.frame('C'=cottage, 'NC'=no.cottage)
Mydata

# METHOD 1
chisq.test(Mydata)
# X-squared = 69.222 [chi-square value]
# df = 2 [2 degrees of freedom]
# p = 9.304e-16 [p-value]
# Since p<0.05, we therefore reject our null hypothesis that water flea abundance in Muskoka lakes is independed of the presence or absence of cottages 

# METHOD 2
# We can do the same test by comparing the observed versus critical test statistics
# Observed chi-square (X^2) value is given by output of chisq.test() function
# Critical chi-square (X^2) value is found with qchisq(), with a type I error rate of alpha = 0.05 and df = 2
# qchisq() is the analog of the qnorm() and qt() function for the chi-square distribution
# REMEMBER: chi-square tests are one-tailed, and Type I error rate refers to area in the RIGHT tail on graph. Therefore, since qchisq() calculates event threshold corresponding to probability to the LEFT, we must enter "1-alpha" as the probability value

# Observed X^2
chisq.test(Mydata)

# Critical X^2
alpha = 0.05
df = 2
qchisq(1-alpha, df)

# Since observed X^2 (69.222) > critical X^2 (5.991), the null hypothesis is rejected