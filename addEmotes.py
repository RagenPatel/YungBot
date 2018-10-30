import sys
import os
import urllib
# import imagesize
import time

filename = sys.argv[1]
url = str(sys.argv[2])

filepath = './emotesImages/'+filename+'.png'
exists = os.path.isfile(filepath)

if url == 'remove':
    if exists:
        os.remove(filepath)
else:
    if exists:
        print "File already exists!"
        sys.stdout.flush()
        exit
    else:
        f = open(filepath, 'wb')
        emote = urllib.urlopen(url).read()
        f.write(emote)
        f.close
        time.sleep(10)

#    width, height = imagesize.get(filepath)
#    print "image dimensions are",width, "x", height

#    if width > 40 or height > 40:
#        print "Incorrect dimensions! Make sure the image is smaller than 40x40 pixels"
#        os.remove(filepath)
#        sys.stdout.flush()
