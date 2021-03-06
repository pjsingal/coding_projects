# "Mortgage Payments"
# Created by Patrick Singal on 26 May, 2021

# This program allows a user to compute various metrics related to their mortgage
# The user enters the principal amount borrowed, annual % interest rate, and term length, and then decides whether they would like to account for lump-sum anniversary payments as well
# The output displays the remaining principal to-be-paid on a month-by-month basis, which declines from the principal amount borrowed in month 0 until it reaches $0.00 in month X
# If anniversaries are NOT selected, then month X will coincide with the term length provided by the user
# If anniversaries ARE selected, then month X will be reached before the term ends, and the user will be notified as to how many months early they have managed to pay their mortgage
# The cumulative total interest, monthly payments, anniversary payments (if selected), and total mortgage cost will be printed as well. 



#### SETUP

import numpy as np
import pandas as pd
import math



#### PART A: OBTAINING INPUT PARAMETERS

def getNumInput(query, rangemin, rangemax):
    while True:
        try:
            val = int(input(query))                                   # User inputs their value
            if val >= rangemin and val<=rangemax:                     # User's input falls within the allowable range
                break
            else:                                                     # Input does not fall within the allowable range
                print("Please enter a numerical value between %s and %s (inclusive)" %(rangemin, rangemax))
                continue                                              # User is prompted to enter another input. Loop continues until a valid input is given.
        except ValueError:
            print("Please enter integer values only.")
    return val

def getPayOption():
    while True:
        payOption = input("Would you like to enable anniversary payments? [y/n] ")
        if payOption == 'y' or payOption == 'yes' or payOption == 'n' or payOption == 'no':
            break                                                     # User has entered one of the acceptable options.
        else:
            print("Invalid input. Please try again.")
            continue                                                  # User is prompted to enter another input. Loop continues until an acceptable input has been entered. 
    return payOption



#### PART B: COMPUTING MONTHLY PRINCIPALS AND TOTAL PAYMENTS
def getNewP(i,A,allP,optArg=0):                                       # optArg=0 by default and is optional; it is non-zero only if anniversaries need to be considered
    amountToPay = A-allP[-1]*i/100                                    
    newP = allP[-1] - amountToPay - optArg                            # calcs remaining principal based on A, i, the most recent principal, and the anniv payment (optional)
    newP = math.ceil(newP*100)/100                                    # rounds the remaining principal up to the nearest cent
    return newP

def chooseAnnivMethod(A,i,allP,allAnnivs,annivType):                  # 'annivType' refers to either the $5,000 or 5% anniversary payment scheme
    s = "Anniv. payment: ${:,.2f}, principal: ${:,.2f}"               # creates a string that will be stored in allAnnivs and ultimately printed at end of a 12-month stretch
    allAnnivs.append(s.format(annivType, allP[-1] - annivType))       # calcs remaining principal using getNewP() WITH the anniversary payment being considered
    newP = getNewP(i,A,allP,annivType)
    if newP >= 0:
        allP.append(newP)                                             # only append newP to the master list allP if it is positive
        return True                                                   
    else:
        return False                                                  # newP is negative, so the function is exited without changing anything

