## W6 Practice Problems

## Generating the plot in Q1 and Q2

meanthrows = c()
for(i in 1:100){                        # loop repeats 100 times
	throws = runif(10, min=1, max=6)    # runif generates 10 samples from a uniform distribution from 1 to 6 (like rolling 10 dice), and puts them into throws (a vector)
	meanthrows[i]=mean(throws)          # plugs the mean value of throws into the meanthrows vector; loop will plug in 100 terms (according to the range of i)
}

hist(meanthrows) # histogram of 100 means of 10 simulated dice