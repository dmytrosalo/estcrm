from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_user
from app.models import Lease, Tenant, Unit
from app.schemas import LeaseCreate, LeaseResponse, LeaseUpdate

router = APIRouter(prefix="/api/leases", tags=["leases"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[LeaseResponse])
async def list_leases(
    search: str | None = Query(None, description="Search across tenant name, unit name"),
    unit_id: int | None = Query(None),
    tenant_id: int | None = Query(None),
    is_active: bool | None = Query(None, description="True=active/open, False=expired"),
    is_index_linked: bool | None = Query(None),
    rent_min: float | None = Query(None),
    rent_max: float | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Lease).options(
        selectinload(Lease.unit).selectinload(Unit.property),
        selectinload(Lease.tenant),
    )
    if search:
        term = f"%{search}%"
        query = query.outerjoin(Tenant, Lease.tenant_id == Tenant.id).outerjoin(Unit, Lease.unit_id == Unit.id).where(
            or_(
                Tenant.first_name.ilike(term),
                Tenant.last_name.ilike(term),
                (Tenant.first_name + " " + Tenant.last_name).ilike(term),
                Unit.name.ilike(term),
            )
        )
    if unit_id is not None:
        query = query.where(Lease.unit_id == unit_id)
    if tenant_id is not None:
        query = query.where(Lease.tenant_id == tenant_id)
    if is_active is True:
        query = query.where(or_(Lease.end_date == None, Lease.end_date >= date.today()))
    elif is_active is False:
        query = query.where(Lease.end_date != None, Lease.end_date < date.today())
    if is_index_linked is not None:
        query = query.where(Lease.is_index_linked == is_index_linked)
    if rent_min is not None:
        query = query.where(Lease.monthly_rent >= rent_min)
    if rent_max is not None:
        query = query.where(Lease.monthly_rent <= rent_max)
    result = await db.execute(query.order_by(Lease.id))
    return result.scalars().unique().all()


@router.post("", response_model=LeaseResponse, status_code=status.HTTP_201_CREATED)
async def create_lease(data: LeaseCreate, db: AsyncSession = Depends(get_db)):
    lease = Lease(**data.model_dump())
    db.add(lease)
    await db.commit()
    await db.refresh(lease)
    result = await db.execute(
        select(Lease)
        .options(selectinload(Lease.unit).selectinload(Unit.property), selectinload(Lease.tenant))
        .where(Lease.id == lease.id)
    )
    return result.scalar_one()


@router.get("/{lease_id}", response_model=LeaseResponse)
async def get_lease(lease_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Lease)
        .options(selectinload(Lease.unit).selectinload(Unit.property), selectinload(Lease.tenant))
        .where(Lease.id == lease_id)
    )
    lease = result.scalar_one_or_none()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    return lease


@router.put("/{lease_id}", response_model=LeaseResponse)
async def update_lease(lease_id: int, data: LeaseUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lease).where(Lease.id == lease_id))
    lease = result.scalar_one_or_none()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    for key, value in data.model_dump().items():
        setattr(lease, key, value)
    await db.commit()
    await db.refresh(lease)
    result = await db.execute(
        select(Lease)
        .options(selectinload(Lease.unit).selectinload(Unit.property), selectinload(Lease.tenant))
        .where(Lease.id == lease.id)
    )
    return result.scalar_one()


@router.delete("/{lease_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lease(lease_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lease).where(Lease.id == lease_id))
    lease = result.scalar_one_or_none()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    await db.delete(lease)
    await db.commit()
