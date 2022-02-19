setwd("/Users/pjsingal/OneDrive - Queen's University/University/Year 4 (III)/Summer/STAM 200")

# Tutorial Instructions
MyData=read.csv("Fertility.csv", colClasses = c('factor','factor','factor','numeric'))
str(MyData)

s1 = subset (MyData, Subgroup=='15-19 yr')
searly=subset(s1, Year=='1995-2000')
s1me = mean(searly$Fertility)
s1sde = sd(searly$Fertility)
slate=subset(s1, Year=='2000-2005')
s1ml = mean(slate$Fertility)
s1sdl = sd(slate$Fertility)

s2 = subset (MyData, Subgroup=='20-24 yr')
searly=subset(s2, Year=='1995-2000')
s2me = mean(searly$Fertility)
s2sde = sd(searly$Fertility)
slate=subset(s2, Year=='2000-2005')
s2ml = mean(slate$Fertility)
s2sdl = sd(slate$Fertility)

s3 = subset (MyData, Subgroup=='25-29 yr')
searly=subset(s3, Year=='1995-2000')
s3me = mean(searly$Fertility)
s3sde = sd(searly$Fertility)
slate=subset(s3, Year=='2000-2005')
s3ml = mean(slate$Fertility)
s3sdl = sd(slate$Fertility)

s4 = subset (MyData, Subgroup=='30-34 yr')
searly=subset(s4, Year=='1995-2000')
s4me = mean(searly$Fertility)
s4sde = sd(searly$Fertility)
slate=subset(s4, Year=='2000-2005')
s4ml = mean(slate$Fertility)
s4sdl = sd(slate$Fertility)

s5 = subset (MyData, Subgroup=='35-39 yr')
searly=subset(s5, Year=='1995-2000')
s5me = mean(searly$Fertility)
s5sde = sd(searly$Fertility)
slate=subset(s5, Year=='2000-2005')
s5ml = mean(slate$Fertility)
s5sdl = sd(slate$Fertility)

s6 = subset (MyData, Subgroup=='40-44 yr')
searly=subset(s6, Year=='1995-2000')
s6me = mean(searly$Fertility)
s6sde = sd(searly$Fertility)
slate=subset(s6, Year=='2000-2005')
s6ml = mean(slate$Fertility)
s6sdl = sd(slate$Fertility)

delta1m = s1me - s1ml
delta1sd = s1sde - s1sdl
delta1m
delta1sd

delta2m = s2me - s2ml
delta2sd = s2sde - s2sdl
delta2m
delta2sd

delta3m = s3me - s3ml
delta3sd = s3sde - s3sdl
delta3m
delta3sd

delta4m = s4me - s4ml
delta4sd = s4sde - s4sdl
delta4m
delta4sd

delta5m = s5me - s5ml
delta5sd = s5sde - s5sdl
delta5m
delta5sd

delta6m = s6me - s6ml
delta6sd = s6sde - s6sdl
delta6m
delta6sd

means = c(delta1m, delta2m, delta3m, delta4m, delta5m, delta6m)
sds = c(delta1sd, delta2sd, delta3sd, delta4sd, delta5sd, delta6sd)

means

sds