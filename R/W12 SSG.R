# W12 SSG: Two-Factor ANOVA

# similar to single-factor ANOVA, data must be in the long-form with one column as the response (dependent) variable and two columns as coded catagorical (independent) variables

Growth=c(3.08, 3.52, 2.61, 2.36, 2.66, 3.00, 3.22, 2.42, 2.48, 2.45, 2.58, 2.67, 2.31, 2.51, 2.51, 2.15, 2.09, 2.30, 4.99, 5.21, 5.03, 5.29, 5.02, 4.06)

P.taeda=c('yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'no', 'no', 'no', 'no', 'no', 'no', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'no', 'no', 'no', 'no', 'no', 'no')

P.pinea=c('no', 'no', 'no', 'no', 'no', 'no', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'no', 'no', 'no', 'no', 'no', 'no')

MyData = data.frame('Growth'=Growth, 'P.taeda'=P.taeda,'P.pinea'=P.pinea)

MyData

# boxplot(Growth~P.taeda+P.pinea, ylab='Fungal Growth (mm/ day)',xlab='Presence/Absence of Pine sap (P.taeda:P.pinea)')

# interaction.plot(P.taeda,P.pinea,Growth,type='b')
# interaction.plot(X1,X2,Y)
# X1 and X2 are the categorical predictor variables
# Y (growth) is our quantitative response variable
# Our plot shows that the presence of sap from either pine species reduces fungal growth rate
# There's also a negative interactino between the species such that the presence of both is less effective than you'd expect from the reduction in growth caused by each species in isolation

# Testing for differences between control treatment and each other treatment using group contrasts:
MyFit=lm(Growth~P.taeda * P.pinea, data=MyData)
# Alternatively, we could write: MyFit=lm(Growth~P.taeda + P.pinea + P.taeda:P.pinea, data=MyData)
summary(MyFit)
# Lines 1, 2, and 3 can be interpreted the same way as in single-factor ANOVA
# Line 1: control treatment
# Line 2: P.taeda with respect to control treatment
# Line 3: P.pinea with respect to control treatment
# Line 4
# Shows the interaction effects between P.taeda AND P.pinea relative to the control
# If the two species were purely additive, then the growth rate would equal sum of that of lines 2 and 3 (purely addititive = -2.06-2.30 = -4.36). Our LS mean growth is 1.74, however, which means that it is +1.74 higher than the purely additive case. Thus, our interaction growth rate is -4.36+1.74 = -2.62 relative to the control. Therefore, the actual growth rate = rate_control - rate_interaction = 4.93-2.62 = 2.31 mm/day
# t-test evaluates null hypothesis that the interaction (difference between observed growth and the purely additive case) is zero
# since p<0.05, we conclude that there is an interaction between the sap of the two species


# Using F-table to evaluate general significance of each factor in the model, rather than just test against zero:
summary(aov(MyFit))
# Line 1: F-test for main effects P.taeda
# Line 2: F-test for main effects P.pinea
# Line 3: F-test for the interaction

# Evaluating assumptions of ANOVA

# Evaluating normality
MyRes = residuals(MyFit)
hist(MyRes, main='',xlab="Residuals", freq = FALSE)
xfit=seq(min(MyRes),max(MyRes),length=100) #new x variable
yfit=dnorm(xfit,0,sd(MyRes)) #predicted Normal
lines(xfit, yfit, col="blue") #add a blue line
shapiro.test(MyRes)
# Since p>0.05, fail to reject the null hypothesis that residuals are normally distributed

# Evaluating homoscedasticity
plot(MyFit,1)
bartlett.test(split(Growth, list(P.taeda, P.pinea)), data=MyData)
# Since p>0.05, fail to reject null hypothesis that variances are homoscedastic

# Group test using contrasts

# Contrasts provide a way to disentangle interactions by comparing cells in the ANOVA table (e.g. P.taeda in isolation vs. control)
library(contrast) # loading the contrast library

# testing whether both saps are different from just P.taeda:
a=list(P.taeda=c("yes"), P.pinea=c("yes"))
b=list(P.taeda=c("yes"), P.pinea=c("no"))
contrast(MyFit,a,b)
# p_1 = 0.0117

# testing whether both saps are different from just P.pinea:
a=list(P.taeda=c("yes"), P.pinea=c("yes"))
b=list(P.taeda=c("no"), P.pinea=c("yes"))
contrast(MyFit,a,b)
# p_2 = 0.1232

# Calculating the type I error rate for each contrast
alphaF=0.05
m = 2 # number of contrasts
alphaC=1-(1-alphaF)^(1/m) 
alphaC
# alphaC = 0.0253

# Since p_1 < alphaC, reject the null hypothesis and conclude that both saps combined are significantly different than just P.taeda alone
# Since p_2 > alphaC, fail to reject the null hypothesis and conclude that both saps combined are not significantly different than just P.pinea alone
# Conclusion: having both saps together slows down fungal growth compared to just P.taeda, but not compared to just P.pinea
 