def calcWithAnniv(P,i,A):
    allP = [P]                                                        # master list of monthly principals; initial value is P given by user
    allAnnivs = []                                                    # master list of anniversary statements produced by running chooseAnnivMethod() within 'while' loop
    totalInterest = 0.                                                # running total of interest paid
    totalMonthly = 0.                                                 # running total of monthly fees paid
    totalAnniv = 0.                                                   # running total of anniversary payments

    while True:
        length = len(allP)
        if (length==13) or (length>13 and (length-1)%12==0):          # when a year has just ended and anniversary payments must be considered
                                                                      # year 1 ends @ allP[12] (len=13) b.c. allP[0] represents P_initial @ month 0 
                                                                      # all other year-ends are spaced apart in length intervals of 12
            a = 0.05*allP[-1]                                         # anniversary payment type 1: 5% of remaining principal
            b = 5000                                                  # anniversary payment type 2: flat fee of $5,000
            
            totalInterest += allP[-1]*i/100                           # interest and monthly payments are still charged as normal
            totalMonthly += A

            # Use whichever payment type is lowest:
            if a < b:                                                 
                chooseAnnivMethod(A,i,allP,allAnnivs,a)               # using 'a', append anniversary statements to allAnnivs and append the resulting newP to allP
                totalAnniv += a                                       # add 'a' to the running total of anniversary payments
            else:
                chooseAnnivMethod(A,i,allP,allAnnivs,b)               # do the same as above but with 'b' instead
                totalAnniv += b                                      
                
        else:                                                         # when in the middle of a year and anniversary payments need not be considered
            newP = getNewP(i,A,allP)
            
            if newP >= 0:
                totalInterest += allP[-1]*i/100                       # update running interest and monthly totals if newP still > 0      
                totalMonthly += A                                     
                allP.append(newP)                                     # append newP to allP if newP still > 0
                continue                                              # continue running outer 'while True' loop as long as newP still > 0

            else:                                                     # newP is no longer > 0 
                j=0
                while j < 1:                                          # only allows one more iteration to be run after newP has become negative
                    j+=1
                    continue
                
                else:                                                 # after that single iteration is run, the 'newP' used below will be a negative number
                    totalMonthly -= newP                              # subtract negative balance of newP from total payment because it was more than needed to make newP = 0
                    totalInterest -= newP*i/100                       # subtract the excess interest that was charged by the negative balance of newP
                    newP = 0                                          # the negative value of newP was 'erased' by refunding totalMonthly, so it is now zero
                    allP.append(newP)                                 # appends newP=0 to allP, which will be the final number added to allP
                    break                                             # breaks 'while True' and the external variables(e.g. allP) are not modified any further
        
    return allP, totalInterest, totalMonthly, totalAnniv, allAnnivs
    

def calcWithoutAnniv(P,i,A):                                          # similar to calcWithAnniv(), but ignores anniversary payments                                                                                                        
    allP = [P]              
    totalInterest = 0                                                 
    totalMonthly = 0                                                  

    while True:                                                       # purpose & syntax within loop is same as 1st-level nested 'else' statement in calcWithAnniv()                      
        newP = getNewP(i,A,allP)                                        
        
        if newP >= 0:
            totalInterest += allP[-1]*i/100
            totalMonthly += A
            allP.append(newP)
            continue
        else:
            j=0
            while j < 1:                                              
                j+=1
                continue
            else:
                totalMonthly -= newP                                 
                totalInterest -= newP*i/100                     
                newP = 0                                          
                allP.append(newP)
                break
    
    return allP, totalInterest, totalMonthly

        

## PART C: FORMATTING AND DISPLAYING SOME OUTPUTS

def asCurrency(values):                                               # conveniently reformats raw numbers into strings formatted as $###,###.## (e.g. $200,000.00)
    
    if type(values) == list or type(values) == np.ndarray:            # performs element-wise reformatting if the input is a list of numbers
        formattedValues = []
        for element in values:
            formattedValues.append('${:,.2f}'.format(element))        
        return formattedValues
    
    if type(values)==float or type(values)==int:                      # reformats only one number, if the input is a single number 
        formattedValue = '${:,.2f}'.format(values)                   
        return formattedValue


