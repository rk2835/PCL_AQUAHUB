def main():

    x = int(input("Enter a number to square: "))
    print(f"The square of {x} is {square(x)}")

def square(num):
    """Returns the square of a number."""
    return num * num

main()