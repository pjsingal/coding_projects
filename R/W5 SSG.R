# W5 SSG

# pnorm(x,mean,sd) calculates probability of observing a value of x or smaller.
# qnorm(p, mean, sd) calculates upper threshold that corresponds to the requested probability.
# pbnorm(x, n, p) calculates propability of observing x successes out of n trials, given a probability of p. Returns an integer.
# pbnorm(x, n, p) calculates propability of observing x successes out of n trials, given a probability of p. Returns an integer.

# Self Assessment

# a) Calculate probability of observing an event < 1.2 from a Normal distribution with mean=1 and sd=1.5
pnorm(1.2,1,1.5)

# b) Calculate probability of observing an event > -1 from a Normal distribution with mean=0 and sd=1
1-pnorm(-1,0,1)


# c) What is the upper threshold of the event range for a probability of 0.25 from a Normal distribution with mean=0.3 and sd=0.5?
qnorm(0.25,0.3,0.5)