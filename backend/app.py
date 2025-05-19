from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from werkzeug.security import check_password_hash
from util.jwt_auth import create_access_token, get_current_user
from schemas.user import User
from dotenv import load_dotenv
from util.db import connect_to_mongo
from contextlib import asynccontextmanager
from util.scrape import scrape


load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    users_collection, info_doc_collection = await connect_to_mongo()
    app.state.users_collection = users_collection
    app.state.info_doc_collection = info_doc_collection
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/register")
async def register(request: Request):
    try:
        data = await request.json()
        if not data:
            raise HTTPException(
                status_code=400, detail="No input data provided")

        users_collection = request.app.state.users_collection
        existing_user = await users_collection.find_one({"username": data.get("username")})
        if existing_user:
            raise HTTPException(
                status_code=409, detail="Username already exists")

        user = User(
            username=data["username"],
            password=data["password"]
        )

        await users_collection.insert_one(user.model_dump())

        return {"message": "User registered successfully"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/login")
async def login(request: Request):
    try:
        data = await request.json()
        if not data:
            raise HTTPException(
                status_code=400, detail="No input data provided")

        users_collection = request.app.state.users_collection
        user_data = await users_collection.find_one({"username": data.get("username")})
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not check_password_hash(user_data["password"], data.get("password", "")):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token(user_data["username"])

        return {
            "access_token": token,
            "token_type": "bearer",
            "username": user_data["username"]
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/protected")
async def protected_route(current_user: str = Depends(get_current_user)):
    return {
        "message": f"Hello {current_user}!",
        "user": current_user
    }


@app.get("/mysearches")
async def get_products(request: Request, current_user: str = Depends(get_current_user)):
    try:
        users_collection = request.app.state.users_collection
        user = await users_collection.find_one({"username": current_user})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        products = user.get("recentSearches", [])
        return {"products": products}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/search")
async def search(request: Request, current_user: str = Depends(get_current_user)):
    try:
        data = await request.json()
        if not data:
            raise HTTPException(
                status_code=400, detail="No input data provided")

        url = data.get("url")
        if not url:
            raise HTTPException(status_code=400, detail="URL is required")
        if not url.startswith("http"):
            raise HTTPException(status_code=400, detail="Invalid URL format")
        response, status_code = await scrape(url)
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=response.get("error", "Unknown error"))
        print(response)
        

         

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    




if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
