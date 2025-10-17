number = int(input("Enter the number you wish to factorize: "))

if number < 0:
        print("Factorial is not defined for negative numbers.")
elif number == 0:
        fact = 1
        print(f"The factorial of {number} is {fact}")
else:
        fact = 1  # Initialize fact to 1
        for i in range(1, number + 1):
            fact *= i
        print(f"The factorial of {number} is {fact}")