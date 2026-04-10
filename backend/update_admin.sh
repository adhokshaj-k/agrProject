#!/bin/bash
mysql -u root -p'root' agriconnect -e "UPDATE users SET hashed_password='$2b\$12\$3KC/5jS7SzE0JGUgIM6QDev/cjeqNBWsCWG4y6EwylGHzOMCLtlS.' WHERE email='admin@agriconnect.com';"
mysql -u root -p'root' agriconnect -e "SELECT id, name, email, role, LEFT(hashed_password,20) AS hash_preview FROM users;"
