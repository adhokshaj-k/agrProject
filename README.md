# AgriConnect AI – Smart Agriculture Platform

> A full-stack, AI-powered agriculture platform for farmers, sellers, and administrators.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, React Router v6, Axios |
| **Backend** | Python 3.9+, FastAPI, SQLAlchemy ORM |
| **Database** | MySQL / MariaDB |
| **Auth** | JWT (python-jose), Bcrypt (passlib) |
| **Payments** | Razorpay (Demo/Test mode) |
| **AI** | Rule-based chatbot + Mock disease classifier (Pillow) |

---

## Project Structure

```
agr/
├── backend/
│   ├── app/
│   │   ├── main.py          ← FastAPI entry point
│   │   ├── config.py        ← Settings (env vars)
│   │   ├── database.py      ← SQLAlchemy engine & session
│   │   ├── models/          ← ORM models (users, products, etc.)
│   │   ├── schemas/         ← Pydantic request/response schemas
│   │   ├── auth/            ← JWT utils & role guards
│   │   ├── routes/          ← API route handlers
│   │   └── ai/
│   │       ├── disease_model.py  ← AI disease detection
│   │       └── chatbot.py        ← Rule-based chatbot
│   ├── requirements.txt
│   └── .env                 ← Environment variables
├── frontend/
│   └── src/
│       ├── App.js            ← Root with routing
│       ├── context/          ← Auth context
│       ├── services/         ← Axios API service
│       ├── components/       ← Navbar, etc.
│       └── pages/            ← All page components
├── schema.sql               ← MySQL schema + sample data
├── setup.sh                 ← Linux/Mac setup script
└── setup.bat                ← Windows setup script
```

---

## Quick Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL / MariaDB running on port 3306

### Step 1 – Database

```bash
mysql -u root -p < schema.sql
```

### Step 2 – Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Step 3 – Frontend

```bash
cd frontend
npm install
npm start
```

### URLs
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Default Login

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@agriconnect.com` | `admin123` |
| Farmer | Register via `/register` | your choice |
| Seller | Register via `/register` | your choice (needs approval) |

---

## AI Modules

### 1. Crop Disease Detection (`POST /api/ai/disease-detect`)

**How it works (Option B – Mock Classifier):**

A mock intelligent classifier is used (no GPU/TensorFlow required):

```
Input: Plant leaf image (JPG/PNG/WEBP)
├── Image validated with Pillow (size, format, corruption check)
├── Weighted random selection from disease database:
│   ├── Healthy         (28% probability → confidence: 88–97%)
│   ├── Leaf Blight     (20% probability → confidence: 80–94%)
│   ├── Powdery Mildew  (18% probability → confidence: 80–94%)
│   ├── Rust            (18% probability → confidence: 80–94%)
│   ├── Early Blight    (8%  probability → confidence: 80–94%)
│   └── Bacterial Spot  (8%  probability → confidence: 80–94%)
├── Returns: disease_name, confidence (0.80–0.97), treatment advice
└── Stored in: disease_predictions table
```

**To upgrade to a real TensorFlow model:**
Replace `predict_disease()` in `backend/app/ai/disease_model.py`:
```python
# Replace mock logic with:
model = tf.keras.models.load_model('disease_model.h5')
img_array = preprocess_image(image_data)
predictions = model.predict(img_array)
```

---

### 2. Agriculture AI Chatbot (`POST /api/ai/chat`)

**Rule-based intelligent system:**

| Keyword Match | Response Category |
|---|---|
| `yellow`, `yellowing`, `chlorosis` | Nitrogen deficiency advice |
| `pest`, `insect`, `aphid`, `worm` | Pesticide & pest management |
| `fungus`, `blight`, `rust`, `mildew` | Fungicide treatment guide |
| `season`, `crop`, `kharif`, `rabi` | Seasonal crop recommendations |
| `water`, `irrigation`, `drip` | Water management advice |
| `price`, `mandi`, `MSP`, `market` | Market price information |
| `fertilizer`, `npk`, `urea` | Fertilizer guide |
| `soil`, `pH`, `clay` | Soil health management |
| *(no match)* | General farming tips + menu |

All conversations stored in `chat_history` table.

---

## Razorpay Demo Payment

The payment system is implemented in **demo/test mode**:

1. `POST /api/payments/create-order` → Creates order with mock `order_xxx` ID
2. Frontend displays a mock Razorpay gateway UI
3. `POST /api/payments/verify` → Always succeeds in demo mode
4. Transaction stored in `payments` table with `status = success`

**To enable real payments:**
1. Get your Razorpay Key ID & Secret from [razorpay.com](https://razorpay.com)
2. Update `.env`: `RAZORPAY_KEY_ID=rzp_live_...`
3. Add `razorpay` to `requirements.txt`
4. Replace mock logic with actual Razorpay SDK calls

---

## Database Tables

| Table | Purpose |
|---|---|
| `users` | All users (farmers, sellers, admins) |
| `products` | Marketplace product listings |
| `machines` | Machinery rental listings |
| `services` | Agricultural service listings |
| `bookings` | Booking records for machines/services |
| `payments` | Payment transaction records |
| `reviews` | Product reviews and ratings |
| `disease_predictions` | AI disease detection results |
| `chat_history` | AI chatbot conversation logs |

---

## Security Features

- Passwords hashed with **bcrypt** (cost factor 12)
- **JWT** tokens with configurable expiry (default: 60 min)
- **Role-based access control** (farmer / seller / admin)
- File upload validation (size limit, extension whitelist, image corruption check)
- Input validation via **Pydantic** schemas

---

## API Endpoints Summary

```
Authentication:
  POST /api/auth/register
  POST /api/auth/login
  GET  /api/auth/me

Marketplace:
  GET/POST   /api/products/
  GET/PUT/DELETE /api/products/{id}

Machinery:
  GET/POST   /api/machines/
  POST       /api/machines/{id}/book

Services:
  GET/POST   /api/services/
  POST       /api/services/{id}/book

Payments:
  POST /api/payments/create-order
  POST /api/payments/verify
  GET  /api/payments/my

Admin:
  GET   /api/admin/users
  PATCH /api/admin/users/{id}/approve
  GET   /api/admin/stats
  GET   /api/admin/transactions

AI:
  POST /api/ai/disease-detect
  GET  /api/ai/disease-history
  POST /api/ai/chat
  GET  /api/ai/chat-history
```

Full interactive API docs at: **http://localhost:8000/docs**

---

##  Academic Context

This project was built as a final-year B.Tech Computer Science submission demonstrating:

- **Full-stack development** with React + FastAPI
- **RESTful API design** with proper HTTP methods and status codes
- **Database design** with normalized schema, FK constraints, and indexes
- **Authentication & Authorization** using JWT and RBAC
- **AI integration** — rule-based NLP chatbot and image classification
- **Payment gateway integration** with Razorpay
- **Clean code practices** — modular structure, separated concerns, env-based config

this is new thing
