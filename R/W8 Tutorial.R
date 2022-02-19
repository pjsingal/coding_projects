# Study question: does the proportion of Texans who affiliate as Republican, None, or Democratic vary across race/ethnicity?
# H0: party leaning is independent of ethnicity
# HA: party leaning is not independent of ethnicity

votes = matrix(c(800, 24, 172, 193, 39, 214, 386, 200, 304), ncol=3)
colnames(votes) = c("Republican", "None", "Democratic")
rownames(votes) = c("White", "Black", "Latino")
votes.table = as.table(votes)
votes

# Marginal distribution (all)
a = sum(votes[1:3,1:3])
a

# Marginal distribution (rows)
sum(votes[1,1:3])/a
sum(votes[2,1:3])/a
sum(votes[3,1:3])/a

# Marginal distribution (columns)
sum(votes[1:3,1])/a
sum(votes[1:3,2])/a
sum(votes[1:3,3])/a

# Observed X^2
chisq.test(votes)

# Critical X^2
alpha = 0.05
nrows = 3
ncols = 3
df = (nrows-1)*(ncols-1)
qchisq(1-alpha, df)