from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from werkzeug.security import check_password_hash
from util.jwt_auth import create_access_token, get_current_user
from schemas.user import User, RecentSearch, ReviewSummary, ProductDetails, SentimentSummary, Document
from dotenv import load_dotenv
from util.db import connect_to_mongo
from contextlib import asynccontextmanager
from util.search_pipeline import SearchPipeline
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from models.query_handler import handle_query
import re
import os


load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    users_collection = await connect_to_mongo()
    app.state.users_collection = users_collection
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


@app.post("/api/register")
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

        return {"message": "User registered successfully", "success": True}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/login")
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
        response = []
        for search in user_data.get("recentSearches", []):
            response.append({
                "product_id": search.get("product_id"),
                "url": search.get("url"),
                "name": search.get("product_details", {}).get("name"),
                "image": search.get("product_details", {}).get("image"),
            })

        return {
            "access_token": token,
            "username": user_data["username"],
            "recents": response,
            "message": "Login successful",
            "success": True
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/protected")
async def protected_route(current_user: str = Depends(get_current_user)):
    return {
        "message": f"Hello {current_user}!",
        "user": current_user
    }


@app.get("/api/mysearches")
async def get_products(request: Request, current_user: str = Depends(get_current_user)):
    try:
        users_collection = request.app.state.users_collection
        user = await users_collection.find_one({"username": current_user})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        products = []
        for search in user.get("recentSearches", []):
            products.append({
                "product_id": search.get("product_id"),
                "url": search.get("url"),
                "name": search.get("product_details", {}).get("name"),
                "image": search.get("product_details", {}).get("image"),
            })
        return {"products": products}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/delete")
async def delete_product(request: Request, current_user: str = Depends(get_current_user)):
    try:
        data = await request.json()
        if not data:
            raise HTTPException(
                status_code=400, detail="No input data provided")

        product_id = data.get("product_id")
        if not product_id:
            raise HTTPException(
                status_code=400, detail="Product ID is required")

        users_collection = request.app.state.users_collection
        user = await users_collection.find_one({"username": current_user})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        recent_searches = user.get("recentSearches", [])
        updated_searches = [search for search in recent_searches if search.get(
            "product_id") != product_id]

        await users_collection.update_one(
            {"username": current_user},
            {"$set": {"recentSearches": updated_searches}},
            upsert=True
        )

        return {"message": "Product deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/product/{product_id}")
async def get_product(request: Request, product_id: str, current_user: str = Depends(get_current_user)):
    """Endpoint to get product details by product ID"""
    try:
        users_collection = request.app.state.users_collection
        user = await users_collection.find_one({"username": current_user})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        response = {}
        for recent_search in user.get("recentSearches", []):
            if recent_search.get("product_id") == product_id:
                response = {
                    "product_id": recent_search["product_id"],
                    "url": recent_search["url"],
                    "product_details": recent_search["product_details"],
                    "summary_details": recent_search["review_summary"],
                    "sentiment_details": recent_search["sentiment_summary"],
                }
                return JSONResponse(content=response, status_code=200)
        if not response:
            return JSONResponse(content={"message": "Product not found","success": False})
        raise HTTPException(
            status_code=404, detail="Product not found in recent searches")

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/search")
async def search(request: Request, current_user: str = Depends(get_current_user)):
    """Endpoint for product search and analysis"""
    try:
        data = await request.json()
        if not data:
            raise HTTPException(
                status_code=400, detail="No input data provided")

        url = data.get("url")
        if not url:
            raise HTTPException(status_code=400, detail="URL is required")
        match = re.search(r"/dp/([A-Z0-9]{10})", url)
        if match:
            product_id = match.group(1)
        else:
            raise HTTPException(status_code=400, detail="Invalid Amazon URL")

        users_collection = request.app.state.users_collection
        existing_user = await users_collection.find_one({"username": current_user})
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")

        for recent_search in existing_user.get("recentSearches", []):
            if recent_search.get("product_id") == product_id:
                response = {
                    "product_id": recent_search["product_id"],
                    "url": recent_search["url"],
                    "product_details": recent_search["product_details"],
                    "summary_details": recent_search["review_summary"],
                    "sentiment_details": recent_search["sentiment_summary"],
                }
                return JSONResponse(content=response, status_code=200)

        if not url.startswith(("http://", "https://")):
            raise HTTPException(status_code=400, detail="Invalid URL format")

        pipeline = SearchPipeline(url)
        response, status_code = await pipeline.execute()

        if status_code != 200:
            return JSONResponse(content=response, status_code=status_code)

        response["product_id"] = product_id
        response["url"] = url

        recent_search = RecentSearch(
            product_id=product_id,
            url=url,
            product_details=ProductDetails(**response["product_details"]),
            review_summary=ReviewSummary(**response["summary_details"]),
            sentiment_summary=SentimentSummary(
                **response["sentiment_details"]),
            info_docs=[Document(**doc)
                       for doc in response.get("info_docs", [])]
        )

        recent_searches = existing_user.get("recentSearches", [])
        if len(recent_searches) >= int(os.getenv("MAX_RECENT_SEARCHES", 5)):
            recent_searches.pop(0)

        recent_searches.append(recent_search.model_dump())

        await users_collection.update_one(
            {"username": current_user},
            {"$set": {"recentSearches": recent_searches}},
            upsert=True
        )

        response.pop("info_docs", None)
        return JSONResponse(content=jsonable_encoder(response))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/query")
async def query(request: Request, current_user: str = Depends(get_current_user)):
    """Endpoint for querying the database"""
    try:
        data = await request.json()
        if not data:
            raise HTTPException(
                status_code=400, detail="No input data provided")
        product_id = data.get("product_id")
        users_collection = request.app.state.users_collection
        query_response = await handle_query(
            data.get("query"),
            product_id,
            users_collection,
            current_user
        )
        if not query_response:
            raise HTTPException(status_code=404, detail="No response found")
        return JSONResponse(content=jsonable_encoder(query_response))

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
    # to run, use the command:
    # uvicorn app:app --host 0.0.0.0 --port 5000 --reload
    # to run in production, use the command:
    # uvicorn app:app --host
