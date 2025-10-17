#Working with dictionaries 

student = {'name':'John','Age':18,"Courses":["Python","DSA"]} #Dictionary
#Print out just one key 
#Keys can be string or int 
print(student['name']) #Prints key name value 
print(student.get('age' , "Whoopsie"))

#adding to a dictionary 
student['phone'] = 333-45-433
student['Name'] = "Kaleshaw"

#Updating to a dict
student.update({'name':'Jihan','Age':18,"Courses":["Python","OS,"]})

#To see total keys 
print(len(student))
print(student.keys())

for key,value in student.items():
    print(key,value) #Access both key and value 