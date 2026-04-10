#!/bin/bash
# AgriConnect AI - Linux/Mac Setup Script

set -e
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}"
echo "================================================"
echo "   AgriConnect AI - Setup Script"
echo "================================================"
echo -e "${NC}"

# 1. Database Setup
echo -e "${YELLOW}[1/4] Setting up MySQL database...${NC}"
echo "Please enter your MySQL root password:"
read -s MYSQL_PASS
mysql -u root -p"${MYSQL_PASS}" < schema.sql && echo -e "${GREEN}✅ Database created!${NC}" || {
  echo -e "${RED}❌ Database setup failed. Please check MySQL credentials.${NC}"
  exit 1
}

# 2. Backend Setup
echo -e "${YELLOW}[2/4] Setting up Python backend...${NC}"
cd backend

if ! command -v python3 &>/dev/null; then
  echo -e "${RED}❌ Python 3 not found. Install Python 3.9+ and rerun.${NC}"; exit 1
fi

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo -e "${GREEN}✅ Backend dependencies installed!${NC}"

# Update .env with MySQL password
sed -i "s|root:root@|root:${MYSQL_PASS}@|g" .env

cd ..

# 3. Frontend Setup
echo -e "${YELLOW}[3/4] Setting up React frontend...${NC}"
cd frontend
npm install --silent
echo -e "${GREEN}✅ Frontend dependencies installed!${NC}"
cd ..

echo ""
echo -e "${GREEN}================================================"
echo "   Setup Complete! 🎉"
echo "================================================${NC}"
echo ""
echo -e "${YELLOW}To start the application:${NC}"
echo ""
echo "  Terminal 1 (Backend):"
echo "  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "  Terminal 2 (Frontend):"
echo "  cd frontend && npm start"
echo ""
echo -e "${YELLOW}Default Admin Login:${NC}"
echo "  Email:    admin@agriconnect.com"
echo "  Password: admin123"
echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  API Docs: http://localhost:8000/docs"
