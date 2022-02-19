setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")
MyData=read.csv("baseball.csv", colClasses = c('factor','factor','numeric'))

league = MyData$League
field = MyData$Field
wins = MyData$Win.Percentage

boxplot(wins~league+field, ylab='Win Percentage', xlab='League:Field')
# interaction.plot(field,league,wins,type='b')


MyFit=lm(wins~field*league, data=MyData)
summary(MyFit)

# MyFit2=lm(wins~field, data=MyData)
# summary(MyFit2)
# MyFit3=lm(wins~league, data=MyData)
# summary(MyFit3)

summary(aov(MyFit))

TukeyHSD(aov(MyFit))