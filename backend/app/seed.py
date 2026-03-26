import asyncio
import random
from datetime import date, timedelta

from sqlalchemy import select

from app.auth import hash_password
from app.database import async_session, engine
from app.models import Base, Lease, Property, Tenant, Unit, User

GERMAN_STREETS = [
    "Berliner Str. 12", "Münchner Allee 45", "Hamburger Weg 7", "Kölner Ring 23",
    "Frankfurter Platz 3", "Stuttgarter Str. 89", "Düsseldorfer Ufer 14",
    "Leipziger Str. 56", "Dresdner Gasse 31", "Nürnberger Hof 8",
]

OWNERS = [
    "Schmidt Immobilien GmbH", "Müller Verwaltung AG", "Weber & Partner",
    "Fischer Hausverwaltung", "Wagner Grundbesitz", "Becker Immobilien",
    "Hoffmann & Söhne", "Schulz Wohnbau", "Koch Verwaltung", "Richter Estates",
]

FIRST_NAMES = ["Anna", "Max", "Sophie", "Lukas", "Marie", "Leon", "Emma", "Paul", "Lina", "Felix"]
LAST_NAMES = ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann"]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Check if data already exists
        existing = await db.execute(select(User))
        if existing.scalar_one_or_none():
            print("Database already seeded, skipping.")
            return

        # Create test user
        user = User(username="admin", hashed_password=hash_password("admin123"))
        db.add(user)

        # Create 10 properties
        properties = []
        for i in range(10):
            prop = Property(
                address=GERMAN_STREETS[i],
                owner=OWNERS[i],
                land_plot=f"Flurstück {random.randint(100, 999)}/{random.randint(1, 50)}",
            )
            db.add(prop)
            properties.append(prop)
        await db.flush()

        # Create 10 units (distributed across properties)
        units = []
        for i in range(10):
            unit = Unit(
                property_id=properties[i % len(properties)].id,
                name=f"Wohnung {i + 1}{chr(65 + i)}",
                living_area=round(random.uniform(35.0, 120.0), 1),
                rooms=random.randint(1, 5),
                cold_rent=round(random.uniform(400.0, 1500.0), 2),
                warm_rent=round(random.uniform(500.0, 1800.0), 2),
                is_vacant=(i % 3 == 0),  # ~3 vacant
            )
            db.add(unit)
            units.append(unit)
        await db.flush()

        # Create 10 tenants
        tenants = []
        for i in range(10):
            tenant = Tenant(
                first_name=FIRST_NAMES[i],
                last_name=LAST_NAMES[i],
                email=f"{FIRST_NAMES[i].lower()}.{LAST_NAMES[i].lower()}@email.de",
                phone=f"+49 {random.randint(151, 179)} {random.randint(1000000, 9999999)}",
                schufa_score=round(random.uniform(75.0, 99.9), 1),
                deposit=round(random.uniform(500.0, 3000.0), 2),
                guarantor=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}" if i % 3 == 0 else None,
            )
            db.add(tenant)
            tenants.append(tenant)
        await db.flush()

        # Create 10 leases
        for i in range(10):
            start = date.today() - timedelta(days=random.randint(30, 730))
            # Some leases expired (overdue), some active, some open-ended
            if i < 3:
                end = date.today() - timedelta(days=random.randint(1, 60))  # overdue
            elif i < 7:
                end = date.today() + timedelta(days=random.randint(30, 365))  # active
            else:
                end = None  # open-ended

            lease = Lease(
                unit_id=units[i].id,
                tenant_id=tenants[i].id,
                start_date=start,
                end_date=end,
                notice_period_months=random.choice([1, 2, 3]),
                is_index_linked=random.choice([True, False]),
                monthly_rent=units[i].cold_rent,
            )
            db.add(lease)

        await db.commit()
        print("Seeded: 1 user, 10 properties, 10 units, 10 tenants, 10 leases")


if __name__ == "__main__":
    asyncio.run(seed())
