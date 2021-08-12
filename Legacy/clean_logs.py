import os

clean_kappabot = "sudo rm /home/pi/.forever/kappabot.log"
new_kappabot = "touch /home/pi/.forever/kappabot.log"

clean_yungbot = "sudo rm /home/pi/.forever/yungbot.log"
new_yungbot = "touch /home/pi/.forever/yungbot.log"

os.system(clean_kappabot)
os.system(new_kappabot)
os.system(clean_yungbot)
os.system(new_yungbot)