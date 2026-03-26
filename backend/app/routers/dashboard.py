from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_user
from app.models import Lease, Property, Tenant, Unit
from app.schemas import ChartItem, DashboardResponse

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=DashboardResponse)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    today = date.today()

    # Vacant units
    vacant_result = await db.execute(
        select(Unit).options(selectinload(Unit.property)).where(Unit.is_vacant == True).order_by(Unit.id)
    )
    vacant_units = vacant_result.scalars().all()

    # Overdue leases
    overdue_result = await db.execute(
        select(Lease)
        .options(selectinload(Lease.unit).selectinload(Unit.property), selectinload(Lease.tenant))
        .where(Lease.end_date != None, Lease.end_date < today)
        .order_by(Lease.end_date)
    )
    overdue_leases = overdue_result.scalars().all()

    # Counts
    total_properties = (await db.execute(select(func.count(Property.id)))).scalar() or 0
    total_units = (await db.execute(select(func.count(Unit.id)))).scalar() or 0
    total_tenants = (await db.execute(select(func.count(Tenant.id)))).scalar() or 0

    # Rent revenue by property (sum of cold_rent for occupied units)
    rent_rows = (await db.execute(
        select(Property.address, func.sum(Unit.cold_rent))
        .join(Unit, Unit.property_id == Property.id)
        .where(Unit.is_vacant == False)
        .group_by(Property.address)
        .order_by(func.sum(Unit.cold_rent).desc())
    )).all()
    rent_by_property = [ChartItem(name=r[0].split(",")[0].split(" ")[0:3] and r[0][:20], value=round(r[1], 2)) for r in rent_rows]

    # Units count by property
    unit_rows = (await db.execute(
        select(Property.address, func.count(Unit.id))
        .join(Unit, Unit.property_id == Property.id)
        .group_by(Property.address)
        .order_by(func.count(Unit.id).desc())
    )).all()
    units_by_property = [ChartItem(name=r[0][:20], value=r[1]) for r in unit_rows]

    # Schufa score distribution
    schufa_rows = (await db.execute(select(Tenant.schufa_score))).scalars().all()
    green = sum(1 for s in schufa_rows if s >= 97.5)
    yellow = sum(1 for s in schufa_rows if 90 <= s < 97.5)
    red = sum(1 for s in schufa_rows if s < 90)
    schufa_distribution = [
        ChartItem(name="Sehr gut (≥97.5%)", value=green),
        ChartItem(name="Gut (90–97.5%)", value=yellow),
        ChartItem(name="Risiko (<90%)", value=red),
    ]

    # Occupancy
    occupied = total_units - len(vacant_units)
    occupancy = [
        ChartItem(name="Vermietet", value=occupied),
        ChartItem(name="Leer", value=len(vacant_units)),
    ]

    # Revenue
    monthly_rev = (await db.execute(
        select(func.sum(Lease.monthly_rent))
        .where(or_(Lease.end_date == None, Lease.end_date >= today))
    )).scalar() or 0
    potential_rev = (await db.execute(select(func.sum(Unit.cold_rent)))).scalar() or 0

    return DashboardResponse(
        vacant_units=vacant_units,
        overdue_leases=overdue_leases,
        total_properties=total_properties,
        total_units=total_units,
        total_tenants=total_tenants,
        vacant_count=len(vacant_units),
        overdue_count=len(overdue_leases),
        rent_by_property=rent_by_property,
        units_by_property=units_by_property,
        schufa_distribution=schufa_distribution,
        occupancy=occupancy,
        monthly_revenue=round(monthly_rev, 2),
        potential_revenue=round(potential_rev, 2),
    )
