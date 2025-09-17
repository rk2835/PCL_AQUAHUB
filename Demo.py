
target = 9
nums = [2,7,8,9,0,8,6,5,3]
matches = []
for i in range(len(nums)-1):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            print ([i,j])

            
    
        
        


