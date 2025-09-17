#Age Calculator 

birth_yr = int(input("Enter your birth year: "))  #your birth year
current_yr = 2025
age = current_yr - birth_yr  #calculate age on earth
print(f"You are {age} years old")

mercury_age = age/  0.24 
venus_age = age / 0.62 
mars_age = age / 1.88 
jupiter_age =  age / 11.86 
saturn_age =  age/  29.45 
uranus_age =  age / 84.02 
neptune_age = age/  164.79 
pluto_age =  age / 248.24 

print("See your age on various planets!")
print("""
	   1.Mercury
	   2.Venus
	   3.Mars 
	   4.Jupiter 
	   5.Saturn 
	   6.Uranus 
	   7.Neptune 
	   8.Pluto""")
choice = int(input("Enter your choice: "))
if choice == 1:
	print(f"You are {mercury_age:.2f} years old on Mercury")
elif choice == 2:
	print(f"You are {venus_age:.2f} years old on Venus")
elif choice == 3:
	print(f"You are {mars_age:.2f} years old on Mars")
elif choice == 4:
	print(f"You are {jupiter_age:.2f} years old on Jupiter")
elif choice == 5:
	print(f"You are {saturn_age:.2f} years old on Saturn")
elif choice == 6:
	print(f"You are {uranus_age:.2f} years old on Uranus")
elif choice == 7:
	print(f"You are {neptune_age:.2f} years old on Neptune")
elif choice == 8:
	print(f"You are {pluto_age:.2f} years old on Pluto")
else:
	print("Invalid number")
	

    #Alternative to using fstrings we may use the round function round(mercury_age, 2) to round the age to 2 decimal places
