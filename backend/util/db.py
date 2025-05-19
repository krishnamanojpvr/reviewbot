from motor.motor_asyncio import AsyncIOMotorClient
import os

async def connect_to_mongo():
    """
    Async MongoDB connection using Motor
    """
    mongo_uri = os.getenv("MONGO_URI")
    mongo_db_name = os.getenv("MONGO_DB_NAME")

    if not mongo_uri or not mongo_db_name:
        raise ValueError("MongoDB URI or database name missing in environment variables")

    # Async connection
    client = AsyncIOMotorClient(mongo_uri)
    db = client[mongo_db_name]

    users_collection = db["users"]
    products_collection = db["products"]

    return users_collection, products_collection