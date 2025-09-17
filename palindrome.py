word = input("Enter a word : ")

def is_palindrome(word):
    if reverse(word) == word:
        print("It is a palindrome !")
    else:
        print("Not a palindrome")    
