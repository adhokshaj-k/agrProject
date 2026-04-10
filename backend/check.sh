#!/bin/bash
cd /home/jackdaw/agr/backend
source venv/bin/activate
python gen_hash.py
echo "---"
mysql -u root -p'root' agriconnect -e "SELECT id, name, email, role, is_active FROM users;"
