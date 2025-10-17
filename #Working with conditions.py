#Functions 

def hello_functions():
    print("Helllo!")

#print(hello_functions()) #Prints the fuctions
# funtions create reusability
# easy code maintainance and updates 
# return is for machines 
# it returns the value that can be used all over the program

print(len('Applesauce'))
#String functions 
# print("lowercase").upper()

def hello(greeting):
    return'{} Function.'.format(greeting)
print(hello("Hi")) 

#Positional Arguements 

def studentinfo(*args, **kwargs):
    print(args)
    print(kwargs)