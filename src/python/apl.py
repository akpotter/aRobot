import string
alphabet = string.lowercase+string.digits+'-'+string.uppercase

def allstrings2(alphabet, length):
    """Find the list of all strings of 'alphabet' of length 'length'"""
    c = []
    for i in range(length):
        c = [[x]+y for x in alphabet for y in c or [[]]]
        for value in c:
        	fvalue = ''.join(value)
        	print fvalue
    return ""
    
print(allstrings2(alphabet, 5))    