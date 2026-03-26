from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models import Property
from app.schemas import PropertyCreate, PropertyResponse, PropertyUpdate

router = APIRouter(prefix="/api/properties", tags=["properties"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[PropertyResponse])
async def list_properties(
    search: str | None = Query(None, description="Search across address, owner, land_plot"),
    owner: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Property)
    if search:
        term = f"%{search}%"
        query = query.where(
            or_(
                Property.address.ilike(term),
                Property.owner.ilike(term),
                Property.land_plot.ilike(term),
            )
        )
    if owner:
        query = query.where(Property.owner.ilike(f"%{owner}%"))
    result = await db.execute(query.order_by(Property.id))
    return result.scalars().all()


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(data: PropertyCreate, db: AsyncSession = Depends(get_db)):
    prop = Property(**data.model_dump())
    db.add(prop)
    await db.commit()
    await db.refresh(prop)
    return prop


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(property_id: int, data: PropertyUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    for key, value in data.model_dump().items():
        setattr(prop, key, value)
    await db.commit()
    await db.refresh(prop)
    return prop


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(property_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    await db.delete(prop)
    await db.commit()
