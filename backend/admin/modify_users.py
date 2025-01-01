from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()
outfile = 'new_users.csv'

with open("users.csv", 'r') as infile, open("new_users.csv", 'a') as outfile:
    for num, line in enumerate(infile):
        if num == 0:
            continue
        
        processed = line.strip()
        
        id = processed.split(',')[0]
        name = processed.split(',')[1].lower()
        
        user_id = name + id
        if num == 1:
            user_id = "administrator"
        
        password = bcrypt.generate_password_hash(user_id).decode('utf-8')
        if num == 1:
            password = bcrypt.generate_password_hash("porkribs6134").decode('utf-8')
        
        new_line = f"{processed},{user_id},false,false,{password}\n"
        outfile.write(new_line)
