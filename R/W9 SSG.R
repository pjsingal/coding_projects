setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

# Correlation analysis is done using cor.test(x,y)
# x,y denote the two numerical variables

# Example
H=c(44.4, 45.9, 41.9, 53.3, 44.7, 44.1, 50.7, 45.2, 60.1)
C=c(2.6, 3.1, 2.5, 5.0, 3.6, 4.0, 5.2, 2.8, 3.8)
plot(C,H,xlab="Consumer Index",ylab="Tuna Lightness")
MyFit=cor.test(H,C) #save correlation test to ‘MyFit’ 
MyFit
# Correlation coefficient is a 'Pearson' correlation
# Correlation test is a one-sample t-test with to = 1.8411 on 7 dof, and a p-value of p=0.1082
# Alternative hyp indicates number of tails - in this case, our test is two-tailed
# 95% CI are -0.1497426 and 0.8955795
# Correlation value is r = 0.5711816


# Linear regression is doen using lm(formula), which can be used for both linear regression and ANOVA
# For linear regression, formula is given as y~x, where y and x are numerical variables

# Example
MyData=read.csv("ELA_AnnualTemp.csv", colClasses = c('numeric','numeric','numeric','numeric'))
precip = MyData$Precip
snow = MyData$Snow
# Use str() to check the data type, if necessary
plot(precip,snow, xlab="Precipitation", ylab="Snow")
# Next step is to fit the linear regression
MyFit=lm(snow~precip)
summary(MyFit)
# Distribution of residuals shown in form of quantiles

# In coefficients section:
# Column 1 shows each parameter in the model: y-intercept (row 1) and slope (row 2), which is called "precip" in this case
# Column 2 gives an estimate for each parameter
# Columns 3 and 4 show the standard error of the estimate for each coefficient, as well as the observed t-score. The t-test can be done by comparing the observed tscore against the critical t-score (using the qt() function). For this example, the critical t-score for the slope parameter is tC = 2.01 (df = 48, two-tailed, α = 0.05), which is less than the observed absolute value of tO = 9.464, so we reject the null hypothesis that the slope is equal to zero. 
# Column 5 conducts the test using the p-value using the pt() function, which is shown in the last column for a two-tailed test. Since the p-value is less than α = 0.05, we come to the same conclusion. R includes a series of graphical significance codes next to the p-values to give you a quick assessment of the significance of your regression parameters.

# In residual standard error section: provides the Analysis of Variance information. The top line in this section gives residual standard error, which is a measure of the variation in the observations around the fitted line. The smaller this number the closer the observed values are to the fitted line. The next line is the R2 value of the regression, which you can think of as the percent variance explained. One problem with R-squared values is they tend to be artificially inflated with greater numbers of explanatory variables. If we want to compare R2 values between regression models with differing number of parameters, we need to take this effect into account and the adjusted R2 value provides a more accurate estimate of the percent variance explained. The final line shows the F-statistic for the test of whether the ratio of the explained variance over the unexplained variance is different from one. The F-test in a linear regression is the same as a t-test of whether the slope is different than zero, but this is not general to other types of statistical model. Using the qf() function, the critical F-score is FC = 4.04. Since the observed F-score is greater than the critical F-score, we reject the null hypothesis that the ratio is equal to one. Equivalently, we could perform the test using the p-value provided using the pf() function.

# After fitting the linear regression, plot both the raw data and fit line to see if the fit statistical model makes sense
plot(precip,snow, xlab="Precipitation", ylab="Snow")
abline(MyFit, col='blue',lwd=2)

# Evaluating linear and homoschedastic assumptions (qualitative)
plot(MyFit,1) # residuals-by-predicted-values plot 
# allows us to visualize assumptions of linearity and heteroschedasticity
# "MyFit" is the linear regression object, and type is the diagnostic plot (type = 1 for residual plots)
# Only analyze large patterns of moving average, ignore smaller local trends

# Evaluating normally-distributed-residuals AKA normality assumption (qualitative)
MyRes = residuals(MyFit)
hist(MyRes, main = "", xlab="Residuals", freq=FALSE)
# freq tells the function to plot the proportion rather than counts
# Adding a normal curve for easier visual comparison:
xfit = seq(min(MyRes), max(MyRes), length = 100) # new x variable
yfit=dnorm(xfit,0,sd(MyRes)) # predicted normal
lines(xfit,yfit,col="blue") # add a blue line

# Evaluating normality assumption with Shapiro-Wilkes test (quantitative)
shapiro.test(MyRes)
# Since p<0.05, we reject the null hypothesis and conclude that there is evidence of a deviation from normality



#SELF-ASSESSMENT

setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")
MyData=read.csv("ELA_AnnualTemp.csv", colClasses = c('numeric','numeric','numeric','numeric'))

temp = MyData$Temp
year = MyData$Year

plot(year,temp,xlab="Year",ylab="Temperature")

MyFit = lm(temp~year)
summary(MyFit)
# since p<0.05 for slope, we reject null hypothesis and conclude that slope is significantly different from zero
# average change in temperature between 1970 and 2006:
b = 0.05951 # slope; average temp. change per year
nyears = 36 # number of years
avg70_06 = b * nyears # 2.14 degC
abline(MyFit, col='blue',lwd=2) # adding fit line to original scatter plot

# Evaluating linearity assumption w/ residuals-by-predicted plot
plot(MyFit,1)
# No significant departures from linearity
# No strong case for rejecting homoschedastic assumption

# Analyzing correlation coefficient between mean annual air temperature and total snowfall
snow = MyData$Snow
MyFit2 = cor.test(temp,snow)
MyFit2
# r = -0.427, which is a negative correlation
# p = 0.0187 < 0.05, so reject the null hypothesis and conclude that the correlation coefficient is significantly different from zero

# Analyzing correlation coefficient between mean annual air temperature and total precipitation
precip = MyData$Precip
MyFit3 = cor.test(temp,precip)
MyFit3
# r = -0.122, which is a negative correlation
# p = 0.5191 > 0.05, so fail to reject the null hypothesis and conclude that there is no evidence to suggest that the correlation coefficient is significantly different from zero




