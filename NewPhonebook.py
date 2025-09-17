#Phonebook crud 

#Defining variables

contacts_list = []
target = ""
userchoice = "0"

#Menu

while True:
    print("Welcome to Phonebook!")
    print("Press 1 to view contact list")
    print("Press 2 to add contacts")
    print("Press 3 to delete contacts ")
    print("Press 4 to update contacts")
    print("Press 5 to search contacts")
    print("Press 6 to exit ")
    userchoice = int(input("Enter your choice! : "))

#Defining Functions 

    def view(contacts_list):
            print(contacts_list)

    def add(contacts_list):
        n = int(input("How many new contacts do you want to add"))
        contacts_list = {input("Enter Name: "): input("Enter Phone: ") for _ in range(n)}

    def delete(contacts_list , target):
         target = str(input("Enter name of contact for deletion"))
         if target == contacts_list.get("Name"):
              del contacts_list["Name"]

    def update(contacts_list, target):
        target = str(input("Enter name of contact for deletion"))
        if target == contacts_list.get("Name"):
              Name = input("Enter name ")
              phone = input("Enter phone: ")
              contacts_list.update({Name:phone})
              print(contacts_list)

    def search(contacts_list, target):
        target = str(input("Enter name of contact to search"))
        if target == contacts_list.get("Name"):   
             print(contacts_list)
        else:
             print("Not found")                  


#Selecting user choice 

    if userchoice == 1:
        view(contacts_list)
    elif userchoice == 2:
         add(contacts_list) 
    elif userchoice == 3:
         delete(contacts_list, target)
    elif userchoice == 4:
         update(contacts_list, target)
    elif userchoice == 6:
         search(contacts_list, target)
    else:
         break                       
    
