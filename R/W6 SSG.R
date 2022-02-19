# W6 SSG

# SE: standard error
# s: sample standard deviation, calc. w/ sd()
# n: sample size, calc. w/ length()
# SE = s/sqrt(n)

# tC: critical t-score
# Calculated with qt(p,df)
# p: probability of interest
# df: degrees of freedom (df=n-1)
# qt() always assumes that p is to the lect of the critical tC value
# need to account for confidence intervals being 2-sided, where probability in each tail is alpha/2
# therefore left tail threshold is found at p = alpha/2
# and right tail threshold is at p=1-(alpha/2)

# CI: confidence interval
# CI = mean +/- tC x SE

# Example

MyData=c(3.89,5.85,5.97,6.10,4.44,6.12,4.24,5.63,3.48,4.32)

m = mean(MyData) # calculates sample mean
n = length(MyData) # calculates sample size
SE = sd(MyData)/sqrt(n) # calculates standard error
LCI = m + qt(0.025,n-1)*SE # calculates lower interval
UCI = m + qt(0.975,n-1)*SE # calculates upper interval
LCI # lower 95% confidence interval
UCI # upper 95% confidence interval

