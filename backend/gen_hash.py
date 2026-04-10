from passlib.context import CryptContext
ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
h = ctx.hash("admin123")
print(h)
print("verify:", ctx.verify("admin123", h))
