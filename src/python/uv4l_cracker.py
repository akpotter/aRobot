import subprocess
import string

alphabet = string.lowercase+string.digits+'-'+string.uppercase

aux = 2340630
end = 0

while end == 0:
	#cmd = ['uv4l', '--auto-video_nr', '--driver', 'raspicam']
	cmd = ['uv4l', '--driver', 'raspicam', '--license-key', str(aux)]
	p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
	out, err = p.communicate()
	
	if 'Invalid License Key given' in err:
		print aux
		# HERE is were I try the keys
		aux = aux + 1
	else:
		print ('The lisence number is: %s' % aux)
		end = 1

def allstrings2(alphabet, length):
    """Find the list of all strings of 'alphabet' of length 'length'"""

    c = []
    for i in range(length):
        c = [[x]+y for x in alphabet for y in c or [[]]]

    return c	

