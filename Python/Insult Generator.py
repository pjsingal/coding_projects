# "Shakespearean Insult Generator"
# Created by Patrick Singal on 01 June, 2021
# This program allows a user to randomly generate a desired number of insulting Shakespearean phrases
# The desired number must be between 100 and 10,000 phrases (inclusive)
# All phrases take the form of "Thou [adjective] [adjective] [noun]!"

import random 
import os

package_dir = os.path.dirname(os.path.abspath("coding_projects"))
PATH = package_dir + "/Python/Datasets/"

def main() :
    random.seed()
    # Using default arguments wherever possible.  Input files: word1.txt,
    # word2.txt, word3.txt.  1000 insults generated, saved to file Insults.txt.
    # allWords is a tuple of three lists.
    allWords = loadInsults()
    print("One insult: ", end="")
    print(generateInsult(allWords))
    insults = generateInsults(allWords)
    displaySomeInsults(insults)
    saveInsults(insults)
    if checkInsultsFile() :
        print("\n1000 insults properly saved in coding_projects/Python/Datasets. They are unique and in order.")
    else :
        print("\nThe insults are not properly generated or saved!")
    # Using all possible arguments and prompting the user for the number of insults.
    allWords = loadInsults("word1.txt", "word2.txt", "word3.txt")
    numInsults = getNumInsults()
    insults = generateInsults(allWords, numInsults)
    displaySomeInsults(insults)
    saveInsults(insults, "Insults.txt")
    if checkInsultsFile(numInsults, "Insults.txt") :
        print("\n" + str(numInsults) + " insults properly saved in coding_projects/Python/Datasets. They are unique and in order.")
    else :
        print("\nThe insults are not properly generated or saved!")
        
def getNumInsults():
    while True:
        try:
            val = int(input("\nHow many insults would you like to generate? "))             # User inputs their value
            if val >= 100 and val<=10000:                                                   # User's input falls within the allowable range
                break
            else:                                                                           # Input does not fall within the allowable range
                print("Number must be between %s and %s (inclusive)" %(100, 10000))
                continue                                                                    # User is prompted to enter another input. Loop continues until a valid input is given.
        except ValueError:
            print("Please enter integer values only.")
    return val

def readFile(fname) :                                                                       # Reads a text file and converts it to a list
    inFile = open(PATH+fname, 'r')
    fileContentsList = []
    for line in inFile :                                                                    # Each element in list represents one line of text from original file
        fileContentsList.append(line.rstrip())
    inFile.close()

    return fileContentsList

def loadInsults(fname1="word1.txt",fname2="word2.txt",fname3="word3.txt") :                 # Creates a tuple of three word lists that were generated using readFile(fname)
    allWords = (readFile(fname1),readFile(fname2),readFile(fname3))
    return allWords

def generateInsult(allWords) :                                                              # Creates a single randomly-generated insult
    words = []
    for i in range(3) :                                                                     # range(3) causes loop to run 3 times, thereby generating our 3 random words
        rdmIndx = random.randint(0,49)                                                      # A random integer index between 0 and 49, inclusive. Max=49 b.c. each list inside allWords has len=50
        words.append(allWords[i][rdmIndx])
    statement = ' '.join(['Thou',words[0],words[1],words[2]]) + '!'                         # The random insult takes the form "Thou [adjective] [adjective] [noun]!"
    return statement

def generateInsults(allWords, numInsults=1000) :                                            # Creates an alphabetically-ordered list of len=numInsults, where each element is a unique and random insult
    insults = []
    while len(insults) <= numInsults-1 :
        newInsult = generateInsult(allWords)
        if newInsult not in insults :                                                       # Only adds the newInsult to master list (insults) if does not already exist in the master list
            insults.append(newInsult)
    return sorted(insults)                                                                  # Alphabetically orders the completed list of insults

def displaySomeInsults(insults) :                                                           # Prints the first 10 and last 10 elements of the list of insults
    print("\nSome insults: \n")
    for elem in insults[:10] :
        print(elem)
    print('.\n<snip>\n.')
    for elem in insults[-10:] :
        print(elem)

def saveInsults(insults, fname="Insults.txt") :                                             # Saves the list of insults to a text file, with each element of list written on its own line
    newfile = open(PATH+fname, 'w')
    for elem in insults :
        newfile.write(elem + '\n')
    newfile.close()

def checkInsultsFile(numInsults=1000, fname="Insults.txt") :                                # Verifies that insults stored in text file are correct in quantity, alphabetically-ordered, and all unique 
    insults = readFile(fname)
    numUnique = len(set(insults))                                                           # Sets, unlike lists, eliminate any duplicated values
    if insults==sorted(insults) and numUnique==numInsults :
        return True
    else :
        return False
    
main()