def printTotals(calcType):                                            # conveniently prints the total interest, monthly, mortgage, and anniversary payments (if necessary)
                                                                      # 'calcType' can be either calcWithAnniv(P,i,A), which has len=5, or calcWithoutAnniv(P,i,A), which has len=3
    totalInterest = calcType[1]                                       # index ordering is based on order of values returned by the original fxn used for 'calcType'
    totalMonthly = calcType[2]   

    if len(calcType)>3:                                               # TRUE if 'calcType' = calcWithAnniv(P,i,A), as least within the scope of this program
        totalAnniv = calcType[3]                                      # fetch the total anniversary payment from calcWithAnniv(P,i,A)
        totalMortgage = totalMonthly + totalAnniv                     # account for anniversary payment in total mortgage cost
        print('Total of anniversary payments: ', asCurrency(totalAnniv))
        
    else:                                                             # TRUE if 'calcType' = calcWithoutAnniv(P,i,A), as least within the scope of this program
        totalMortgage = totalMonthly                                  # totalMortgage does not need to account for the anniversary payment
    
    print('Total interest payments: ', asCurrency(totalInterest))     # print these values regardless of which 'calcType' input was used
    print('Total monthly payments: ', asCurrency(totalMonthly))
    print('Total cost of mortgage: ', asCurrency(totalMortgage))   
        


#### PART D: MAIN

def main():
    P = getNumInput("Enter the principal amount borrowed ($): ", 1000, 500000) # initial principal amount borrowed (1000<=integer<=500000)
    APR = getNumInput("Enter the annual interest rate (%): ", 1, 10)           # annual % interest rate (1<=integer<=10) 
    years = getNumInput("Enter the term length (years): ", 1, 30)              # number of years for repayment (1<=integer<=30)  
    payOption = getPayOption()                                                 # user selects if they want to include ('y') or exclude ('n') anniversary payments

    i = APR/12                                                        # monthly % interest rate
    n = years*12                                                      # number of months for repayment
    A = (P*i/100)/(1-(1+i/100)**(-n))                                 # monthly payment (includes interest and payments against principal; ignores anniversary payments) 

    if payOption == 'y' or payOption == 'yes':                        # user has opted to include anniversary payments
        allP = calcWithAnniv(P,i,A)[0]                                # fetches the month-by-month list of remaining principal to be paid (starts @ P, ends @ $0.00)
        allP = asCurrency(allP)                                       # applies currency formatting to each number within allP
        allAnnivs = calcWithAnniv(P,i,A)[4]                           # fetches the year-by-year list of anniversary statements (strings) 
        
        df = pd.DataFrame(data={'Principal': allP})                   # creates a dataframe to display month-by-month results (col. 1 = row numbers ['months']; col. 2 = allP)

        j=1                                                           # lower index of df to print; upper index = j+12
        w=0                                                           # index of statement to fetch from allAnnivs
        while True:
            try:
                print(df[j:j+12])                                     # prints df in one 12-month segment
                print(allAnnivs[w])                                   # prints one anniversary statement after each df segment
                j+=12                                                 # allows for the next df segment to be printed
                w+=1                                                  # allows for the next anniversary statement to be printed
                continue
            except IndexError:                                        # stop printing as soon as j or w exceeds the range of df or allAnnivs
                break                                                 
            
        print('Principal amount borrowed: ', asCurrency(P))           # print initial principal and monthly payment (constant) for user reference
        print('Monthly payment: ', asCurrency(A))
        
        printTotals(calcWithAnniv(P,i,A))                             # print total interest, monthly, mortgage, and anniversary payments

        howEarly = n-(len(allP)-1)                                    # number of months early that the mortgage was paid off
        print('Paid mortgage off %i months early.' %(howEarly))
        
    else:                                                             # similar process as above, but anniversaries are not considered
        allP = calcWithoutAnniv(P,i,A)[0]                             # here, calcWithoutAnniv(P,i,A) is used instead of calcWithAnniv(P,i,A)
        allP = asCurrency(allP)
        df = pd.DataFrame(data={'Principal': allP})                            
        print(df.to_string())                                         # df can be printed all at once since anniversaries are ignored
        print('Principal amount borrowed: ', asCurrency(P))
        print('Monthly payment: ', asCurrency(A))
        printTotals(calcWithoutAnniv(P,i,A))                          # unlike above this will only print total interest, monthly, and mortgage payments

main()
