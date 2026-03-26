from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models import Tenant
from app.schemas import TenantCreate, TenantResponse, TenantUpdate

router = APIRouter(prefix="/api/tenants", tags=["tenants"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[TenantResponse])
async def list_tenants(
    search: str | None = Query(None, description="Search across name, email, phone"),
    schufa_min: float | None = Query(None),
    schufa_max: float | None = Query(None),
    has_guarantor: bool | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Tenant)
    if search:
        term = f"%{search}%"
        query = query.where(
            or_(
                Tenant.first_name.ilike(term),
                Tenant.last_name.ilike(term),
                Tenant.email.ilike(term),
                Tenant.phone.ilike(term),
                (Tenant.first_name + " " + Tenant.last_name).ilike(term),
            )
        )
    if schufa_min is not None:
        query = query.where(Tenant.schufa_score >= schufa_min)
    if schufa_max is not None:
        query = query.where(Tenant.schufa_score <= schufa_max)
    if has_guarantor is True:
        query = query.where(Tenant.guarantor != None)
    elif has_guarantor is False:
        query = query.where(Tenant.guarantor == None)
    result = await db.execute(query.order_by(Tenant.id))
    return result.scalars().all()


@router.post("", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(data: TenantCreate, db: AsyncSession = Depends(get_db)):
    tenant = Tenant(**data.model_dump())
    db.add(tenant)
    await db.commit()
    await db.refresh(tenant)
    return tenant


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(tenant_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.put("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(tenant_id: int, data: TenantUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    for key, value in data.model_dump().items():
        setattr(tenant, key, value)
    await db.commit()
    await db.refresh(tenant)
    return tenant


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(tenant_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    await db.delete(tenant)
    await db.commit()
