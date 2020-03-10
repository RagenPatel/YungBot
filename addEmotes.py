import sys
import os
import urllib
import requests
# import imagesize
import time

def get_content_type(url):
    return requests.head(url).headers['Content-Type']

filename = sys.argv[1]
url = str(sys.argv[2])

if url == 'remove':
    if os.path.isfile('./emotesImages/'+filename+'*'):
        os.remove('./emotesImages/'+filename+'*')
    else:
        exit(0)

if get_content_type(url) == "image/gif":
    filepath = './emotesImages/'+filename+'.gif'
else:
    filepath = './emotesImages/'+filename+'.png'
    
exists = os.path.isfile(filepath)

if exists:
    print("File already exists!")
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
