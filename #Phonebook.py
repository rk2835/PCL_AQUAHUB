#Phonebook

#Here we shall define a list with a dictionary in it for each contact
#We should be able to add, update , delete , show and sort contacts 

#Define datatype 
Entires =[]

#Define functions for each operation

#AddContact
def addcontact():
    name = input("Enter name: ")
    phone = input("Enter phone: ")
    Entires.append({"name": name,"Phone":phone}) #Append name and phone into entries as a dictionary
    print("Added!")

def deletecontact():
    target = input("Enter target to delete")
    for entry in Entires:
        Entires.remove(target)
        print("Contact deleted")

def updatecontact():
    target = input("Enter target to delete")
    if target in Entires:
        Entires.target({"name": name,"Phone":phone}) #Append name and phone into entries as a dictionary
    print("Added!")
