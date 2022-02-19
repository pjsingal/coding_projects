# Week 1 Software Skill Guide

#1
str_common = c(0.17,	0.2,	0.13,0.2,	0.24,0.25,0.15,0.21,0.24)
str_transA = c(0.27,0.21,0.34,0.32,0.24,0.29,0.18,0.2,0.29)
str_transB = c(0.25,0.33,0.37,0.33,0.31,0.27,0.3,0.3,0.28)

#2
mean(str_transA) - mean(str_transB)

#3
q3 = mean(str_common) - mean(str_transA)
print(q3)

if (q3 > 0) {
	print("Common Strain has larger concentration of hydrogen peroxide")
} elseif (q3 = 0) {
	print("Common Strain and Trans Strain A have equal concentrations of hydrogen peroxide")
} else {
	print("Trans Strain A has larger concentration of hydrogen peroxide")
}

#4
peroxide = c(0.27,0.21,0.34,0.32,0.24,0.29,0.18,0.2,0.29)
growth = c(1.79,1.01,0.71,1.59,1.41,1.15,1.03,1.2,1.2)

plot(growth, peroxide, xlab="Peroxide Concentration", ylab="Fungal Growth Rate")