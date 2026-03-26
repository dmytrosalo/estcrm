from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_user
from app.models import Property, Unit
from app.schemas import UnitCreate, UnitResponse, UnitUpdate

router = APIRouter(prefix="/api/units", tags=["units"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[UnitResponse])
async def list_units(
    search: str | None = Query(None, description="Search across name, property address"),
    property_id: int | None = Query(None),
    is_vacant: bool | None = Query(None),
    rooms_min: int | None = Query(None),
    rooms_max: int | None = Query(None),
    rent_min: float | None = Query(None),
    rent_max: float | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Unit).options(selectinload(Unit.property))
    if search:
        term = f"%{search}%"
        query = query.outerjoin(Property).where(
            or_(
                Unit.name.ilike(term),
                Property.address.ilike(term),
            )
        )
    if property_id is not None:
        query = query.where(Unit.property_id == property_id)
    if is_vacant is not None:
        query = query.where(Unit.is_vacant == is_vacant)
    if rooms_min is not None:
        query = query.where(Unit.rooms >= rooms_min)
    if rooms_max is not None:
        query = query.where(Unit.rooms <= rooms_max)
    if rent_min is not None:
        query = query.where(Unit.cold_rent >= rent_min)
    if rent_max is not None:
        query = query.where(Unit.cold_rent <= rent_max)
    result = await db.execute(query.order_by(Unit.id))
    return result.scalars().unique().all()


@router.post("", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
async def create_unit(data: UnitCreate, db: AsyncSession = Depends(get_db)):
    unit = Unit(**data.model_dump())
    db.add(unit)
    await db.commit()
    await db.refresh(unit)
    result = await db.execute(select(Unit).options(selectinload(Unit.property)).where(Unit.id == unit.id))
    return result.scalar_one()


@router.get("/{unit_id}", response_model=UnitResponse)
async def get_unit(unit_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Unit).options(selectinload(Unit.property)).where(Unit.id == unit_id))
    unit = result.scalar_one_or_none()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return unit


@router.put("/{unit_id}", response_model=UnitResponse)
async def update_unit(unit_id: int, data: UnitUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Unit).where(Unit.id == unit_id))
    unit = result.scalar_one_or_none()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    for key, value in data.model_dump().items():
        setattr(unit, key, value)
    await db.commit()
    await db.refresh(unit)
    result = await db.execute(select(Unit).options(selectinload(Unit.property)).where(Unit.id == unit.id))
    return result.scalar_one()


@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_unit(unit_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Unit).where(Unit.id == unit_id))
    unit = result.scalar_one_or_none()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    await db.delete(unit)
    await db.commit()
