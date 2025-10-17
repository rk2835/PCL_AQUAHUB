name  = input("Enter your name: ") #Ask for user's name

#Remove any leading or trailing whitespace

name = name.strip()
name = name.capitalize()
name = name.title() #Capitalize the first letter of each word

print("Hello,",name , "!") #print user name 