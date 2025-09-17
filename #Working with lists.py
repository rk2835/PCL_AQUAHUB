#Working with lists 

list = ["History","Science","Maths"]
print(list[2]) #Returns index[2] which is maths 
print(list[-2]) #Returns index[2] from the back 
print(list[:2]) #All the way to 2 , not including 2 
print(1,2) #Science and Maths 

#List Methods 
#Append is used to add

list.append("Art")
print(list)

#Insert at specific area , takes locations and insert

list.insert(1,"Art")

#Extend adds multiple values 

list2 = ["Money", "Health"]

list.extend(list2) #Takes just one arguement 

#Removing values 

list.remove("Maths")
print(list)

#Reverse a list
list.reverse()
print(list)

#Sorting 
nums = [1,2,3,43,4,5,56,6,67,4,7,87,8,8]
sorted_list = nums.sort()
print("sorted: ",sorted_list)
print(max(nums))
nums.sort(reverse=True) #Descening order

#Membership operator

print("Eng "in list)

#List Looping 

for index , list in enumerate (courses,start=1):
    list

#Sets 

cs_courses = {"Python","DSA","OS","Digital Design"}
art_courses = {"Digital Design","Painting","Industrial Design","AutoCAD"}
print(cs_courses.intersection(art_courses)) #Found in both
print(cs_courses.difference(art_courses)) #Only in cs 
print(cs_courses.union(art_courses)) #All courses 

empty_set = set()





