#endpoints
from fastapi import APIRouter
from app.database import SessionLocal
from app.models import Item
from pydantic import BaseModel


router = APIRouter()

@router.get("/items-db")
def get_items_db():
    db = SessionLocal()
    items = db.query(Item).all()
    db.close()
    return items


class ItemCreate(BaseModel):
    name: str

@router.post("/items")
def create_item(name: str):
    db = SessionLocal()
    item = Item(name=name)
    db.add(item)
    db.commit()
    db.close()
    return {"status": "added"}