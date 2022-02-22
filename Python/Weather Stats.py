# "Weather Stats"
# Created by Patrick Singal on 17 June, 2021

# This program analyzes Toronto monthly weather data between the years 1938 and 2018 (inclusive).
# The user is prompted to enter a valid month/year. The program will return the amount of rainfall [mm] that occurred in that month.
# The program identifies the highest/lowest temperature, rainfall, and snowfall that occurred in any single month, and the month in which that occurred.
# The program also displays the lowest/median/highest annual snowfall, and the year in which that occurred.
# It also displays the lowest/median/highest mean temperature that ooccurred in any single month, and the month in which that occurred.
# Lastly, the program computes the annual mean temperature for each year (excluding those w/ <12 months of data), and saves the results to a text file ("YearMeans.txt").

import os

package_dir = os.path.dirname(os.path.abspath("coding_projects"))
PATH = package_dir + "/Python/Datasets/"

## 1. FUNCTIONS PROVIDED BY ASSIGNMENT TEMPLATE
def main():
    # Read the data
    db = readData("TorontoWeatherData.csv")
    # Un-comment these lines to make sure your sort has worked properly.
    #print("Before sorting, as read from file:")
    #showSome(db)
    addYearMonthKey(db)
    insertionSort(db, 'yearmonth')
    #print("\nAfter sorting by date:")
    #showSome(db)

    # Test your binary search by searching for the rainfall amount for a user-
    # supplied year and month.
    searchYear = getInt("Enter year for rainfall search: ", 1938, 2018)
    searchMonth = getInt("Enter month for rainfall search: ", 1, 12)
    searchYearMonth = 100 * searchYear + searchMonth
    try:
        rainfall = findRain(db, searchYearMonth)
        print("Rainfall was {0} mm.".format(rainfall))
    except ValueError as message:
        print(message)

    # Test your findMax and findMin functions by locating some extremes.
    # These two functions return a single record which is a dictionary.
    maxR = findMax(db, 'maxT')
    print("\nHighest temperature {0} deg C, in month {1}, {2}.".format(maxR['maxT'], maxR['month'], maxR['year']))
    minR = findMin(db, 'minT')
    print("Lowest temperature {0} deg C, in month {1}, {2}.".format(minR['minT'], minR['month'], minR['year']))
    maxR = findMax(db, 'rain')
    print("Highest rainfall {0} mm, in month {1}, {2}.".format(maxR['rain'], maxR['month'], maxR['year']))
    maxR = findMax(db, 'snow')
    print("Highest snowfall {0} cm, in month {1}, {2}.".format(maxR['snow'], maxR['month'], maxR['year']))

    # annualSnow is a list of dictionaries, where each dictionary holds the year and the total snowfall
    # for that year.
    annualSnow = getAnnualSnow(db)
    insertionSort(annualSnow, 'totalsnow')
    minR = annualSnow[0]
    print("\nLowest annual snowfall {0} cm, in {1}.".format(minR['totalsnow'], minR['year']))
    medR = annualSnow[len(annualSnow) // 2]
    print("Median annual snowfall {0} cm.".format(medR['totalsnow']))    
    maxR = annualSnow[len(annualSnow) - 1]
    print("Highest annual snowfall {0} cm, in {1}.".format(maxR['totalsnow'], maxR['year']))
    
    # Sort your data again, by mean temperature this time.  This is the only way you can get the median
    # value, which is defined as the middle of a sorted set of values.
    insertionSort(db, 'meanT')
    minR = db[0]
    print("\nLowest mean temperature {0} deg C, in month {1}, {2}.".format(minR['meanT'], minR['month'], minR['year']))
    medR = db[len(db) // 2]
    print("Median mean temperature {0} deg C.".format(medR['meanT']))
    maxR = db[-1]
    print("Highest mean temperature {0} deg C, in month {1}, {2}.".format(maxR['meanT'], maxR['month'], maxR['year']))

    # Look for Global Warming!
    saveAnnualMeanTemp(db, 'YearMeans.txt')

def readData(filename):
    '''Reads the weather data from the supplied filename. The function returns a list of
dictionaries, where each dictionary consists of the data for a particular month.'''
    fileIn = open(PATH+filename, 'r')
    allData = []
    line = fileIn.readline()
    while line != "":
        line = fileIn.readline().strip()
        if line != "":
            values = line.split(',')
            monthData = {}
            monthData['year'] = int(values[0])
            monthData['month'] = int(values[1])
            monthData['meanT'] = float(values[2])
            monthData['maxT'] = float(values[3])
            monthData['minT'] = float(values[4])
            monthData['rain'] = float(values[5])
            monthData['snow'] = float(values[6])
            allData.append(monthData)
    fileIn.close()
    return allData

def showSome(allData):
    '''A convenience function that prints the beginning and end portions of the supplied list.'''
    for i in range(10):
        print(allData[i])
    print("<snip>")
    for i in range(-10, 0):
        print(allData[i])

def getInt(prompt, lowLimit=None, highLimit=None):
    '''A robust function that is sure to return an int value between the two
supplied limits.'''
    numberOK = False
    while not numberOK:
        try:
            userNum = int(input(prompt))
            if lowLimit != None and userNum < lowLimit:
                print("The number must be higher than", lowLimit)
                print("Please try again.")
            elif highLimit != None and userNum > highLimit:
                print("The number must be lower than", highLimit)
                print("Please try again.")
            else:
                numberOK = True
        except ValueError:
            print("Your entry is not a valid integer, please try again.")
    return userNum

def addYearMonthKey(allData):
    '''Calculates and adds a key:value pair to each dictionary in the supplied list.
The key will be named 'yearmonth' and will have a value of (100 * year + month).'''
    for monthData in allData:
        monthData['yearmonth'] = monthData['year'] * 100 + monthData['month']


## 2. FUNCTIONS WRITTEN BY PATRICK SINGAL
def insertionSort(allData, key):
    '''Sorts the supplied list of dictionaries in situ into increasing order
by the key name supplied.'''
    for i in range(1, len(allData)) :
        elem = allData[i] # find a monthly entry in the data
        j = i
        while j>0 and elem[key]<allData[j-1][key] : 
            allData[j] = allData[j-1] # move all elements above 'elem' up by one position
            j = j-1
        allData[j] = elem # put elem at position j
    return allData

def findRain(allData, target):
    '''Uses a binary search to locate rainfall amounts in mm from the supplied list of
dictionaries.  target is a date in the 'yearmonth' value format.  The function assumes
that the list has been sorted by increasing date.  The function will raise a ValueError
exception if the year and month in target do not exist in allData.'''
    low = 0
    high = len(allData)-1
    while low <= high :
        mid = (low + high) // 2
        if target < allData[mid]['yearmonth'] : 
            high = mid-1 # target lies in lower half of range, so tighten search boundaries accordingly and then repeat
        elif target > allData[mid]['yearmonth'] :
            low = mid+1 # target lies in upper half of range, so tighten search boundaries accordingly and then repeat
        else:
            return allData[mid]['rain']
    raise ValueError("Target not found.")

def findMax(allData, key):
    '''Returns the record from allData that has the maximum value for the supplied key.'''
    maxVal = allData[0]
    i = 1
    while i < len(allData) :
        if allData[i][key] > maxVal[key] : 
            maxVal = allData[i] # The greatest value that we've seen in allData so far. It will be updated again if a greater value is found further down the list.
        i += 1
    return maxVal

def findMin(allData, key):
    '''Returns the record from allData that has the minimum value for the supplied key.'''
    minVal = allData[0]
    i = 1
    while i < len(allData) :
        if allData[i][key] < minVal[key] :
            minVal = allData[i] # The lowest value that we've seen in allData so far. It will be updated again if a lower value is found further down the list.
        i += 1
    return minVal   

def getAnnualSnow(allData):
    '''This function returns a list of dictionaries which consist of the total
snowfall for every year listed in allData.  Each record will consist of
{'year' : ####, 'totalsnow' : ###.#}, where # is a number.  There will be one record per year.
It does not matter if any month records are missing, the total snowfall is still calculated, by
assuminng zero snow for the missing months.''' 
    allSnow = []
    i=0
    while i<len(allData)-1 :
        snowData = {}
        snowData['year']=allData[i]['year']
        totalSnow = allData[i]['snow']  
        while True :
            try :
                if allData[i]['year'] == allData[i+1]['year'] : # the next line in allData refers to the same yeay. Compile all monthly data within that year before moving on.
                    totalSnow+=allData[i+1]['snow']
                    i+=1
                    continue
                else: # the next line in allData refers to a different year, so move on without updating our count of total snow
                    i+=1
                    break
            except IndexError:
                break   
        snowData['totalsnow'] = round(totalSnow,2) # enter the total amount of snow in one year as a value in the dictionary, rounded to 2 decimal places
        allSnow.append(snowData)
    return allSnow

def saveAnnualMeanTemp(allData, filename):
    '''This function calculates the mean temperatures for an entire year and saves this
data to the supplied file - one line in the file per year.
It is assumed that each year from 1938 to 2012 has 12 months.'''
    insertionSort(allData, 'yearmonth') # ensures that the dataset is sorted chronologically
    allMeanTemp = []
    i=0
    while i<len(allData)-1 :
        meanTempData = {}
        meanTempData['year']=allData[i]['year']
        monthlyMeans = [allData[i]['meanT']]     
        while True :           
            try :
                if allData[i]['year'] == allData[i+1]['year'] : 
                    monthlyMeans.append(allData[i+1]['meanT']) # if there is data for multiple months in one year, compile all of the data
                    i+=1
                    continue
                else:
                    i+=1
                    break
            except IndexError:
                break
        if len(monthlyMeans)==12 : # only append to dict the years which have 12 months of data
            meanTempData['meanTemp'] = round(sum(monthlyMeans)/12,2) # computes avg of all 12 monthly means, rounded to 2 decimal places
            allMeanTemp.append(meanTempData) # each element of the list allMeanTemp is its own dictionary {'year':##, 'meanTemp', ##}

    newfile = open(PATH+filename, 'w')
    for i in range(len(allMeanTemp)) :
        year = allMeanTemp[i]['year']
        mean = allMeanTemp[i]['meanTemp']
        newfile.write('%s, %s \n' %(year,mean)) # writes the year and corresponding mean temp. on their own line   
    newfile.close()

main()
