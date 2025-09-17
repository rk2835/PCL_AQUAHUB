#Tip calculator 

menu = {
    "Apple": 4, "Banana":6,"Cream Cakes":23
}
orders ={}
print(menu)
while True:
    item = input("What would you like to buy ? Please Select from the list, type done if you finished ")
    if item == 'done':  #If user types done , the program stops 
        break
    if item not in menu: #If user types an option not in menu 
        print("Item is currently unavailable, please select from the above options ")

    quantity = int(input("How many would you like to order"))   
    if quantity == 0:
        print("Number must be graeter than zero")
        continue

    orders[item] = orders.get(item,0) + quantity 

    total = sum(menu[item] * quantity for item, quantity in orders.items())
tip = 0.20 * total
grand_total = total + tip
print(grand_total)