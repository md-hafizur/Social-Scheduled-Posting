from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
import json

from ..database import get_db
from ..schemas import CustomizationCreate, CustomizationResponse
from .. import crud

router = APIRouter()

@router.post("/customizations", response_model=CustomizationResponse)
def create_product_customization(
    customization: CustomizationCreate,
    db: Session = Depends(get_db)
):
    """Create a new product customization"""
    try:
        db_customization = crud.create_customization(db, customization, customization.image_data)
        
        # Parse JSON fields for response
        if isinstance(db_customization.text_position, str):
            db_customization.text_position = json.loads(db_customization.text_position)
        if isinstance(db_customization.text_style, str):
            db_customization.text_style = json.loads(db_customization.text_style)
        
        return db_customization
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating customization: {str(e)}")

@router.get("/customizations", response_model=List[CustomizationResponse])
def get_product_customizations(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """Get all product customizations"""
    customizations = crud.get_customizations(db, skip=skip, limit=limit)
    
    # Parse JSON fields for each customization
    for customization in customizations:
        if isinstance(customization.text_position, str):
            try:
                customization.text_position = json.loads(customization.text_position)
            except json.JSONDecodeError:
                customization.text_position = {"x": 50, "y": 50}
        
        if isinstance(customization.text_style, str):
            try:
                customization.text_style = json.loads(customization.text_style)
            except json.JSONDecodeError:
                customization.text_style = {"fontSize": 16, "color": "#000000", "fontFamily": "Arial"}
    
    return customizations