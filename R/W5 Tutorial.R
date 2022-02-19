setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

MyData=read.csv("branding.csv", stringsAsFactors = TRUE, colClasses = c('factor','factor','factor'))

# Question 1

colours = c('seagreen1',"yellow",'firebrick')

Econ = subset(MyData, Issue == 'Economy')
Econ$Type=factor(Econ$Type,c("Platform","Press Release Nonelection","Press Release Election"))

type = Econ$Type
year = Econ$Year

A = table(type,year)
A

barplot(A,col=colours, xlab = 'Election Year',ylab='Number of Mentions', ylim=c(0,1000), main='Mentions of the Economy in Liberal Election-Year Branding',beside=FALSE)
legend(0.2,900, title='Branding Source', c('Platform', 'Non-Election-Period Press Release','Election-Period Press Release'), col = colours,pch=19)


# # Question 2

# colours = c('firebrick','seagreen1',"yellow",'tomato1','skyblue1')
# legendnames = c('Multiculturalism', 'Social Issues', 'Social Services', "Security and International Relations", 'Economy')

# Platform = subset(MyData, Type == 'Platform')
# Platform$Issue=factor(Platform$Issue,legendnames)

# issue = Platform$Issue
# year = Platform$Year

# A1 = table(issue,year)
# A1
# barplot(A1,col=colours, xlab = 'Election Year',ylab='Number of Mentions', ylim=c(0,400), main='Mentions of Issues in Liberal Election Platforms',beside=TRUE)
# legend(1.5,400, title='Election Issue', legendnames, col = colours,pch=19)
