# "Speech Analysis"
# Created by Patrick Singal on 09 June, 2021

# This program analyzes three speeches: "PMHarperBerlinWall.txt", "PresObamaBerlinSpeech.txt", and "PresObamaInauguralAddress.txt"
# The program determines the longest word, ten most frequent words, and the number of characters (inc. spaces), words, unique words and sentences in each speech
# Numerals are excluded from analysis but spelled-out numbers are still included
# A full summary (ordered alphabetically) of the number of times each unique word is used in a speech is also saved as an independent .txt file
# The most used word over 5 letters in length that occurs in all three speeches: people

import re
import os

package_dir = os.path.dirname(os.path.abspath("coding_projects"))
PATH = package_dir + "/Python/Datasets/"

def main() : 
    try:
        rawSpeech1 = readFile("PMHarperBerlinWall.txt")                                 # opens the .txt file and reads it as a string
        rawSpeech2 = readFile("PresObamaBerlinSpeech.txt")
        rawSpeech3 = readFile("PresObamaInauguralAddress.txt")
        if len(rawSpeech1)!=0 and len(rawSpeech2)!=0 and len(rawSpeech3)!=0 :           # none of the files are empty
            # Write a .txt file w/ # of times each unique word was used in speech:
            wordFreq("PMHarperBerlinWall.txt", rawSpeech1)                              
            wordFreq("PresObamaBerlinSpeech.txt", rawSpeech2)
            wordFreq("PresObamaInauguralAddress.txt", rawSpeech3)
            # Print number of characters (inc. spaces), sentences, words, unique words,
            # longest word, and top ten most used words that are >5 letters long
            printResults("Harper's Speech", rawSpeech1)                                 
            printResults("Obama's Berlin Speech", rawSpeech2)
            printResults("Obama's Inaugural Address", rawSpeech3)
        else :                                                                  
            print("One or more file(s) are empty!")    
    except IOError :
        print("One or more file(s) could not be found.")


def readFile(fname) :                                                                   # reads a text file and converts it to a string
    file = open(PATH+fname,'r')
    rawSpeech = file.read()
    rawSpeech = rawSpeech.replace('\n',' ')                                             # replaces linefeeds with spaces
    rawSpeech = rawSpeech.replace('-',' ')                                              # replaces hyphens with spaces   
    file.close()
    return rawSpeech
    

def cleanUp(rawSpeech, sentenceDelimiter='No') :                                        # 'cleans' the raw speeches to prepare them for subsequent analysis
    cleanedUp = ""
    if sentenceDelimiter == 'Yes' :                                                     
        rawSpeech = rawSpeech.replace('?','.')                                          # replaces '?' with periods to allow consistent sentence delimiter
        rawSpeech = rawSpeech.replace('!','.')                                          # replaces '!' with periods to allow consistent sentence delimiter
        for aChar in rawSpeech :
            if aChar.isalpha() or aChar == " " or aChar == "." :                        # leaves in sentence delimeters but still eliminates all other punctuation marks and numbers
                cleanedUp = cleanedUp + aChar
    else :                                                                              
        for aChar in rawSpeech :
            if aChar.isalpha() or aChar == " " :                                        # eliminates all punctuation marks and numbers
                cleanedUp = cleanedUp + aChar 
    cleanedUp = re.sub(' +', ' ', cleanedUp)                                            # remove all instances of 2 or more consecutive spaces        
    cleanedUp = cleanedUp.lower()                                                       # puts all characters in lower-case  
    return cleanedUp

def wordFreq(fname, rawSpeech) :                                                        # writes a .txt file w/ # of times each unique word was used in a speech
    speech = cleanUp(rawSpeech)
    words = speech.split()
    uniqueWords = sorted(set(words))                                                    # set() eliminates duplicate words; sorted() puts the list in alphabetical order
    freq = {}
    for i in uniqueWords :                                                              # each element in uniqueWords will be a key in the dictionary 'freq'
        freq[i] = words.count(i)                                                        # adds num. of times each keyword occurs in original wordlist as that key's corresponding value in dict.
        
    newFname = fname[:len(fname)-4] + "WordFrequency.txt"                               # strips the original ".txt" file ending so that "WordFrequency.txt" can be added to the end instead
    newfile = open(newFname, 'w')
    for key,value in freq.items() :
        newfile.write(key + ' : ' + str(value) + '\n' )                                 # writes each key/value pair on its own line in the new file
    newfile.close()

def countSentences(rawSpeech) :                                                         # counts number of sentences in speech
    speech = cleanUp(rawSpeech,sentenceDelimiter='Yes')                                 # overrides cleanUp()'s default argument that sentenceDelimiter=='No'
    sentenceList = speech.split('.')                                                    # periods delimit sentences, so we'll split "speech" at these points
    numSentences = len(sentenceList)
    return numSentences

def countChars(rawSpeech) :                                                             # counts number of characters (including single spaces) in speech
    speech = cleanUp(rawSpeech)
    numChars = len(speech)
    return numChars

def countWords(rawSpeech) :                                                             # counts number of words, number of unique words, and % of unique words in speech
    speech = cleanUp(rawSpeech)
    words = speech.split()
    numWords = len(words)
    numUniqueWords = len(set(words))
    return numWords, numUniqueWords

def longestWord(rawSpeech) :                                                            # determines the single longest word in speech
    speech = cleanUp(rawSpeech)
    words = speech.split()
    longestWord = max(words, key=len)                                                   # searches the 'words' for the string of maximum length
    return longestWord

def topTenWords(rawSpeech) :                                                            # returns some of the 10 most used words (>5 letters in length) in speech
    speech = cleanUp(rawSpeech)
    words = speech.split()
    longWords = []
    for i in words :
        if len(i) > 5 :
            longWords.append(i)                                                         # longWords only stores words over 5 letters in length 
    uniqueLongWords = set(longWords)                                                    # same as longWords, but without duplicates
    freq = {}
    for i in uniqueLongWords :                                                          # each element in uniqueLongWords will be a key in the dictionary 'freq'
        freq[i] = words.count(i)                                                        # adds num. of times each keyword occurs in original wordlist as that key's corresponding value in dict.
    topTenFreqs = sorted(freq.values())[-10:]                                           # sorts the list of dict values in ascending order and takes only the final 10 elements
    topTenKeys = []
    for val in topTenFreqs :
        for key in freq.keys() :
            if freq[key] == val and key not in topTenKeys :                             # prevennts the same key from being appended to the list twice
                topTenKeys.append(key)                                                  # finds the key corresponding to each of the top 10 most frequent unique long words
                break           
    topTen = [topTenKeys, topTenFreqs]
    return topTen

def printResults(title, rawSpeech) :
    print("\n\n%s:\n" %(title))                                                         # prints speech's title (e.g. "Harper's Speech: ")
    print("%i characters." %(countChars(rawSpeech)))                              
    print("%i sentences." %(countSentences(rawSpeech)))                    
    numWords = countWords(rawSpeech)[0]
    numUnique = countWords(rawSpeech)[1]
    pctUnique = numUnique/numWords*100                                                  # computes the percentage of unique words relative to total
    print("%i words." %(numWords))
    print("%i unique words." %(numUnique))
    print("%.1f percent of the words are unique." %(pctUnique))
    print("Longest word is:", longestWord(rawSpeech))
    topTen = topTenWords(rawSpeech)
    print("\nMost used words over 5 letters are: ")
    for i in range(len(topTen[0])) :
        print("%s: %i times" %(topTen[0][i], topTen[1][i]))

main()
