#Expense Tracker 

income = int(input("Enter your income: ")) #Income 
expenses = {
    "Housing":0,
    "Food":0,
    "Electric":0,
    "Gas":0,
    "Transport":0,
    "Misc":0,

} #Categorized Expenses

"""expenses["Housing"] = int(input("Enter Rent/Mortage amt: "))
expenses["Food"] = int(input("Enter Food amt: "))
expenses["Electric"] = int(input("Enter Electric bill amt: "))
expenses["Gas"] = int(input("Enter Gas bill amt: "))
expenses["Transport"] = int(input("Enter transport cost amt: "))
expenses["Misc"] = int(input("Enter Misc amt: "))"""

for category in expenses:
    expenses[category] = int(input(f"Enter money spent on {category}: "))

total_expenses = sum(expenses.get(key,0) for key in ["Electric","Food","Gas","Housing","Misc","Transport"])
print("Your Total Expenses are : ",total_expenses)

savings = income - total_expenses #savings 
print("You save : ",savings)

print("Performance : ")

for category in expenses:
    if income == 0:
        print("Get a j*b")
        break
    percent = (expenses[category]/income)*100
    print(f"{percent:.2f}% spent on {category}")    
